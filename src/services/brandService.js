/**
 * brandService.js
 * Capa de abstracción para marcas.
 */

import brandsData from '../data/brands.json'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getBrands () {
  await delay(200)
  return brandsData
}
