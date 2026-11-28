-- ==============================================================================
-- VTeamFit 2026: Asignar thumbnails locales generados desde
-- "videos cambios noviembre 2026" a v2.exercises y v2.plan_workouts
-- ==============================================================================

UPDATE v2.exercises
SET thumbnail_url = CASE id
  WHEN 'calentamiento-pre-partido-padel' THEN '/images/thumbnails/activacion-padel.jpg'
  WHEN 'calentamiento' THEN '/images/thumbnails/calentamiento.jpg'
  WHEN 'abd-1' THEN '/images/thumbnails/circuito1.jpg'
  WHEN 'abd-2' THEN '/images/thumbnails/circuito2.jpg'
  WHEN 'abd-3' THEN '/images/thumbnails/circuito3.jpg'
  WHEN 'abd-4' THEN '/images/thumbnails/circuito4.jpg'
  WHEN 'abd-5' THEN '/images/thumbnails/circuito5.jpg'
  ELSE thumbnail_url
END,
updated_at = now()
WHERE id IN (
  'calentamiento-pre-partido-padel',
  'calentamiento',
  'abd-1', 'abd-2', 'abd-3', 'abd-4', 'abd-5'
);

-- En v2.plan_workouts (plan_padel, 144 filas), se actualizó thumbnail_url en
-- CALENTAMIENTO ('/images/thumbnails/calentamiento.jpg') y ABD 1..5 ('/images/thumbnails/circuito1..5.jpg').

-- Rollback:
-- UPDATE v2.exercises SET thumbnail_url = NULL, updated_at = now()
-- WHERE id IN ('calentamiento-pre-partido-padel','calentamiento','abd-1','abd-2','abd-3','abd-4','abd-5');
