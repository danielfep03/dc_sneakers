/**
 * OffersCarousel.jsx
 * Sección 3 del Home según el plan:
 * Carrusel táctil de productos en oferta con Embla Carousel.
 * Soporta swipe en móvil y flechas en escritorio.
 * Copys 100% en español.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { getOffers } from '@/services/productService'
import ProductCard from '@/components/product/ProductCard'
import SectionTitle from '@/components/ui/SectionTitle'
import Skeleton from '@/components/ui/Skeleton'
import styles from './OffersCarousel.module.css'

export default function OffersCarousel () {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    let isMounted = true
    getOffers().then((data) => {
      if (isMounted) {
        setOffers(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <section className={styles.section} aria-label='Ofertas destacadas'>
      <SectionTitle
        subtitle='Precios especiales por tiempo limitado'
        title='OFERTAS DESTACADAS'
        action={
          <div className={styles.navControls}>
            <button
              type='button'
              className={styles.navBtn}
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label='Anterior oferta'
            >
              ←
            </button>
            <button
              type='button'
              className={styles.navBtn}
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label='Siguiente oferta'
            >
              →
            </button>
            <Link
              to='/catalogo?oferta=1'
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 800,
                marginLeft: '0.5rem'
              }}
            >
              VER TODAS →
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height='380px' />
          ))}
        </div>
      ) : (
        <div className={styles.carouselContainer}>
          <div className={styles.viewport} ref={emblaRef}>
            <div className={styles.track}>
              {offers.map((product) => (
                <div key={product.id} className={styles.slide}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
