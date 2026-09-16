/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let client = null;
let isConfigured = false;

try {
  if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
    client = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  }
} catch (error) {
  console.warn('Failed to initialize Supabase client:', error);
}

export const isSupabaseConfigured = isConfigured;
export const supabase = client;
