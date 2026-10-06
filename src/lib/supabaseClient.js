import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL || 'https://evcbuwsllubgzojocswd.supabase.co'
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2J1d3NsbHViZ3pvam9jc3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTIxNzQsImV4cCI6MjEwNjI4ODE3NH0.I-bHaaBOF4It81cZxbG0Aah7GDY_SzK5tD8yRp4BhBQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
