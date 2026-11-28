-- ==============================================================================
-- VTeamFit 2026: Conectar activacion-padel.MP4 y desdoblar CALENTAMIENTO + ABD 1..5
-- Objetivo:
--   1) Asignar '/activacion-padel.MP4' a 'calentamiento-pre-partido-padel'.
--   2) Crear/actualizar ejercicios 'abd-1'..'abd-5' con '/circuito1.MP4'..'/circuito5.MP4'.
--   3) En los 72 días M/J/S de plan_padel, desdoblar 'CALENTAMIENTO + ABD X' en
--      #0 'CALENTAMIENTO' ('/calentamiento.mp4') y #1 'ABD X' ('/circuitoX.MP4')
--      ambos dentro de BLOQUE: CALENTAMIENTO, desplazando los siguientes a #2+.
-- ==============================================================================

-- 1. Conectar video Pre-Partido
UPDATE v2.exercises
SET video_path = '/activacion-padel.MP4', updated_at = now()
WHERE id = 'calentamiento-pre-partido-padel';

-- 2. Upsert circuitos ABD 1..5 en catálogo maestro
INSERT INTO v2.exercises (
  id, name, category, video_code, video_path, is_home_friendly, instructions, created_at, updated_at
)
VALUES
  ('abd-1', 'ABD 1', 'CALENTAMIENTO', 'ABD 1', '/circuito1.MP4', true, 'Circuito 1 de abdominales y planchas.', now(), now()),
  ('abd-2', 'ABD 2', 'CALENTAMIENTO', 'ABD 2', '/circuito2.MP4', true, 'Circuito 2 de abdominales y planchas.', now(), now()),
  ('abd-3', 'ABD 3', 'CALENTAMIENTO', 'ABD 3', '/circuito3.MP4', true, 'Circuito 3 de abdominales y planchas.', now(), now()),
  ('abd-4', 'ABD 4', 'CALENTAMIENTO', 'ABD 4', '/circuito4.MP4', true, 'Circuito 4 de abdominales y planchas.', now(), now()),
  ('abd-5', 'ABD 5', 'CALENTAMIENTO', 'ABD 5', '/circuito5.MP4', true, 'Circuito 5 de abdominales y planchas.', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  video_code = EXCLUDED.video_code,
  video_path = EXCLUDED.video_path,
  instructions = EXCLUDED.instructions,
  updated_at = now();

-- 3. Desdoblar M/J/S en v2.plan_workouts (ejecutado y verificado vía script Node)
-- (Cada elemento #0 'CALENTAMIENTO + ABD X' se divide en #0 'CALENTAMIENTO' y #1 'ABD X',
--  manteniendo el orden relativo del resto de ejercicios desplazados a #2+).

-- Rollback:
-- UPDATE v2.exercises SET video_path = NULL, updated_at = now() WHERE id = 'calentamiento-pre-partido-padel';
-- DELETE FROM v2.exercises WHERE id IN ('abd-1','abd-2','abd-3','abd-4','abd-5');
-- (y recombinar #0 CALENTAMIENTO + #1 ABD X en v2.plan_workouts si fuese necesario)
