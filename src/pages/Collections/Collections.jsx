import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CATEGORIES, SNEAKERS_DATA } from '../../data/sneakers'
import { useUIStore } from '../../store/useUIStore'
import styles from './Collections.module.css'

function Collections ({
  onSelectProduct,
  initialCategory = 'ALL'
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { searchQuery, setSearchQuery } = useUIStore()

  const categoryFromUrl = searchParams.get('category') || initialCategory

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedSize, setSelectedSize] = useState('ALL')
  const [maxPrice, setMaxPrice] = useState(300)
  const [sortBy, setSortBy] = useState('featured')
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  const handleSelectProduct = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product)
    } else {
      navigate(`/product/${product.id}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Extract unique brands and sizes across catalog
  const availableBrands = useMemo(() => {
    const brands = SNEAKERS_DATA.map(p => p.brand)
    return ['ALL', ...Array.from(new Set(brands))]
  }, [])

  const availableSizes = useMemo(() => {
    const sizes = new Set()
    SNEAKERS_DATA.forEach(p => p.sizes.forEach(s => sizes.add(s)))
    return ['ALL', ...Array.from(sizes).sort((a, b) => a - b)]
  }, [])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    const result = SNEAKERS_DATA.filter((product) => {
      const matchesCat = selectedCategory === 'ALL' || product.category === selectedCategory
      const matchesBrand = selectedBrand === 'ALL' || product.brand === selectedBrand
      const matchesSize = selectedSize === 'ALL' || product.sizes.includes(Number(selectedSize))
      const matchesPrice = product.price <= maxPrice
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCat && matchesBrand && matchesSize && matchesPrice && matchesSearch
    })

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [selectedCategory, selectedBrand, selectedSize, maxPrice, searchQuery, sortBy])

  const handleResetFilters = () => {
    setSelectedCategory('ALL')
    setSelectedBrand('ALL')
    setSelectedSize('ALL')
    setMaxPrice(300)
    setSortBy('featured')
    if (setSearchQuery) setSearchQuery('')
  }

  return (
    <div className={styles.collectionsContainer}>
      {/* Header Banner */}
      <div className={styles.collectionsHeader}>
        <span className={styles.collectionsSubtitle}>CATÁLOGO COMPLETO DC SNEAKERS</span>
        <h1 className={styles.collectionsTitle}>COLECCIONES EXCLUSIVAS</h1>
        <p className={styles.collectionsDesc}>
          Explora la colección completa de zapatillas urbanas, baloncesto y voleibol. Filtra por talla, marca, categoría o precio para encontrar tu par perfecto.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Products Grid */}
      <div className={styles.collectionsContent}>
        {/* Toggle Filters for Mobile */}
        <button
          className={styles.mobileFilterToggle}
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
        >
          <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2'>
            <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
          </svg>
          <span>{showFiltersMobile ? 'Ocultar Filtros' : 'Filtrar Productos'}</span>
          <span className={styles.filterBadgeCount}>{filteredProducts.length}</span>
        </button>

        {/* Sidebar Filters */}
        <aside className={`${styles.filterSidebar} ${showFiltersMobile ? styles.mobileFiltersActive : ''}`}>
          <div className={styles.filterSidebarHeader}>
            <h3>Filtros de Búsqueda</h3>
            <button className={styles.resetFiltersBtn} onClick={handleResetFilters}>
              Limpiar Todo
            </button>
          </div>

          {/* Categoría */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoría</label>
            <div className={styles.filterOptionsStack}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.filterChip} ${selectedCategory === cat ? styles.filterChipActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'ALL' ? 'Todas las Categorías' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Marca */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Marca</label>
            <div className={styles.filterOptionsGrid}>
              {availableBrands.map(brand => (
                <button
                  key={brand}
                  className={`${styles.filterChip} ${selectedBrand === brand ? styles.filterChipActive : ''}`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand === 'ALL' ? 'Todas' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Tallas EU */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Talla EU</label>
            <div className={styles.sizesGrid}>
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`${styles.sizeBox} ${selectedSize === size ? styles.sizeBoxActive : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size === 'ALL' ? 'Todas' : `EU ${size}`}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Precio */}
          <div className={styles.filterGroup}>
            <div className={styles.priceLabelRow}>
              <label className={styles.filterLabel}>Precio Máximo</label>
              <span className={styles.priceValue}>${maxPrice} USD</span>
            </div>
            <input
              type='range'
              min='50'
              max='300'
              step='10'
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className={styles.priceRangeInput}
            />
          </div>
        </aside>

        {/* Right Section: Toolbar + Products Grid */}
        <div className={styles.productsMainArea}>
          {/* Top Bar: Count & Sorting */}
          <div className={styles.collectionsToolbar}>
            <span className={styles.resultsCount}>
              Mostrando <strong>{filteredProducts.length}</strong> de {SNEAKERS_DATA.length} tenis
            </span>

            <div className={styles.sortWrapper}>
              <label htmlFor='sortBy'>Ordenar por:</label>
              <select
                id='sortBy'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value='featured'>Destacados</option>
                <option value='price-low'>Precio: Menor a Mayor</option>
                <option value='price-high'>Precio: Mayor a Menor</option>
                <option value='rating'>Mejor Valorados ⭐</option>
              </select>
            </div>
          </div>

          {/* Grid de Productos */}
          {filteredProducts.length > 0
            ? (
              <div className={styles.collectionsGrid}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={styles.productCard}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.cardBrand}>{product.brand}</span>
                      <span className={styles.cardCategoryBadge}>{product.category}</span>
                    </div>

                    <div className={styles.cardImageWrapper}>
                      <img src={product.image} alt={product.name} className={styles.cardImg} />
                    </div>

                    <div className={styles.cardInfo}>
                      <h4 className={styles.cardName}>{product.name}</h4>
                      <p className={styles.cardSizesMeta}>
                        Tallas: {product.sizes.map(s => `EU ${s}`).join(', ')}
                      </p>

                      <div className={styles.cardFooter}>
                        <span className={styles.cardPrice}>${product.price.toFixed(2)} USD</span>
                        <div className={styles.ratingBadge}>
                          <svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor'>
                            <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                          </svg>
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.quickAddOverlay}>
                      <span>VER DETALLES & COMPRAR</span>
                    </div>
                  </div>
                ))}
              </div>
              )
            : (
              <div className={styles.noResultsBox}>
                <svg viewBox='0 0 24 24' width='64' height='64' fill='none' stroke='currentColor' strokeWidth='1.5'>
                  <circle cx='11' cy='11' r='8' />
                  <line x1='21' y1='21' x2='16.65' y2='16.65' />
                </svg>
                <h3>No encontramos zapatillas con estos filtros</h3>
                <p>Prueba ajustando el rango de precio, cambiando la talla o eliminando términos de búsqueda.</p>
                <button className={styles.resetFiltersBtnLarge} onClick={handleResetFilters}>
                  Restablecer Filtros
                </button>
              </div>
              )}
        </div>
      </div>
    </div>
  )
}

export default Collections
