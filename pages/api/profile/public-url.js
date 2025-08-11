// pages/api/profile/public-url.js
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

  const { path } = req.body || {}
  if (!path) return res.status(400).send('Missing path')

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return res.status(200).json({ publicUrl: data?.publicUrl || null })
}
