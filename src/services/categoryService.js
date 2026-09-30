/**
 * categoryService.js
 * Capa de abstracción para categorías de productos.
 */

import categoriesData from '../data/categories.json'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getCategories () {
  await delay(200)
  return categoriesData
}
