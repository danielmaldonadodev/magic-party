// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Leemos las variables de entorno que definiste en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Creamos y exportamos una instancia única de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
