/**
 * Collections2.jsx
 * Vista de Catálogo V2 con filtros completos y ordenamiento:
 * - Filtros por Marcas (Nike, Jordan, Adidas, Asics...)
 * - Filtros por Categorías (Basketball, Casual, Running, Voleibol...)
 * - Filtros por Tallas (36 a 45)
 * - Toggle "Solo ofertas"
 * - Ordenamiento (Más nuevos, Menor precio, Mayor precio)
 * - Chips de filtros activos con botón remover '✕' y 'Limpiar todo'
 * - Layout responsivo: Sidebar lateral en Desktop y Modal en Móvil
 * - Tarjetas interactivas con compra rápida '+' conectada a useCartStore
 * - Copys 100% en español.
 */

import Modal from '@/components/ui/Modal'
import { SNEAKERS_DATA } from '@/data/sneakers'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/utils/formatPrice'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import styles from './Collections2.module.css'

export default function Collections2 () {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem, toggleCart } = useCartStore()

  // Inicializar estado desde URL params
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const brand = searchParams.get('brand')
    return brand ? [brand] : []
  })

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') || 'ALL'
  })

  const [selectedSizes, setSelectedSizes] = useState([])
  const [onlyOffers, setOnlyOffers] = useState(() => searchParams.get('tag') === 'sale')
  const [sortBy, setSortBy] = useState('newest')
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const availableBrands = ['Nike', 'Jordan', 'Adidas', 'Asics']
  const availableCategories = [
    { id: 'ALL', label: 'TODAS' },
    { id: 'BASKETBALL', label: 'BASKETBALL' },
    { id: 'CASUAL', label: 'CASUAL & RETRO' },
    { id: 'RUNNING', label: 'RUNNING' },
    { id: 'VOLEIBOL', label: 'VOLEIBOL' }
  ]
  const availableSizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

  // Actualizar filtros cuando cambie la URL
  useEffect(() => {
    const cat = searchParams.get('category')
    const brand = searchParams.get('brand')
    const tag = searchParams.get('tag')

    if (cat) setSelectedCategory(cat)
    if (brand) setSelectedBrands([brand])
    if (tag === 'sale') setOnlyOffers(true)
  }, [searchParams])

  // Filtrado y Ordenamiento
  const filteredProducts = useMemo(() => {
    let list = [...SNEAKERS_DATA]

    // 1. Filtro por Categoría
    if (selectedCategory && selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory)
    }

    // 2. Filtro por Marcas
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand))
    }

    // 3. Filtro por Tallas
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some((sz) => selectedSizes.includes(sz))
      )
    }

    // 4. Filtro por Ofertas
    if (onlyOffers) {
      list = list.filter((p) => p.price <= 399900 || p.name.includes('Air Force') || p.name.includes('Campus'))
    }

    // 5. Ordenamiento
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price)
    } else {
      // 'newest' por defecto
      list.sort((a, b) => b.id - a.id)
    }

    return list
  }, [selectedCategory, selectedBrands, selectedSizes, onlyOffers, sortBy])

  // Manejadores de Filtros
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const clearAllFilters = () => {
    setSelectedBrands([])
    setSelectedCategory('ALL')
    setSelectedSizes([])
    setOnlyOffers(false)
    setSearchParams({})
  }

  const handleQuickAdd = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    const size = product.sizes?.[0] || 40
    const color = product.colors?.[0] || { name: 'Default', hex: '#000' }
    addItem(product, size, color, 1)
    toggleCart(true)
  }

  // Componente Sidebar de Filtros reutilizable
  const FilterSidebarContent = () => (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>FILTRAR ARCHIVO</h3>
        <button
          type='button'
          className={styles.clearAllBtn}
          onClick={clearAllFilters}
        >
          Limpiar
        </button>
      </div>

      {/* Solo Ofertas */}
      <div className={styles.toggleRow}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Solo ofertas</span>
        <input
          type='checkbox'
          className={styles.checkbox}
          checked={onlyOffers}
          onChange={(e) => setOnlyOffers(e.target.checked)}
        />
      </div>

      {/* Marcas */}
      <div className={styles.filterGroup}>
        <h4 className={styles.groupTitle}>Marcas</h4>
        {availableBrands.map((brand) => (
          <label key={brand} className={styles.checkboxItem}>
            <input
              type='checkbox'
              className={styles.checkbox}
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
            <span>{brand}</span>
          </label>
        ))}
      </div>

      {/* Categorías */}
      <div className={styles.filterGroup}>
        <h4 className={styles.groupTitle}>Categoría</h4>
        {availableCategories.map((cat) => (
          <label key={cat.id} className={styles.checkboxItem}>
            <input
              type='radio'
              name='cat-radio'
              className={styles.checkbox}
              checked={selectedCategory === cat.id}
              onChange={() => setSelectedCategory(cat.id)}
            />
            <span>{cat.label}</span>
          </label>
        ))}
      </div>

      {/* Tallas */}
      <div className={styles.filterGroup}>
        <h4 className={styles.groupTitle}>Talla (COL / EU)</h4>
        <div className={styles.sizesGrid}>
          {availableSizes.map((sz) => {
            const isSelected = selectedSizes.includes(sz)
            return (
              <button
                key={sz}
                type='button'
                className={`${styles.sizeBtn} ${isSelected ? styles.sizeBtnActive : ''}`}
                onClick={() => toggleSize(sz)}
              >
                {sz}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategory !== 'ALL' ||
    selectedSizes.length > 0 ||
    onlyOffers

  return (
    <div className={styles.collectionsPage}>
      {/* Encabezado */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>CATÁLOGO DE SNEAKERS</h1>
        </div>
        <span className={styles.resultsCount}>
          [{filteredProducts.length} SILUETAS DISPONIBLES]
        </span>
      </header>

      {/* Chips de Filtros Activos */}
      {hasActiveFilters && (
        <div className={styles.activeChipsBar}>
          <span className={styles.chipsLabel}>Filtros activos:</span>

          {selectedCategory !== 'ALL' && (
            <span className={styles.chip}>
              Categoría: {selectedCategory}
              <button
                type='button'
                className={styles.chipRemoveBtn}
                onClick={() => setSelectedCategory('ALL')}
              >
                ✕
              </button>
            </span>
          )}

          {selectedBrands.map((b) => (
            <span key={b} className={styles.chip}>
              {b}
              <button
                type='button'
                className={styles.chipRemoveBtn}
                onClick={() => toggleBrand(b)}
              >
                ✕
              </button>
            </span>
          ))}

          {selectedSizes.map((s) => (
            <span key={s} className={styles.chip}>
              Talla: {s}
              <button
                type='button'
                className={styles.chipRemoveBtn}
                onClick={() => toggleSize(s)}
              >
                ✕
              </button>
            </span>
          ))}

          {onlyOffers && (
            <span className={styles.chip}>
              Solo Ofertas
              <button
                type='button'
                className={styles.chipRemoveBtn}
                onClick={() => setOnlyOffers(false)}
              >
                ✕
              </button>
            </span>
          )}

          <button
            type='button'
            className={styles.clearAllBtn}
            onClick={clearAllFilters}
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Controles de Orden y Filtro Móvil */}
      <div className={styles.controlsRow}>
        <button
          type='button'
          className={styles.mobileFilterBtn}
          onClick={() => setIsMobileModalOpen(true)}
        >
          <span>Filtros</span>
          <span>⚙</span>
        </button>

        <div className={styles.sortSelectWrap}>
          <span className={styles.sortLabel}>Ordenar por:</span>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value='newest'>Más nuevos</option>
            <option value='price-asc'>Precio: menor a mayor</option>
            <option value='price-desc'>Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Layout Principal */}
      <div className={styles.catalogLayout}>
        {/* Sidebar en Desktop */}
        <div className={styles.desktopSidebar}>
          <FilterSidebarContent />
        </div>

        {/* Grid de Productos */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '2.2rem', margin: 0 }}>
                NO HAY RESULTADOS
              </h2>
              <p style={{ color: '#8e8e93', fontSize: '0.9rem' }}>
                No encontramos sneakers que coincidan con los filtros seleccionados.
              </p>
              <button
                type='button'
                className={styles.clearAllBtn}
                onClick={clearAllFilters}
                style={{ fontSize: '0.85rem' }}
              >
                LIMPIAR TODOS LOS FILTROS
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={styles.card}
                >
                  <div className={styles.imageWrap}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImg}
                      loading='lazy'
                    />
                    <span className={styles.brandBadge}>{product.brand}</span>
                    <button
                      type='button'
                      className={styles.quickAddBtn}
                      onClick={(e) => handleQuickAdd(product, e)}
                      title='Añadir al carrito'
                      aria-label={`Añadir ${product.name}`}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtros para Móviles */}
      <Modal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        title='FILTRAR CATÁLOGO'
      >
        <FilterSidebarContent />
      </Modal>
    </div>
  )
}

