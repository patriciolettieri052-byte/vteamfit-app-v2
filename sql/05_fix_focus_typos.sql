-- ==============================================================================
-- VTeamFit 2026: Corrección de typo en columna focus de v2.plan_workouts
-- Objetivo: Corregir "PREVENIR+FORTALER" -> "PREVENIR+FORTALECER"
-- ==============================================================================

BEGIN;

UPDATE v2.plan_workouts
SET focus = 'PREVENIR+FORTALECER',
    updated_at = now()
WHERE focus = 'PREVENIR+FORTALER';

COMMIT;
