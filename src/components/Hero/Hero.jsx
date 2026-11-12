import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Drop Especial Streetwear',
    link: '/categorias',
    desktopImage: 'https://cdn.shopify.com/s/files/1/0687/7691/9313/files/buce-bn26-b01-desktop.webp?v=1793696233',
    mobileImage: 'https://cdn.shopify.com/s/files/1/0687/7691/9313/files/buce-bn26-b01-mobile.webp?v=1793696255'
  },
  {
    id: 2,
    title: 'Colección Urbana & Retro',
    link: '/categorias?category=casual',
    desktopImage: 'https://colombiashoes.com.co/cdn/shop/files/Oferta_Black_Days_de_Colombia_Shoes.png?v=1794195007&width=3000',
    mobileImage: 'https://images.unsplash.com/photo-1512374382149-233c42b661ac?auto=format&fit=crop&w=900&q=85'
  },
  {
    id: 3,
    title: 'Novedades & Siluetas Exclusivas',
    link: '/categorias?tag=sale',
    desktopImage: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1920&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=900&q=85'
  }
]

const TICKER_PHRASES = [
  'ENVÍOS A TODA COLOMBIA',
  'PAGO CONTRAENTREGA',
  '30 DÍAS DE GARANTÍA',
  'MEDIAS DE REGALO',
  'COMPRA 100% SEGURA'
]

export default function Hero () {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  const goToSlide = (idx) => {
    setCurrentSlide(idx)
  }

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [nextSlide, isPaused])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
  }

  return (
    <section
      className={styles.heroSection}
      aria-label='Carrusel principal de colecciones'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={styles.carouselContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.slidesTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide, idx) => (
            <Link
              key={slide.id}
              to={slide.link}
              className={styles.slide}
              aria-label={slide.title}
              tabIndex={currentSlide === idx ? 0 : -1}
            >
              <picture className={styles.pictureWrapper}>
                <source
                  media='(max-width: 768px)'
                  srcSet={slide.mobileImage}
                />
                <img
                  src={slide.desktopImage}
                  alt={slide.title}
                  className={styles.bannerImage}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            </Link>
          ))}
        </div>

        {/* Flechas de navegación */}
        <button
          type='button'
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={(e) => {
            e.preventDefault()
            prevSlide()
          }}
          aria-label='Slide anterior'
        >
          ‹
        </button>
        <button
          type='button'
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={(e) => {
            e.preventDefault()
            nextSlide()
          }}
          aria-label='Siguiente slide'
        >
          ›
        </button>

        {/* Indicadores / Dots */}
        <div className={styles.dotsContainer}>
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type='button'
              className={`${styles.dot} ${currentSlide === idx ? styles.activeDot : ''}`}
              onClick={(e) => {
                e.preventDefault()
                goToSlide(idx)
              }}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Marquee ticker inferior oficial */}
      <div className={styles.bottomTicker}>
        <div className={styles.tickerTrack}>
          {[...TICKER_PHRASES, ...TICKER_PHRASES].map((text, idx) => (
            <span key={idx} className={styles.tickerItem}>
              {text} <span className={styles.tickerPlus}>+</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
