/**
 * categoryService.js
 * Categorías desde Supabase. `id`/`slug` en minúscula (ej: 'basketball');
 * `name` ya viene capitalizado para mostrar en la UI (ej: 'Casual & Retro').
 */

import { supabase } from '@/lib/supabaseClient'

export async function getCategories () {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}
