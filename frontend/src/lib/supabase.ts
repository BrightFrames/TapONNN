
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Please check your .env file.");
}

// Fallback to inferred URL from DB connection string if env vars missing
export const supabase = createClient(
    supabaseUrl || 'https://psougoojtlwcyfuvyzjr.supabase.co',
    supabaseAnonKey || 'placeholder-key-please-set-in-env'
);
