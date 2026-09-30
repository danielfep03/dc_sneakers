/**
 * ActiveFilters.jsx
 * Muestra los chips de filtros activos con botón de remoción individual
 * y el botón "Limpiar todo". Copys 100% en español.
 */

import { useCatalogStore } from '@/stores/catalogStore'
import styles from './ActiveFilters.module.css'

export default function ActiveFilters () {
  const filters = useCatalogStore((state) => state.filters)
  const toggleFilterValue = useCatalogStore((state) => state.toggleFilterValue)
  const setFilter = useCatalogStore((state) => state.setFilter)
  const clearFilters = useCatalogStore((state) => state.clearFilters)

  const activeChips = []

  // Chips por marcas
  filters.brands.forEach((brand) => {
    activeChips.push({
      key: `brand-${brand}`,
      label: `Marca: ${brand.toUpperCase()}`,
      onRemove: () => toggleFilterValue('brands', brand)
    })
  })

  // Chips por categorías
  filters.categories.forEach((cat) => {
    activeChips.push({
      key: `cat-${cat}`,
      label: `Categoría: ${cat.toUpperCase()}`,
      onRemove: () => toggleFilterValue('categories', cat)
    })
  })

  // Chips por tallas
  filters.sizes.forEach((size) => {
    activeChips.push({
      key: `size-${size}`,
      label: `Talla: ${size}`,
      onRemove: () => toggleFilterValue('sizes', size)
    })
  })

  // Chip solo ofertas
  if (filters.onlyOffers) {
    activeChips.push({
      key: 'offers-only',
      label: 'Solo ofertas',
      onRemove: () => setFilter('onlyOffers', false)
    })
  }

  if (activeChips.length === 0) return null

  return (
    <div className={styles.bar} aria-label='Filtros activos'>
      <span className={styles.label}>Filtros activos:</span>
      {activeChips.map((chip) => (
        <span key={chip.key} className={styles.chip}>
          {chip.label}
          <button
            type='button'
            className={styles.removeBtn}
            onClick={chip.onRemove}
            aria-label={`Quitar filtro ${chip.label}`}
          >
            ✕
          </button>
        </span>
      ))}

      <button
        type='button'
        className={styles.clearAllBtn}
        onClick={clearFilters}
      >
        Limpiar todo
      </button>
    </div>
  )
}
