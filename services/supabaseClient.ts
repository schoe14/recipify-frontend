// src/services/supabaseClient.ts
import { createClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '../types_supabase.ts'; // Assuming your auto-generated Supabase types are here

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Type check: Ensure environment variables are set
if (!supabaseUrl) {
  throw new Error("Supabase URL is not set. Ensure VITE_SUPABASE_URL is in your .env file or hardcoded values are present.");
}
if (!supabaseAnonKey) {
  throw new Error("Supabase Anon Key is not set. Ensure VITE_SUPABASE_ANON_KEY is in your .env file or hardcoded values are present.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Export Session and User types if you need them frequently
export type { Session, User };

export const getSupabaseAccessToken = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting Supabase session:", error);
    return null;
  }
  return data.session?.access_token || null;
};