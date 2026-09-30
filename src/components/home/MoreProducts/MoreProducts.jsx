/**
 * MoreProducts.jsx
 * Sección 5 del Home según el plan:
 * Cuadrícula de más artículos con botón de "Ver todo el catálogo".
 * Copys 100% en español.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNewProducts } from '@/services/productService'
import ProductCard from '@/components/product/ProductCard'
import SectionTitle from '@/components/ui/SectionTitle'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import styles from './MoreProducts.module.css'

export default function MoreProducts () {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getNewProducts(8).then((data) => {
      if (isMounted) {
        setProducts(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className={styles.section} aria-label='Más artículos'>
      <SectionTitle
        subtitle='Últimas entradas al inventario'
        title='MÁS ARTÍCULOS DESTACADOS'
      />

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height='380px' />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className={styles.centerBtn}>
        <Link to='/catalogo' style={{ textDecoration: 'none' }}>
          <Button variant='outline' size='lg'>
            <span>VER TODO EL CATÁLOGO</span>
            <span>→</span>
          </Button>
        </Link>
      </div>
    </section>
  )
}
