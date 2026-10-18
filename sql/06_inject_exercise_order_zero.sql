-- ==============================================================================
-- VTeamFit 2026: Inyección de EJERCICIO 0 (Calentamiento) en v2.plan_workouts
-- Objetivo: Establecer el Ejercicio 0 (Calentamiento / Activación) en la lista
-- de ejercicios (JSONB) de cada rutina conforme a la planilla oficial de planes.
--
-- NOTA: La migración fue ejecutada y verificada mediante el script de ingesta
-- `scripts/inject_exercise_order_zero.mjs` vía PostgREST API / Supabase Service Role.
--
-- Estructura inyectada en exercises JSONB:
-- {
--   "order": 0,
--   "name": "CALENTAMIENTO" | "CALENTAMIENTO + ABD 1" | ... ,
--   "category": "CALENTAMIENTO",
--   "exercise_slug": "calentamiento-o0" | "calentamiento-abd-1-o0" | ... ,
--   "series": null,
--   "reps": null,
--   "notes": "Activación previa al entrenamiento",
--   "video_path": null,       -- Mantenido en null hasta recibir archivos de video
--   "video_code": null,
--   "thumbnail_url": null,
--   "rpe": null
-- }
-- ==============================================================================

-- Consulta de verificación:
SELECT 
    id, 
    week_number, 
    day_number, 
    warmup_instructions,
    exercises->0->>'order' as first_exercise_order,
    exercises->0->>'name' as first_exercise_name,
    exercises->0->>'category' as first_exercise_category,
    exercises->0->>'video_path' as first_exercise_video_path
FROM v2.plan_workouts
LIMIT 20;
