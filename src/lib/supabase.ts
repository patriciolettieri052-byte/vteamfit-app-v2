import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser/Client Supabase instance strictly bound to schema 'v2'.
 * Never accesses 'public'.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "v2",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to resolve full CDN video or image URL when path is relative to BunnyCDN
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/images/")) {
    return url;
  }
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || "https://vteamfit-oct-26.b-cdn.net";
  return `${cdnBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}
