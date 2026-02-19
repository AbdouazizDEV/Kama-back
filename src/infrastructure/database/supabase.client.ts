import { supabaseAdmin } from '@/config/supabase.config';

// Client Supabase pour les opérations serveur avec privilèges admin
export const supabase = supabaseAdmin;
