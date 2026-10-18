-- ==============================================================================
-- VTeamFit 2026: Migración KISS + SDUI sobre esquema v2
-- Objetivo: Inyectar catálogo comercial, precios, orden y contrato SDUI desde v2.plans
-- Regla: Opera exclusivamente sobre el esquema "v2" (NO toca "public")
-- ==============================================================================

BEGIN;

-- 1. Añadir columnas comerciales y contrato SDUI a v2.plans
ALTER TABLE v2.plans
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'mensual',
  ADD COLUMN IF NOT EXISTS ui_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Índice ligero para ordenar el catálogo instantáneamente en la Home
CREATE INDEX IF NOT EXISTS idx_v2_plans_display_order
  ON v2.plans(is_published, display_order);

-- 2. Poblar el orden (1 a 5), precios y configuración SDUI de los 5 planes oficiales

-- (1) Transforma tu Cuerpo
UPDATE v2.plans
SET
  display_order = 1,
  price_amount = 19.90,
  compare_at_price = NULL,
  currency = 'USD',
  billing_type = 'mensual',
  cover_image_url = '/images/fotos/transforma-tu-cuerpo.jpg',
  ui_config = '{
    "card_variant": "featured",
    "instructor": "Victoria Torres",
    "duration_badge": "196 DÍAS",
    "badge": {
      "text": "MÁS ELEGIDO",
      "variant": "copper"
    },
    "image_position": "center 45%",
    "methodology": "Rutinas progresivas enfocadas en resultados reales. Estructuradas para desafiarte durante todo el proceso.",
    "system": "Semanalmente tendrás nuevos retos a desbloquear, seguimiento de pesos e historial.",
    "features": [
      "196 días de programación estructurada",
      "Entrenamiento de fuerza, hipertrofia y definición",
      "Videos demostrativos HD y registro de cargas"
    ],
    "cta": {
      "label": "EMPEZAR AHORA",
      "action_type": "checkout",
      "post_checkout_route": "/dashboard"
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'transforma_tu_cuerpo';

-- (2) Plan Pádel
UPDATE v2.plans
SET
  display_order = 2,
  price_amount = 49.90,
  compare_at_price = NULL,
  currency = 'USD',
  billing_type = 'mensual',
  cover_image_url = '/images/fotos/plan-padel.jpg',
  ui_config = '{
    "card_variant": "standard",
    "instructor": "Victoria Torres & Tito Allemandi",
    "duration_badge": "168 DÍAS",
    "badge": {
      "text": "PRO PADEL",
      "variant": "copper"
    },
    "image_position": "center",
    "methodology": "Rutinas progresivas enfocadas en resultados reales. Estructuradas para desafiarte durante todo el proceso.",
    "system": "Semanalmente tendrás nuevos retos a desbloquear, seguimiento de pesos e historial.",
    "features": [
      "24 semanas de progresión específica para pádel",
      "Potencia, agilidad en pista y prevención de lesiones",
      "Ejercicios agrupados por categoría (Pista, Velocidad, Fuerza)"
    ],
    "cta": {
      "label": "EMPEZAR AHORA",
      "action_type": "checkout",
      "post_checkout_route": "/dashboard"
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'plan_padel';

-- (3) Glúteos de Acero
UPDATE v2.plans
SET
  display_order = 3,
  price_amount = 49.90,
  compare_at_price = NULL,
  currency = 'USD',
  billing_type = 'trimestral',
  cover_image_url = '/images/fotos/gluteos.jpg',
  ui_config = '{
    "card_variant": "standard",
    "instructor": "Victoria Torres",
    "duration_badge": "84 DÍAS",
    "badge": null,
    "image_position": "center",
    "methodology": "Rutinas progresivas enfocadas en resultados reales. Estructuradas para desafiarte durante todo el proceso.",
    "system": "Semanalmente tendrás nuevos retos a desbloquear, seguimiento de pesos e historial.",
    "features": [
      "12 semanas de enfoque biomecánico en glúteos y tren inferior",
      "5 sesiones semanales progresivas",
      "Seguimiento de evolución de pesos y RPE"
    ],
    "cta": {
      "label": "EMPEZAR AHORA",
      "action_type": "checkout",
      "post_checkout_route": "/dashboard"
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'gluteos_de_acero';

-- (4) Entrena Conmigo
UPDATE v2.plans
SET
  display_order = 4,
  price_amount = 210.00,
  compare_at_price = NULL,
  currency = 'USD',
  billing_type = 'mensual',
  cover_image_url = '/images/fotos/entrena-conmigo2.webp',
  ui_config = '{
    "card_variant": "vip",
    "instructor": "Victoria Torres",
    "duration_badge": "30 DÍAS RENOVABLES",
    "badge": {
      "text": "PERSONALIZADO",
      "variant": "gold"
    },
    "image_position": "top",
    "is_personalized": true,
    "methodology": "Diseño a medida según cuestionario de objetivos, disponibilidad y equipamiento.",
    "system": "Ajustes mensuales continuos y acompañamiento directo 1 a 1 vía WhatsApp.",
    "features": [
      "Planificación 100% individualizada por Vicky Torres",
      "Comunicación directa 1 a 1 vía WhatsApp",
      "Corrección técnica por video y ajustes mensuales"
    ],
    "cta": {
      "label": "SOLICITAR PLAZA 1 A 1",
      "action_type": "checkout",
      "post_checkout_route": "/dashboard/entrena-conmigo/onboarding"
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'entrena_conmigo';

-- (5) Curso de Físico en Pista de Pádel
UPDATE v2.plans
SET
  display_order = 5,
  price_amount = 249.00,
  compare_at_price = NULL,
  currency = 'USD',
  billing_type = 'pago único',
  cover_image_url = '/images/fotos/fisico-padel.webp',
  ui_config = '{
    "card_variant": "certification",
    "instructor": "Tito Allemandi",
    "duration_badge": "19 DÍAS (MÓDULOS DE CERTIFICACIÓN)",
    "badge": {
      "text": "CERTIFICACIÓN",
      "variant": "copper"
    },
    "image_position": "center",
    "methodology": "Módulos tácticos y preparación física de alta competición aplicada al pádel.",
    "system": "Acceso de por vida a los 19 módulos de certificación técnica y física.",
    "features": [
      "19 módulos de certificación dictados por Tito Allemandi",
      "Metodología de desplazamiento, aceleración y frenada en pista",
      "Acceso vitalicio con un único pago"
    ],
    "cta": {
      "label": "OBTENER CERTIFICACIÓN",
      "action_type": "checkout",
      "post_checkout_route": "/dashboard"
    }
  }'::jsonb,
  updated_at = now()
WHERE id = 'fisico_en_pista_padel';

COMMIT;
