// pages/api/profile/update.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).send('No auth token')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) return res.status(401).send('Invalid user')

  const { nickname } = req.body
  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id)

  if (error) return res.status(400).send(error.message)
  res.status(200).json({ ok: true })
}
