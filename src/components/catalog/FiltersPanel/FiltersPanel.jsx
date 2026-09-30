/**
 * FiltersPanel.jsx
 * Panel lateral de filtros según el plan (Sección 8.3):
 * - Marcas (Nike, Adidas, New Balance, Jordan)
 * - Categorías (Lifestyle, Basketball, Running, Skate)
 * - Tallas (37 a 44)
 * - Toggle "Solo ofertas"
 * Copys 100% en español.
 */

import { useCatalogStore } from '@/stores/catalogStore'
import styles from './FiltersPanel.module.css'

export default function FiltersPanel ({ className = '' }) {
  const filters = useCatalogStore((state) => state.filters)
  const toggleFilterValue = useCatalogStore((state) => state.toggleFilterValue)
  const setFilter = useCatalogStore((state) => state.setFilter)
  const clearFilters = useCatalogStore((state) => state.clearFilters)

  const availableBrands = [
    { id: 'nike', label: 'Nike' },
    { id: 'jordan', label: 'Jordan' },
    { id: 'adidas', label: 'Adidas' },
    { id: 'new-balance', label: 'New Balance' }
  ]

  const availableCategories = [
    { id: 'lifestyle', label: 'Casual & Lifestyle' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'running', label: 'Running & Retro' },
    { id: 'skate', label: 'Skateboarding' }
  ]

  const availableSizes = [37, 38, 39, 40, 41, 42, 43, 44]

  return (
    <aside className={`${styles.panel} ${className}`} aria-label='Filtros de catálogo'>
      <div className={styles.panelTitle}>
        <span>FILTRAR ARCHIVO</span>
        <button
          type='button'
          className={styles.clearBtn}
          onClick={clearFilters}
        >
          Limpiar
        </button>
      </div>

      {/* 1. Toggle Solo Ofertas */}
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Solo ofertas</span>
        <input
          type='checkbox'
          className={styles.checkbox}
          checked={filters.onlyOffers}
          onChange={(e) => setFilter('onlyOffers', e.target.checked)}
        />
      </div>

      {/* 2. Marcas */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Marcas</span>
        <div className={styles.optionsList}>
          {availableBrands.map((b) => (
            <label key={b.id} className={styles.checkboxItem}>
              <input
                type='checkbox'
                className={styles.checkbox}
                checked={filters.brands.includes(b.id)}
                onChange={() => toggleFilterValue('brands', b.id)}
              />
              <span>{b.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Categorías */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Categorías</span>
        <div className={styles.optionsList}>
          {availableCategories.map((c) => (
            <label key={c.id} className={styles.checkboxItem}>
              <input
                type='checkbox'
                className={styles.checkbox}
                checked={filters.categories.includes(c.id)}
                onChange={() => toggleFilterValue('categories', c.id)}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Tallas */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Talla (COL / EU)</span>
        <div className={styles.sizesGrid}>
          {availableSizes.map((sz) => {
            const isSelected = filters.sizes.includes(sz)
            return (
              <button
                key={sz}
                type='button'
                className={`${styles.sizeBtn} ${isSelected ? styles.sizeActive : ''}`}
                onClick={() => toggleFilterValue('sizes', sz)}
              >
                {sz}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
