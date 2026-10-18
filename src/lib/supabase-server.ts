import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase Admin/BFF client strictly bound to schema 'v2'.
 * Used in Server Components and Route Handlers for SDUI data fetching and mutations.
 */
export function createServerSupabase() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    db: {
      schema: "v2",
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
