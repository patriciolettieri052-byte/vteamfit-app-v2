import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split(/\r?\n/).filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim()];
}));

const CDN_BASE = env.NEXT_PUBLIC_CDN_URL || 'https://vteamfit-oct-26.b-cdn.net';
const THUMBNAILS_DIR = path.resolve('thumbnails');
const PUBLIC_THUMBNAILS_DIR = path.resolve('public', 'images', 'thumbnails');

if (!fs.existsSync(THUMBNAILS_DIR)) fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_THUMBNAILS_DIR)) fs.mkdirSync(PUBLIC_THUMBNAILS_DIR, { recursive: true });

async function getVideosList() {
  const headers = {
    'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
    'Accept-Profile': 'v2',
  };

  const pwRes = await fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/plan_workouts?select=id,exercises&limit=1000', { headers });
  const workouts = await pwRes.json();

  const videoPaths = new Set();
  for (const w of workouts) {
    if (Array.isArray(w.exercises)) {
      for (const ex of w.exercises) {
        if (ex.video_path && typeof ex.video_path === 'string' && ex.video_path.trim()) {
          videoPaths.add(ex.video_path.trim());
        }
      }
    }
  }

  // Also query v2.exercises to make sure we don't miss any that are hosted on Bunny
  const exRes = await fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/exercises?select=id,name,video_path&limit=1000', { headers });
  const exercises = await exRes.json();
  for (const ex of exercises) {
    if (ex.video_path && ex.video_path.trim()) {
      videoPaths.add(ex.video_path.trim());
    }
  }

  return [...videoPaths];
}

async function captureThumbnail(videoPath, index, total) {
  const cleanPath = videoPath.startsWith('/') ? videoPath : '/' + videoPath;
  const videoUrl = CDN_BASE + cleanPath;
  const parsed = path.parse(cleanPath);
  const baseName = parsed.name; // e.g. "hombros-press-frontal-con-barra_d1_n42"
  const outputThumb = path.join(THUMBNAILS_DIR, `${baseName}.jpg`);
  const publicThumb = path.join(PUBLIC_THUMBNAILS_DIR, `${baseName}.jpg`);

  // Check if already captured and non-empty
  if (fs.existsSync(outputThumb) && fs.statSync(outputThumb).size > 1000) {
    if (!fs.existsSync(publicThumb)) {
      fs.copyFileSync(outputThumb, publicThumb);
    }
    console.log(`[${index + 1}/${total}] ⏩ Already exists: ${baseName}.jpg`);
    return { path: videoPath, success: true, cached: true };
  }

  // First verify CDN HEAD returns 200
  try {
    const headRes = await fetch(videoUrl, { method: 'HEAD' });
    if (headRes.status !== 200) {
      console.log(`[${index + 1}/${total}] ⚠️ CDN HTTP ${headRes.status}: ${cleanPath}`);
      return { path: videoPath, success: false, reason: `HTTP_${headRes.status}` };
    }
  } catch (err) {
    console.log(`[${index + 1}/${total}] ❌ CDN fetch error: ${cleanPath} - ${err.message}`);
    return { path: videoPath, success: false, reason: err.message };
  }

  // Run FFmpeg to extract first frame at 0.5s (or fallback to 0.1s)
  const cmd = `ffmpeg -ss 00:00:00.500 -i "${videoUrl}" -vframes 1 -q:v 2 "${outputThumb}" -y`;
  try {
    await execAsync(cmd, { timeout: 30000 });
    if (fs.existsSync(outputThumb) && fs.statSync(outputThumb).size > 1000) {
      fs.copyFileSync(outputThumb, publicThumb);
      const sizeKb = Math.round(fs.statSync(outputThumb).size / 1024);
      console.log(`[${index + 1}/${total}] ✅ Captured (${sizeKb} KB): ${baseName}.jpg`);
      return { path: videoPath, success: true };
    } else {
      throw new Error('Output file empty or missing');
    }
  } catch (err) {
    // Retry seeking at 0.1s
    const retryCmd = `ffmpeg -ss 00:00:00.100 -i "${videoUrl}" -vframes 1 -q:v 2 "${outputThumb}" -y`;
    try {
      await execAsync(retryCmd, { timeout: 30000 });
      if (fs.existsSync(outputThumb) && fs.statSync(outputThumb).size > 1000) {
        fs.copyFileSync(outputThumb, publicThumb);
        const sizeKb = Math.round(fs.statSync(outputThumb).size / 1024);
        console.log(`[${index + 1}/${total}] ✅ Captured on retry (${sizeKb} KB): ${baseName}.jpg`);
        return { path: videoPath, success: true };
      }
    } catch (retryErr) {
      console.log(`[${index + 1}/${total}] ❌ Failed ffmpeg for: ${cleanPath} - ${retryErr.message}`);
      return { path: videoPath, success: false, reason: retryErr.message };
    }
  }

  return { path: videoPath, success: false, reason: 'Unknown error' };
}

async function main() {
  console.log('🎬 Starting BunnyCDN Video Thumbnail Extraction...');
  console.log('CDN Base URL:', CDN_BASE);
  console.log('Destination folders:');
  console.log('  1.', THUMBNAILS_DIR);
  console.log('  2.', PUBLIC_THUMBNAILS_DIR);

  const allVideos = await getVideosList();
  console.log(`\nFound ${allVideos.length} candidate video paths in Supabase.\n`);

  const CONCURRENCY = 6;
  const results = [];
  let successful = 0;
  let skipped404 = 0;
  let failed = 0;

  for (let i = 0; i < allVideos.length; i += CONCURRENCY) {
    const chunk = allVideos.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map((vPath, idx) => captureThumbnail(vPath, i + idx, allVideos.length))
    );
    for (const r of chunkResults) {
      results.push(r);
      if (r.success) successful++;
      else if (r.reason && r.reason.startsWith('HTTP_404')) skipped404++;
      else failed++;
    }
  }

  console.log('\n=============================================');
  console.log('🎉 THUMBNAIL GENERATION SUMMARY:');
  console.log(`- Total candidate paths checked: ${allVideos.length}`);
  console.log(`- Successfully captured in thumbnails/: ${successful}`);
  console.log(`- Skipped (HTTP 404 not on CDN): ${skipped404}`);
  console.log(`- Failures: ${failed}`);
  console.log(`- Files saved in "${THUMBNAILS_DIR}": ${fs.readdirSync(THUMBNAILS_DIR).length}`);
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('Fatal error in thumbnail generator:', err);
  process.exit(1);
});
