import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' })
    }

    const pass = (req.headers['x-admin-pass'] as string) || (req.body && req.body.adminPass)
    if (!pass || pass !== process.env.ADMIN_PASS) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' })
    }

    const missing: string[] = []
    if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (missing.length) {
      return res.status(500).json({ ok: false, error: 'Missing env vars', missing })
    }

    const { id, pin_code, active } = req.body || {}
    if (!id || !pin_code) return res.status(400).json({ ok: false, error: 'id and pin_code required' })

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data, error } = await supabase
      .from('staff')
      .update({ pin_code, active: active ?? true })
      .eq('id', id)
      .select('id, full_name, pin_code, active')
      .single()

    if (error) return res.status(400).json({ ok: false, error: error.message })
    return res.status(200).json({ ok: true, staff: data })
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || 'Unhandled error' })
  }
}
