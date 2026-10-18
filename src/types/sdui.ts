// ============================================================================
// VTEAMFIT SDUI + KISS DATA CONTRACTS (Schema: v2)
// ============================================================================

export type BadgeVariant = "gold" | "outline" | "dark";

export interface PlanBadgeConfig {
  text: string;
  variant: BadgeVariant;
}

export interface PlanMethodologyStep {
  title: string;
  desc: string;
}

export interface PlanUIConfig {
  subtitle?: string;
  badge?: PlanBadgeConfig | null;
  is_featured?: boolean;
  cta_label?: string;
  card_features?: string[];
  detail_tags?: string[];
  methodology?: PlanMethodologyStep[];
  includes?: string[];
  requires_custom_onboarding?: boolean;
  post_checkout_route?: string;
  whatsapp_phone?: string;
}

export interface PlanRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  duration_weeks: number | null;
  cover_image_url: string | null;
  is_active: boolean;
  display_order: number;
  price_amount: number;
  compare_at_price: number | null;
  currency: string;
  billing_type: "one_time" | "monthly";
  ui_config: PlanUIConfig;
  created_at?: string;
}

export interface CouponRow {
  id: string;
  code: string;
  discount_percent: number;
  applicable_plans: string[] | null;
  is_active: boolean;
  expires_at: string | null;
}

export interface WorkoutExerciseItem {
  order: number;
  category: string;
  name_override: string;
  exercise_slug: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

export interface PlanWorkoutRow {
  id: string;
  plan_id: string;
  week_number: number;
  day_number: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  estimated_duration_min: number | null;
  exercises: WorkoutExerciseItem[];
}

export interface ExerciseCatalogRow {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  muscle_group: string | null;
  equipment: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  instructions: string[] | null;
  tips: string[] | null;
}

export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "coach" | "admin";
  gender: "Hombre" | "Mujer" | "Otro" | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EntrenaConmigoOnboardingData {
  goal?: string;
  experience?: string;
  days_per_week?: string;
  equipment?: string;
  injuries?: string;
  completed_at?: string;
}

export interface UserEnrollmentRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "completed" | "paused" | "cancelled";
  current_week: number;
  current_day: number;
  onboarding_data: EntrenaConmigoOnboardingData | null;
  started_at?: string;
  completed_at?: string | null;
  plan?: PlanRow;
}

export interface SetLogEntry {
  set_number: number;
  weight_kg: number;
  reps_completed: number;
  completed: boolean;
}

export interface ExerciseLogEntry {
  exercise_slug: string;
  name?: string;
  sets: SetLogEntry[];
  completed_at: string;
}

export interface UserWorkoutLogRow {
  id: string;
  user_id: string;
  workout_id: string;
  enrollment_id: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  rpe_rating: number | null;
  notes: string | null;
  exercise_logs: ExerciseLogEntry[];
}

export interface UserWeightLogRow {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  notes: string | null;
}
