// lib/supabaseServer.js
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 1) Cliente SSR con cookies (para páginas getServerSideProps / API routes con cookies válidas)
export function createSupabaseServerClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies[name],
        set: (name, value, options) => {
          res.setHeader(
            'Set-Cookie',
            `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${options.maxAge ?? 0}`
          )
        },
        remove: (name) => {
          res.setHeader(
            'Set-Cookie',
            `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
          )
        },
      },
    }
  )
}

// 2) Cliente "como usuario" desde el header Authorization: Bearer ...
export function createUserClientFromAuthHeader(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return { client: null, userToken: null }
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  return { client, userToken: token }
}

// 3) Cliente con service role (solo en servidor)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
}
