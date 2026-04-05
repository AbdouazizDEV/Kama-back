import { createClient } from '@supabase/supabase-js';
import { env } from './env.config';

/**
 * `src/shared/types/supabase.types.ts` ne couvre pas encore toutes les tables.
 * Client typé `any` jusqu'à régénération complète : `npx supabase gen types typescript …`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const supabase = createClient<any>(env.supabase.url, env.supabase.anonKey);

export const supabaseAdmin = createClient<any>(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
/* eslint-enable @typescript-eslint/no-explicit-any */
