/**
 * SortSelect.jsx
 * Selector de ordenamiento según el plan (Sección 8.3):
 * - Más nuevos (newest)
 * - Precio: menor a mayor (price-asc)
 * - Precio: mayor a menor (price-desc)
 * Textos 100% en español.
 */

import { useCatalogStore } from '@/stores/catalogStore'
import styles from './SortSelect.module.css'

export default function SortSelect ({ className = '' }) {
  const sort = useCatalogStore((state) => state.sort)
  const setSort = useCatalogStore((state) => state.setSort)

  return (
    <div className={`${styles.selectContainer} ${className}`}>
      <label htmlFor='sort-select' className={styles.label}>
        Ordenar por:
      </label>
      <select
        id='sort-select'
        className={styles.select}
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value='newest'>Más nuevos</option>
        <option value='price-asc'>Precio: menor a mayor</option>
        <option value='price-desc'>Precio: mayor a menor</option>
      </select>
    </div>
  )
}
