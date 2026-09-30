/**
 * BrandsSection.jsx
 * Sección 4 del Home según el plan:
 * Tarjetas de marcas (Nike, Adidas, New Balance, Jordan).
 * Cada tarjeta redirige al catálogo filtrado por marca: /catalogo?marca=...
 * Copys 100% en español.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBrands } from '@/services/brandService'
import SectionTitle from '@/components/ui/SectionTitle'
import Skeleton from '@/components/ui/Skeleton'
import styles from './BrandsSection.module.css'

export default function BrandsSection () {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getBrands().then((data) => {
      if (isMounted) {
        setBrands(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className={styles.section} aria-label='Marcas oficiales'>
      <SectionTitle
        subtitle='Las casas más influyentes del calzado mundial'
        title='MARCAS OFICIALES'
        action={
          <Link
            to='/catalogo'
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 800
            }}
          >
            VER TODAS LAS SILUETAS →
          </Link>
        }
      />

      {loading ? (
        <div className={styles.brandsGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height='160px' />
          ))}
        </div>
      ) : (
        <div className={styles.brandsGrid}>
          {brands.map((b) => (
            <Link
              key={b.id}
              to={`/catalogo?marca=${b.id}`}
              className={styles.brandCard}
            >
              <h3 className={styles.brandName}>{b.name}</h3>
              <span className={styles.brandCount}>Colección oficial</span>
              <span className={styles.actionLink}>
                Explorar catálogo <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
