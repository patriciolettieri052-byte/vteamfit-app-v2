-- ==============================================================================
-- VTeamFit 2026: Refinamiento de Esquema v2 tras sesión /grill-me (PRD v1.1)
-- Regla: Opera exclusivamente sobre el esquema "v2" (NO toca "public")
-- ==============================================================================

BEGIN;

-- 1. Crear tabla v2.coupons para gestión 100% Backend-Driven de descuentos
CREATE TABLE IF NOT EXISTS v2.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    plan_id TEXT REFERENCES v2.plans(id) ON DELETE CASCADE, -- NULL = aplica a todos los planes
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON TABLE v2.coupons TO anon, authenticated, service_role;

-- Insertar cupones iniciales editables desde Supabase
INSERT INTO v2.coupons (code, discount_percent, is_active, plan_id)
VALUES
  ('VTEAM100', 100, true, NULL),
  ('VICKY', 100, true, NULL),
  ('VTEAM50', 50, true, NULL)
ON CONFLICT (code) DO UPDATE
SET discount_percent = EXCLUDED.discount_percent,
    is_active = EXCLUDED.is_active;

-- 2. Agregar onboarding_data JSONB en v2.user_enrollments (para cuestionario 4 pasos de Entrena Conmigo)
ALTER TABLE v2.user_enrollments
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- 3. Agregar gender y age en v2.user_profiles (para Capa 4 Onboarding y Capa 13 Perfil)
ALTER TABLE v2.user_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER;

-- 4. Permitir guardado progresivo por ejercicio en v2.user_workout_logs
--    completed_at = NULL mientras la rutina diaria está en progreso;
--    completed_at = now() únicamente cuando el atleta pulsa "COMPLETAR DÍA".
ALTER TABLE v2.user_workout_logs
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN completed_at DROP DEFAULT;

-- 5. Inyectar whatsapp_phone dentro de v2.plans.ui_config para "entrena_conmigo"
UPDATE v2.plans
SET ui_config = jsonb_set(
  ui_config,
  '{whatsapp_phone}',
  '"+34600000000"'::jsonb,
  true
),
updated_at = now()
WHERE id = 'entrena_conmigo';

COMMIT;
