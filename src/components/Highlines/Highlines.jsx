import ProductCard from '@/components/ProductCard/ProductCard'
import { CATEGORIES, SNEAKERS_DATA } from '@/data/sneakers'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import styles from './Highlines.module.css'

function Highlines () {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const categoryFromUrl = searchParams.get('category') || 'ALL'
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [favorites, setFavorites] = useState(new Set([1, 4]))

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    if (cat === 'ALL') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('category')
      setSearchParams(nextParams)
    } else {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('category', cat)
      setSearchParams(nextParams)
    }
  }

  const toggleFavorite = (id, e) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = useMemo(() => {
    return SNEAKERS_DATA.filter((product) => {
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
  }, [categoryFromUrl])
  return (
    <>
      <div className={styles.catalogControls}>
        <div className={styles.categoriesBar}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat === 'ALL' ? 'TODOS' : cat}
            </button>
          ))}
        </div>

        <div className={styles.gridInfo}>
          <h3 className={styles.sectionHeading}>PRODUCTOS DESTACADOS</h3>
          <span className={styles.productCount}>
            Mostrando {filteredProducts.length} de {SNEAKERS_DATA.length} tenis
          </span>
        </div>
      </div>

      {filteredProducts.length > 0
        ? (
          <section className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </section>
          )
        : (
          <div className={styles.noResults}>
            <h3>No se encontraron tenis</h3>
            <p>Intenta ajustar tu búsqueda o prueba con otra categoría.</p>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery('')
                handleCategoryChange('ALL')
              }}
            >
              Ver todos los tenis
            </button>
          </div>
          )}
    </>
  )
}

export default Highlines
