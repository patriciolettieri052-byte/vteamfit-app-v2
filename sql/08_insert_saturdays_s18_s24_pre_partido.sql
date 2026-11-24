-- ==============================================================================
-- VTeamFit 2026: Completar Sábados S18–S24 de Plan Pádel con Ejercicio 0
-- Objetivo: Insertar los 7 Sábados faltantes (Semanas 18 a 24, Día 6) con su
-- Ejercicio 0 correspondiente dentro de BLOQUE: PRE-PARTIDO.
-- ==============================================================================

-- Forward (idempotente si no existen aún):
INSERT INTO v2.plan_workouts (
  plan_id, week_number, day_number, day_name, focus,
  warmup_instructions, is_rest_day, exercises
)
SELECT
  'plan_padel',
  v.week_number,
  6,
  'SABADO',
  'PREVENIR + CARDIO',
  v.ex0_name,
  false,
  jsonb_build_array(
    jsonb_build_object(
      'order', 0,
      'name', v.ex0_name,
      'category', 'PRE-PARTIDO',
      'exercise_slug', v.slug,
      'series', null,
      'reps', null,
      'rpe', null,
      'notes', 'Activación previa al entrenamiento',
      'video_code', null,
      'video_path', '/calentamiento.mp4',
      'thumbnail_url', null
    )
  )
FROM (VALUES
  (18, 'CALENTAMIENTO + ABD 4', 'calentamiento-abd-4-o0'),
  (19, 'CALENTAMIENTO + ABD 2', 'calentamiento-abd-2-o0'),
  (20, 'CALENTAMIENTO + ABD 5', 'calentamiento-abd-5-o0'),
  (21, 'CALENTAMIENTO + ABD 3', 'calentamiento-abd-3-o0'),
  (22, 'CALENTAMIENTO + ABD 1', 'calentamiento-abd-1-o0'),
  (23, 'CALENTAMIENTO + ABD 4', 'calentamiento-abd-4-o0'),
  (24, 'CALENTAMIENTO + ABD 2', 'calentamiento-abd-2-o0')
) AS v(week_number, ex0_name, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM v2.plan_workouts pw
  WHERE pw.plan_id = 'plan_padel'
    AND pw.week_number = v.week_number
    AND pw.day_number = 6
);

-- Rollback:
-- DELETE FROM v2.plan_workouts
-- WHERE plan_id = 'plan_padel' AND day_number = 6 AND week_number BETWEEN 18 AND 24;
