import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project details
// Ideally, these should be in a .env file (e.g., VITE_SUPABASE_URL)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
