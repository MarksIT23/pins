import { createClient } from '@supabase/supabase-js'

// Accepts the new publishable key (sb_publishable_…) or the legacy anon key.
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string

/** False when running locally without Supabase keys (a placeholder client is used). */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    // Let the UI render locally without keys; data requests will fail until .env.local is filled in.
    console.warn('Supabase env vars missing — add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local. Using a placeholder client.')
    supabaseUrl = 'https://placeholder.supabase.co'
    supabaseAnonKey = 'placeholder-anon-key'
  } else {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
