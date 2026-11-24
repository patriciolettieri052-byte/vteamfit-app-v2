-- ==============================================================================
-- VTeamFit 2026: Renombrar categoría CALENTAMIENTO a PRE-PARTIDO (Ejercicio 0)
-- Objetivo: Cambiar el bloque "BLOQUE: CALENTAMIENTO" a "BLOQUE: PRE-PARTIDO"
-- en v2.exercises (id='calentamiento') y los 137 registros de v2.plan_workouts.
-- ==============================================================================

-- Forward:
UPDATE v2.exercises
SET category = 'PRE-PARTIDO', updated_at = now()
WHERE category = 'CALENTAMIENTO';

UPDATE v2.plan_workouts
SET exercises = (
  SELECT jsonb_agg(
    CASE
      WHEN upper(coalesce(elem->>'category', '')) = 'CALENTAMIENTO'
      THEN jsonb_set(elem, '{category}', '"PRE-PARTIDO"'::jsonb)
      ELSE elem
    END
  )
  FROM jsonb_array_elements(exercises) AS elem
),
updated_at = now()
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(exercises) AS elem
  WHERE upper(coalesce(elem->>'category', '')) = 'CALENTAMIENTO'
);

-- Rollback:
-- UPDATE v2.exercises SET category = 'CALENTAMIENTO', updated_at = now() WHERE id = 'calentamiento';
-- (y revertir category = 'CALENTAMIENTO' en order = 0 de v2.plan_workouts)
