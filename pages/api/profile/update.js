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

  try {
    const { nickname, avatar_url, highlight_image_preference } = req.body || {}
    const patch = {}

    // nickname opcional (2..32)
    if (typeof nickname === 'string') {
      const clean = nickname.trim()
      if (clean.length < 2 || clean.length > 32) {
        return res.status(400).send('Nickname inválido (2–32 chars)')
      }
      patch.nickname = clean
    }

    // avatar opcional
    if (typeof avatar_url === 'string' && avatar_url.length > 0) {
      patch.avatar_url = avatar_url
      patch.avatar_updated_at = new Date().toISOString()
    }

    // preferencia opcional
    if (['profile', 'commander'].includes(highlight_image_preference)) {
      patch.highlight_image_preference = highlight_image_preference
    }

    if (Object.keys(patch).length === 0) {
      return res.status(400).send('Sin cambios')
    }

    const { error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)

    if (error) return res.status(400).send(error.message)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).send('Error actualizando perfil')
  }
}
