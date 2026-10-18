import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SOURCE_DIR = 'C:\\Users\\matil\\.gemini\\antigravity\\scratch\\Scale\\apps\\vteamfit-2026-2027\\staging\\plan_padel';
const TARGET_DIR = path.join(SOURCE_DIR, 'thumbnails');
const APP_THUMBNAILS_DIR = path.resolve('thumbnails');
const APP_PUBLIC_THUMBNAILS_DIR = path.resolve('public', 'images', 'thumbnails');

// Ensure all target directories exist
for (const dir of [TARGET_DIR, APP_THUMBNAILS_DIR, APP_PUBLIC_THUMBNAILS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function processVideo(videoFile, index, total) {
  const videoPath = path.join(SOURCE_DIR, videoFile);
  const baseName = path.parse(videoFile).name;
  const outPath = path.join(TARGET_DIR, `${baseName}.jpg`);

  try {
    // If thumbnail already exists and is valid size, copy to project dirs
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      fs.copyFileSync(outPath, path.join(APP_THUMBNAILS_DIR, `${baseName}.jpg`));
      fs.copyFileSync(outPath, path.join(APP_PUBLIC_THUMBNAILS_DIR, `${baseName}.jpg`));
      return { file: videoFile, success: true, cached: true };
    }

    // Extract first frame at 0.5s (high quality jpeg, q:v 2)
    const cmd = `ffmpeg -ss 00:00:00.500 -i "${videoPath}" -vframes 1 -q:v 2 "${outPath}" -y -loglevel error`;
    await execAsync(cmd, { timeout: 15000 });

    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      fs.copyFileSync(outPath, path.join(APP_THUMBNAILS_DIR, `${baseName}.jpg`));
      fs.copyFileSync(outPath, path.join(APP_PUBLIC_THUMBNAILS_DIR, `${baseName}.jpg`));
      const sizeKb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`[${index + 1}/${total}] ✅ ${baseName}.jpg (${sizeKb} KB)`);
      return { file: videoFile, success: true };
    } else {
      // Retry seeking at 0.1s
      const retryCmd = `ffmpeg -ss 00:00:00.100 -i "${videoPath}" -vframes 1 -q:v 2 "${outPath}" -y -loglevel error`;
      await execAsync(retryCmd, { timeout: 15000 });
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
        fs.copyFileSync(outPath, path.join(APP_THUMBNAILS_DIR, `${baseName}.jpg`));
        fs.copyFileSync(outPath, path.join(APP_PUBLIC_THUMBNAILS_DIR, `${baseName}.jpg`));
        return { file: videoFile, success: true };
      }
      throw new Error('File not created or empty');
    }
  } catch (err) {
    console.error(`[${index + 1}/${total}] ❌ Error on ${videoFile}: ${err.message}`);
    return { file: videoFile, success: false, error: err.message };
  }
}

async function main() {
  console.log(`Scanning videos in: ${SOURCE_DIR}`);
  const allFiles = fs.readdirSync(SOURCE_DIR);
  const mp4Videos = allFiles.filter(f => f.toLowerCase().endsWith('.mp4'));

  console.log(`Found ${mp4Videos.length} videos to process.`);
  console.log(`Saving thumbnails to: ${TARGET_DIR}\n`);

  const CONCURRENCY = 8;
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < mp4Videos.length; i += CONCURRENCY) {
    const chunk = mp4Videos.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map((file, idx) => processVideo(file, i + idx, mp4Videos.length))
    );
    for (const r of results) {
      if (r.success) successful++;
      else failed++;
    }
  }

  const generatedCount = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.jpg')).length;

  console.log('\n=============================================');
  console.log('🎉 THUMBNAIL GENERATION COMPLETED:');
  console.log(`Total MP4 videos: ${mp4Videos.length}`);
  console.log(`Successfully generated: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total JPG files in ${TARGET_DIR}: ${generatedCount}`);
  console.log('=============================================\n');
}

main().catch(console.error);
