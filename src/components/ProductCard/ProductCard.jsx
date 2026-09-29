import styles from './ProductCard.module.css'

export default function ProductCard ({ product, isFavorite, onToggleFavorite, onClick }) {
  return (
    <div
      className={styles.productCard}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardBrand}>{product.brand}</span>
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.isFavorite : ''}`}
          onClick={(e) => onToggleFavorite(product.id, e)}
          aria-label='Agregar a favoritos'
        >
          <svg viewBox='0 0 24 24' width='18' height='18' fill={isFavorite ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
          </svg>
        </button>
      </div>

      <div className={styles.cardImageWrapper}>
        <div className={styles.cardGlow} />
        <img src={product.image} alt={product.name} className={styles.cardImg} />
      </div>

      <div className={styles.cardInfo}>
        <h4 className={styles.cardName}>{product.name}</h4>

        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>${product.price.toFixed(2)}</span>
          <div className={styles.ratingBadge}>
            <svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor' className={styles.starIcon}>
              <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
            </svg>
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.quickAddOverlay}>
        <span>VER PRODUCTO COMPLETO</span>
      </div>
    </div>
  )
}
