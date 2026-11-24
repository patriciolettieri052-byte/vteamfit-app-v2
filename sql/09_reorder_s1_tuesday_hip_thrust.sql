-- ==============================================================================
-- VTeamFit 2026: Reordenar GLUTEOS-HIP THRUST 1 a orden #6 en S1 Martes
-- Objetivo: Mover GLUTEOS-HIP THRUST 1 (D2/N26) de #8 a #6 en Semana 1 Día 2
-- (plan_padel), desplazando ADUCTORES (#7) y EXTENSION DE PIERNA (#8).
-- ==============================================================================

-- Forward:
UPDATE v2.plan_workouts
SET exercises = (
  WITH elems AS (
    SELECT elem, (elem->>'order')::int AS orig_order
    FROM jsonb_array_elements(exercises) AS elem
  ),
  reordered AS (
    SELECT
      CASE
        WHEN orig_order = 8 THEN jsonb_set(elem, '{order}', '6'::jsonb)
        WHEN orig_order = 6 THEN jsonb_set(elem, '{order}', '7'::jsonb)
        WHEN orig_order = 7 THEN jsonb_set(elem, '{order}', '8'::jsonb)
        ELSE elem
      END AS new_elem,
      CASE
        WHEN orig_order = 8 THEN 6
        WHEN orig_order = 6 THEN 7
        WHEN orig_order = 7 THEN 8
        ELSE orig_order
      END AS new_order
    FROM elems
  )
  SELECT jsonb_agg(new_elem ORDER BY new_order) FROM reordered
),
updated_at = now()
WHERE plan_id = 'plan_padel' AND week_number = 1 AND day_number = 2;

-- Rollback:
-- Revertir orden: #6 -> #8, #7 -> #6, #8 -> #7 en plan_id = 'plan_padel', week_number = 1, day_number = 2.
