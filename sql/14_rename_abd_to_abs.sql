-- ==============================================================================
-- VTeamFit 2026: Renombrar ABD 1..5 a ABS 1..5 en v2.exercises y v2.plan_workouts
-- ==============================================================================

-- 1. Crear registros abs-1..abs-5 en v2.exercises y eliminar abd-1..abd-5
INSERT INTO v2.exercises (
  id, name, category, video_code, video_path, thumbnail_url, is_home_friendly, instructions, created_at, updated_at
)
SELECT
  replace(id, 'abd-', 'abs-'),
  regexp_replace(name, '^ABD ', 'ABS '),
  category,
  regexp_replace(video_code, '^ABD ', 'ABS '),
  video_path,
  thumbnail_url,
  is_home_friendly,
  instructions,
  created_at,
  now()
FROM v2.exercises
WHERE id IN ('abd-1','abd-2','abd-3','abd-4','abd-5')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  video_code = EXCLUDED.video_code,
  video_path = EXCLUDED.video_path,
  thumbnail_url = EXCLUDED.thumbnail_url,
  instructions = EXCLUDED.instructions,
  updated_at = now();

DELETE FROM v2.exercises WHERE id IN ('abd-1','abd-2','abd-3','abd-4','abd-5');

-- 2. Actualizar warmup_instructions y exercises JSONB en v2.plan_workouts (72 días M/J/S)
UPDATE v2.plan_workouts
SET
  warmup_instructions = regexp_replace(warmup_instructions, '\bABD ([1-5])\b', 'ABS \1', 'g'),
  exercises = (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'name' ~ '^ABD [1-5]$' THEN
          jsonb_set(
            jsonb_set(
              jsonb_set(elem, '{name}', to_jsonb(regexp_replace(elem->>'name', '^ABD ', 'ABS '))),
              '{exercise_slug}',
              to_jsonb(replace(coalesce(elem->>'exercise_slug', ''), 'abd-', 'abs-'))
            ),
            '{video_code}',
            to_jsonb(regexp_replace(coalesce(elem->>'video_code', ''), '^ABD ', 'ABS '))
          )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(exercises) AS elem
  ),
  updated_at = now()
WHERE plan_id = 'plan_padel'
  AND (
    warmup_instructions ~ '\bABD [1-5]\b'
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(exercises) AS elem WHERE elem->>'name' ~ '^ABD [1-5]$'
    )
  );

-- Rollback:
-- Revertir abs-1..5 -> abd-1..5 y ABS -> ABD en ambas tablas.
