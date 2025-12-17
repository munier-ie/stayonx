
import { createClient } from '@supabase/supabase-js';

// Access environment variables safely for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase Environment Variables in VITE');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
