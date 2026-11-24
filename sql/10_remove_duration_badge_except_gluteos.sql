-- ==============================================================================
-- VTeamFit 2026: Quitar duration_badge (durationLabel) de todos los planes
-- excepto 'gluteos_de_acero'
-- ==============================================================================

-- Forward:
UPDATE v2.plans
SET
  ui_config = ui_config - 'duration_badge',
  updated_at = now()
WHERE id <> 'gluteos_de_acero';

-- Rollback:
-- UPDATE v2.plans SET ui_config = jsonb_set(ui_config, '{duration_badge}', '"196 DÍAS"'::jsonb) WHERE id = 'transforma_tu_cuerpo';
-- UPDATE v2.plans SET ui_config = jsonb_set(ui_config, '{duration_badge}', '"168 DÍAS"'::jsonb) WHERE id = 'plan_padel';
-- UPDATE v2.plans SET ui_config = jsonb_set(ui_config, '{duration_badge}', '"30 DÍAS RENOVABLES"'::jsonb) WHERE id = 'entrena_conmigo';
-- UPDATE v2.plans SET ui_config = jsonb_set(ui_config, '{duration_badge}', '"19 DÍAS"'::jsonb) WHERE id = 'fisico_en_pista_padel';
