import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side Supabase client using Anon public key
// Safe for browser use with Row-Level Security (RLS).
// Service role key must NEVER be used here.

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || (typeof process !== 'undefined' && process.env) || {};
const rawUrl = (env.VITE_SUPABASE_URL as string) || '';
const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = ((env.VITE_SUPABASE_ANON_KEY as string) || '').trim();

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isClientSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
