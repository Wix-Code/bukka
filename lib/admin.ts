import { createClient } from "@supabase/supabase-js";

// Uses the service role key, which bypasses Row Level Security and the
// column-privilege revoke in billing.sql entirely. Only ever import this
// in Route Handlers / server-only code — never in a Client Component,
// and never anywhere its output could reach the browser bundle.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
