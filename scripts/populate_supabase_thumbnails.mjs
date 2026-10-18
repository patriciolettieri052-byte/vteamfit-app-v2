import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split(/\r?\n/).filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim()];
}));

const CDN_BASE = env.NEXT_PUBLIC_CDN_URL || 'https://vteamfit-oct-26.b-cdn.net';

const headers = {
  'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
  'Accept-Profile': 'v2',
  'Content-Profile': 'v2',
  'Content-Type': 'application/json',
};

async function main() {
  console.log('🚀 Populating thumbnail_url into v2.plan_workouts in Supabase...');

  const pwRes = await fetch(env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/plan_workouts?select=id,exercises&limit=1000', { headers });
  const workouts = await pwRes.json();
  console.log(`Fetched ${workouts.length} workouts from v2.plan_workouts.`);

  let updatedCount = 0;
  let totalExercisesTagged = 0;

  for (const w of workouts) {
    if (!Array.isArray(w.exercises)) continue;

    let modified = false;
    const updatedExercises = w.exercises.map(ex => {
      if (ex.video_path && ex.video_path.trim()) {
        const cleanName = ex.video_path.replace(/^\//, '').replace(/\.mp4$/i, '').trim();
        const thumbUrl = `${CDN_BASE}/thumbnails/${cleanName}.jpg`;
        if (ex.thumbnail_url !== thumbUrl) {
          modified = true;
          totalExercisesTagged++;
          return { ...ex, thumbnail_url: thumbUrl };
        }
      }
      return ex;
    });

    if (modified) {
      const patchRes = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/plan_workouts?id=eq.${w.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ exercises: updatedExercises })
      });
      if (patchRes.ok) {
        updatedCount++;
      } else {
        console.error(`Error updating workout ${w.id}: status ${patchRes.status}`);
      }
    }
  }

  console.log(`\n✅ Finished populating Supabase:`);
  console.log(`- Workouts updated: ${updatedCount}`);
  console.log(`- Exercises tagged with thumbnail_url: ${totalExercisesTagged}`);
}

main().catch(console.error);
