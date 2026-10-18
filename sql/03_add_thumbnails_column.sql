-- ==============================================================================
-- VTeamFit 2026: Añadir columna thumbnail_url en v2.exercises
-- Objetivo: Almacenar URL directa a BunnyCDN para cada miniatura de ejercicio
-- ==============================================================================

BEGIN;

-- 1. Añadir columna thumbnail_url a la tabla de catálogo v2.exercises
ALTER TABLE v2.exercises
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Poblar automáticamente la URL de cada ejercicio a partir de su video_path
UPDATE v2.exercises
SET thumbnail_url = 'https://vteamfit-oct-26.b-cdn.net/thumbnails/' || regexp_replace(regexp_replace(video_path, '^/', ''), '\.mp4$', '.jpg')
WHERE video_path IS NOT NULL AND video_path != '';

COMMIT;
