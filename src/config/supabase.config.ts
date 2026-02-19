import { createClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/supabase.types';
import { env } from './env.config';

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey
);

export const supabaseAdmin = createClient<Database>(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
