/**
 * Supabase Client Initialization
 * 
 * STATUS: NOT CONFIGURED
 * 
 * Requires:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * Without these environment variables, the application will run in
 * DEMO MODE with localStorage fallback.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

export function initializeSupabase(): SupabaseClient | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Not configured. Running in DEMO MODE with localStorage.');
    console.warn('[Supabase] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
    isConfigured = false;
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    isConfigured = true;
    console.info('[Supabase] Client initialized successfully.');
    return supabaseInstance;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    isConfigured = false;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initializeSupabase();
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

export function getSupabaseStatus(): 'CONFIGURED' | 'NOT_CONFIGURED' | 'ERROR' {
  if (isConfigured && supabaseInstance) {
    return 'CONFIGURED';
  }
  return 'NOT_CONFIGURED';
}
