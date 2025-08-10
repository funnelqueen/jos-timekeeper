
// Rename this file to src/lib/supabase.ts after adding your keys
import { createClient } from '@supabase/supabase-js'

// For local testing you can hardcode keys here.
// In production (Vercel), set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)
