import { useProducts } from '@/hooks/useCatalog'
import { pickDefaultSelection } from '@/services/productService'
import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/utils/formatPrice'
import { Link } from 'react-router-dom'
import styles from './Offers2.module.css'

export default function Offers2 () {
  const { addItem, toggleCart } = useCartStore()

  // Ofertas reales: productos con sale_price definido en la BD
  const { products } = useProducts()
  const offerProducts = products.filter((p) => p.originalPrice !== null).slice(0, 4)

  const handleQuickAdd = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    const selection = pickDefaultSelection(product)
    if (!selection) return // agotado
    addItem(product, selection.size, selection.color, 1)
    toggleCart(true)
  }

  return (
    <section className={styles.offersSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>OFERTAS LIMITADAS</h2>
          <span className={styles.titleArrow}>→</span>
        </div>
        <Link to='/categorias?tag=sale' className={styles.viewAllLink}>
          VER TODAS <span>→</span>
        </Link>
      </div>

      <div className={styles.productsGrid}>
        {offerProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.productImg}
                loading='lazy'
              />
              <span className={styles.discountBadge}>
                -{product.discountPercent}% DTO
              </span>
              <button
                type='button'
                className={styles.quickAddBtn}
                onClick={(e) => handleQuickAdd(product, e)}
                title='Añadir rápido'
                aria-label={`Añadir ${product.name} al carrito`}
              >
                +
              </button>
            </div>

            <div className={styles.cardFooter}>
              <h3 className={styles.productTitle}>{product.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.priceCurrent}>{formatPrice(product.price)}</span>
                <span className={styles.priceOriginal}>{formatPrice(product.originalPrice)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
