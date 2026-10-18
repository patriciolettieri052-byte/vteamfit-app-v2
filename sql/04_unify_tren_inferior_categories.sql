-- ==============================================================================
-- VTeamFit 2026: Unificación de categorías a "TREN INFERIOR"
-- Objetivo: Agrupar glúteos, cuádriceps, isquios, gemelos, abductores y aductores
--           bajo la categoría unificada "TREN INFERIOR"
-- ==============================================================================

BEGIN;

-- 1. Actualizar catálogo general v2.exercises
UPDATE v2.exercises
SET category = 'TREN INFERIOR',
    updated_at = now()
WHERE category IN (
  'GLUTEOS',
  'ISQUIOS/GLUTEOS',
  'CUADRICEPS',
  'GEMELOS',
  'ABDUCTORES',
  'ADUCTORES'
);

-- 2. Actualizar las instancias en v2.plan_workouts (campo JSONB exercises)
UPDATE v2.plan_workouts
SET exercises = (
  SELECT jsonb_agg(
    CASE 
      WHEN upper(elem->>'category') IN ('GLUTEOS', 'ISQUIOS/GLUTEOS', 'CUADRICEPS', 'GEMELOS', 'ABDUCTORES', 'ADUCTORES')
      THEN jsonb_set(elem, '{category}', '"TREN INFERIOR"'::jsonb)
      ELSE elem
    END
    ORDER BY (elem->>'order')::int
  )
  FROM jsonb_array_elements(exercises) AS elem
),
updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(exercises) AS e
  WHERE upper(e->>'category') IN ('GLUTEOS', 'ISQUIOS/GLUTEOS', 'CUADRICEPS', 'GEMELOS', 'ABDUCTORES', 'ADUCTORES')
);

COMMIT;
