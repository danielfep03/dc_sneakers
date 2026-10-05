import { useProducts } from '@/hooks/useCatalog'
import { pickDefaultSelection } from '@/services/productService'
import { useCartStore } from '@/store/useCartStore'
import { Link } from 'react-router-dom'
import styles from './Hero2.module.css'

export default function Hero2 () {
  const { addItem, toggleCart } = useCartStore()

  const { products } = useProducts()
  const featuredDrop = products[0]

  const handleQuickAdd = () => {
    if (!featuredDrop) return
    const selection = pickDefaultSelection(featuredDrop)
    if (!selection) return // agotado
    addItem(featuredDrop, selection.size, selection.color, 1)
    toggleCart(true)
  }

  const tickerPhrases = [
    'ENVÍOS A TODA COLOMBIA',
    'PAGO CONTRAENTREGA',
    '30 DÍAS DE GARANTÍA',
    'MEDIAS DE REGALO',
    'COMPRA 100% SEGURA'
  ]

  return (
    <section className={styles.heroSection}>
      <div className={styles.dotsCol}>
        <span className={`${styles.dot} ${styles.dotActive}`} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.leftColumn}>
          <p className={styles.scriptBadge}>Domina las calles</p>
          <h1 className={styles.heroTitle}>
            HECHOS<br />
            DIFERENTE<span className={styles.voltDot}>.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Moda urbana que rompe las reglas y marca tendencia. Descubre las siluetas más exclusivas con envíos y pago contraentrega en toda Colombia.
          </p>

          <Link to='/categorias' className={styles.ctaBtn}>
            <span>COMPRAR AHORA</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>

          <div>
            <span className={styles.scrollIndicator}>
              ↓ DESLIZAR
            </span>
          </div>
        </div>

        {featuredDrop && (
          <div className={styles.dropCard}>
            <img
              src={featuredDrop.image}
              alt={featuredDrop.name}
              className={styles.dropThumb}
            />
            <div className={styles.dropInfo}>
              <span className={styles.dropTag}>NUEVO DROP</span>
              <p className={styles.dropTitle}>COLECCIÓN "{featuredDrop.brand.toUpperCase()}"</p>
            </div>
            <button
              type='button'
              className={styles.dropAddBtn}
              onClick={handleQuickAdd}
              title='Añadir rápido al carrito'
              aria-label='Añadir rápido al carrito'
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className={styles.bottomTicker}>
        <div className={styles.tickerTrack}>
          {[...tickerPhrases, ...tickerPhrases].map((text, idx) => (
            <span key={idx} className={styles.tickerItem}>
              {text} <span className={styles.tickerPlus}>+</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
