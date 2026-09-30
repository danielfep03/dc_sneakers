/**
 * Price.jsx
 * Componente atómico para renderizar precios en Pesos Colombianos (COP).
 * Si existe salePrice, muestra tachado el original + el de oferta a un lado.
 */

import { formatPrice } from '@/utils/formatPrice'
import styles from './Price.module.css'

export default function Price ({
  price,
  salePrice = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) {
  const hasSale = salePrice !== null && salePrice < price

  return (
    <div className={`${styles.priceContainer} ${styles[size]} ${className}`}>
      <span className={styles.current}>
        {formatPrice(hasSale ? salePrice : price)}
      </span>
      {hasSale && (
        <span className={styles.original}>
          {formatPrice(price)}
        </span>
      )}
    </div>
  )
}
