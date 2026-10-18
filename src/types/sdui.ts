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
  tagline?: string;
  badge?: PlanBadgeConfig | null;
  is_featured?: boolean;
  card_variant?: string;
  cta?: {
    label?: string;
    action_type?: string;
    post_checkout_route?: string;
  };
  cta_label?: string;
  features?: string[];
  card_features?: string[];
  detail_tags?: string[];
  methodology?: string | PlanMethodologyStep[];
  system?: string;
  includes?: string[];
  duration_badge?: string;
  instructor?: string;
  image_position?: string;
  is_personalized?: boolean;
  requires_custom_onboarding?: boolean;
  post_checkout_route?: string;
  whatsapp_phone?: string;
}

export interface PlanRow {
  id: string;
  slug: string;
  name: string;
  title?: string;
  description: string | null;
  tagline?: string | null;
  level?: string | null;
  total_weeks?: number | null;
  duration_weeks?: number | null;
  days_per_week?: number | null;
  cover_image_url: string | null;
  is_published?: boolean;
  is_active?: boolean;
  display_order: number;
  price_amount: number;
  compare_at_price: number | null;
  currency: string;
  billing_type: string;
  ui_config: PlanUIConfig;
  created_at?: string;
  updated_at?: string;
}

export interface CouponRow {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  plan_id: string | null;
  created_at?: string;
}

export interface WorkoutExerciseItem {
  order: number;
  category: string;
  name?: string;
  name_override?: string;
  exercise_slug?: string;
  video_code?: string;
  video_path?: string;
  thumbnail_url?: string;
  series?: string | number | null;
  sets?: string | number | null;
  reps?: string | number | null;
  rpe?: string | number | null;
  rest?: string | null;
  notes?: string | null;
}

/**
 * Deterministic slug resolver for any exercise inside v2.plan_workouts.exercises
 * Matches v2.exercises.id when video_path is present.
 */
export function getExerciseSlug(ex: WorkoutExerciseItem): string {
  if (ex.exercise_slug) return ex.exercise_slug;
  if (ex.video_path) {
    const cleaned = ex.video_path.replace(/^\//, "").replace(/\.mp4$/i, "").trim();
    if (cleaned) return cleaned;
  }
  const rawName = ex.name || ex.name_override || "ejercicio";
  const slugified = rawName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slugified}-o${ex.order ?? 0}`;
}

/**
 * Deterministic thumbnail resolver for any exercise
 * Uses thumbnail_url if present, otherwise constructs CDN url from video_path.
 */
export function getExerciseThumbnail(
  ex: WorkoutExerciseItem,
  cdnBase: string = "https://vteamfit-oct-26.b-cdn.net"
): string | null {
  if (ex.thumbnail_url && ex.thumbnail_url.trim()) return ex.thumbnail_url.trim();
  if (ex.video_path && ex.video_path.trim()) {
    const cleaned = ex.video_path.replace(/^\//, "").replace(/\.mp4$/i, "").trim();
    if (cleaned) return `${cdnBase}/thumbnails/${cleaned}.jpg`;
  }
  return null;
}

export interface PlanWorkoutRow {
  id: string;
  plan_id: string;
  week_number: number;
  day_number: number;
  day_name?: string;
  focus?: string | null;
  warmup_instructions?: string | null;
  is_rest_day?: boolean;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  estimated_duration_min?: number | null;
  exercises: WorkoutExerciseItem[];
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseCatalogRow {
  id: string;
  slug?: string;
  name: string;
  category: string | null;
  video_code?: string | null;
  video_path?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  original_physical_file?: string | null;
  other_acceptable_codes?: string | null;
  is_home_friendly?: boolean;
  instructions: string | string[] | null;
  tips?: string[] | null;
}

export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "user" | "coach" | "admin";
  phone?: string | null;
  gender: "Hombre" | "Mujer" | "Otro" | string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  birthdate?: string | null;
  experience_level?: string | null;
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
  start_date?: string;
  status: "active" | "completed" | "paused" | "cancelled";
  current_week: number;
  current_day?: number;
  onboarding_data: EntrenaConmigoOnboardingData | null;
  created_at?: string;
  updated_at?: string;
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
  plan_id?: string;
  workout_id: string;
  week_number?: number;
  day_name?: string;
  completed_at: string | null;
  duration_seconds: number | null;
  perceived_effort?: number | null;
  notes: string | null;
  exercise_logs: ExerciseLogEntry[];
}

export interface UserWeightLogRow {
  id: string;
  user_id: string;
  recorded_date: string;
  weight_kg: number;
  created_at?: string;
}
