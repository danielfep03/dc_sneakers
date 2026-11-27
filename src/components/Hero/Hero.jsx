import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

const Desktop1 = '/WEB_1.webp'
const Desktop2 = '/WEB_2.webp'
const Mobile1 = '/MOBILE_1.webp'
const Mobile2 = '/MOBILE_2.webp'

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Drop Especial Streetwear',
    link: '/categorias',
    desktopImage: Desktop1,
    mobileImage: Mobile1
  },
  {
    id: 2,
    title: 'Colección Urbana & Retro',
    link: '/categorias?category=casual',
    desktopImage: Desktop2,
    mobileImage: Mobile2
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
