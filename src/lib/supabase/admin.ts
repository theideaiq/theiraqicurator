import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Service-role client for the few things only the server may do (creating
 * logins, listing accounts). Never import this from a client component.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't set.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
