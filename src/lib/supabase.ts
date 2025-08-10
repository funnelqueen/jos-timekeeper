import { createClient } from '@supabase/supabase-js'

// Vite will inject these from Vercel → Environment Variables
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
)
