import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL || 'https://evcbuwsllubgzojocswd.supabase.co'
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_WshhpO7iTV0DXz1NYfa6Jg_LgH4y5o9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
