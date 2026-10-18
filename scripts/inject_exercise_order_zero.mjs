import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split(/\r?\n/).filter(l => l.includes('=')).map(l => {
  const [k, ...v] = l.split('=');
  return [k.trim(), v.join('=').trim()];
}));

const headers = {
  'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
  'Accept-Profile': 'v2',
  'Content-Profile': 'v2',
  'Content-Type': 'application/json',
};

function normalizeWarmup(text) {
  if (!text) return 'CALENTAMIENTO';
  let t = text.trim().toUpperCase();
  t = t.replace('CALENTAMIENMTO', 'CALENTAMIENTO');
  t = t.replace(/\+ABD\s*/g, '+ ABD ');
  t = t.replace(/\+ ABD(\d)/g, '+ ABD $1');
  return t.trim();
}

async function main() {
  console.log('🚀 Iniciando inyección de EJERCICIO 0 en v2.plan_workouts...');

  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/plan_workouts?select=id,week_number,day_number,warmup_instructions,exercises&limit=1000`, { headers });
  const workouts = await res.json();
  console.log(`Fetched ${workouts.length} workouts from Supabase.`);

  let updatedCount = 0;

  for (const w of workouts) {
    if (!Array.isArray(w.exercises)) continue;

    // Check if order: 0 already exists
    const existingZero = w.exercises.find(e => e.order === 0);
    const warmupName = normalizeWarmup(w.warmup_instructions);
    const slugBase = warmupName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const exerciseZero = {
      order: 0,
      name: warmupName,
      category: 'CALENTAMIENTO',
      exercise_slug: `${slugBase}-o0`,
      series: null,
      reps: null,
      notes: 'Activación previa al entrenamiento',
      video_path: null,
      video_code: null,
      thumbnail_url: null,
      rpe: null
    };

    let updatedList;
    if (existingZero) {
      // Update existing order 0
      updatedList = w.exercises.map(e => e.order === 0 ? { ...e, ...exerciseZero } : e);
    } else {
      // Prepend order 0 and re-sort
      updatedList = [exerciseZero, ...w.exercises].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    const patchRes = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/plan_workouts?id=eq.${w.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ 
        exercises: updatedList,
        warmup_instructions: warmupName // also normalize warmup_instructions column
      })
    });

    if (patchRes.ok) {
      updatedCount++;
    } else {
      console.error(`Error updating workout ${w.id}: ${patchRes.status}`);
    }
  }

  console.log(`\n🎉 Completado exitosamente:`);
  console.log(`- Rutinas actualizadas con Ejercicio 0: ${updatedCount} de ${workouts.length}`);
}

main().catch(console.error);
