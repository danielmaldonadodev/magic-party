// lib/supabaseServer.js
import { createServerClient } from '@supabase/ssr'

export function createSupabaseServerClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies[name],
        set: (name, value, options) => {
          res.setHeader('Set-Cookie',
            `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${options.maxAge ?? 0}`
          )
        },
        remove: (name) => {
          res.setHeader('Set-Cookie',
            `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
          )
        },
      },
    }
  )
}
