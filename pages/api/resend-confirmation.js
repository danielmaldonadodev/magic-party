// pages/api/resend-confirmation.js
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' })
  }

  // Llamamos a supabase.auth.resend para reenviar la confirmación
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    // Opcional: redirigir a la ruta que quieras tras confirmar
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` },
  })

  if (error) {
    return res.status(500).json({ error: error.message })
  }
  return res.status(200).json({ message: 'Email de confirmación reenviado' })
}
