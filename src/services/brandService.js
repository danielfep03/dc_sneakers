/**
 * brandService.js
 * Marcas desde Supabase.
 */

import { supabase } from '@/lib/supabaseClient'

export async function getBrands () {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, description, logo_url')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}
