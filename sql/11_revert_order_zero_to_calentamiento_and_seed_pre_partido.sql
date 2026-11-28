-- ==============================================================================
-- VTeamFit 2026: Revertir Ejercicio 0 diario a BLOQUE: CALENTAMIENTO y crear
-- ejercicio independiente 'Calentamiento Pre-Partido de Padel' en PRE-PARTIDO
-- ==============================================================================

-- 1. Revertir ejercicio 'calentamiento' y los 144 workouts diarios a 'CALENTAMIENTO'
UPDATE v2.exercises
SET category = 'CALENTAMIENTO', updated_at = now()
WHERE id = 'calentamiento';

UPDATE v2.plan_workouts
SET exercises = (
  SELECT jsonb_agg(
    CASE
      WHEN (elem->>'order')::int = 0 AND upper(coalesce(elem->>'category', '')) = 'PRE-PARTIDO'
      THEN jsonb_set(elem, '{category}', '"CALENTAMIENTO"'::jsonb)
      ELSE elem
    END
  )
  FROM jsonb_array_elements(exercises) AS elem
),
updated_at = now()
WHERE plan_id = 'plan_padel'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(exercises) AS elem
    WHERE (elem->>'order')::int = 0 AND upper(coalesce(elem->>'category', '')) = 'PRE-PARTIDO'
  );

-- 2. Crear / actualizar registro independiente para el bloque del Dashboard
INSERT INTO v2.exercises (
  id, name, category, video_code, video_path, is_home_friendly, instructions, created_at, updated_at
)
VALUES (
  'calentamiento-pre-partido-padel',
  'Calentamiento Pre-Partido de Padel',
  'PRE-PARTIDO',
  'PRE-PARTIDO',
  NULL,
  true,
  'Este es el calentamiento ideal para realizar justo antes de entrar a pista en un partido de pádel. Activa progresivamente hombros, cadera, rodillas y musculatura estabilizadora, mejora la movilidad articular y prepara el sistema neuromuscular para reaccionar con rapidez desde el primer punto, reduciendo al mínimo el riesgo de lesiones.',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  instructions = EXCLUDED.instructions,
  updated_at = now();

-- Rollback:
-- DELETE FROM v2.exercises WHERE id = 'calentamiento-pre-partido-padel';
-- (y revertir category = 'PRE-PARTIDO' en order = 0 de v2.plan_workouts si fuese necesario)
