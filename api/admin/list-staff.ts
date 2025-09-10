import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })
  const pass = (req.headers['x-admin-pass'] as string) || (req.query?.pass as string)
  if (!pass || pass !== process.env.ADMIN_PASS) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase
    .from('staff')
    .select('id, full_name, pin_code, active')
    .order('full_name', { ascending: true })

  if (error) return res.status(500).json({ ok: false, error: error.message })
  return res.status(200).json({ ok: true, staff: data })
}

