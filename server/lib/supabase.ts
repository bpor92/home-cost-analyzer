import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a Supabase client with service key for server-side operations
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create a client for user operations (with anon key)
if (!config.supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

export const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey)