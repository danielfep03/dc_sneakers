import { useCartStore } from '@/store/useCartStore'
import { formatPrice } from '@/utils/formatPrice'
import { Link } from 'react-router-dom'
import styles from './CartDrawer2.module.css'

export default function CartDrawer2 () {
  const { isCartOpen, toggleCart, cart, updateQuantity, getSubtotal } = useCartStore()

  if (!isCartOpen) return null

  const subtotal = getSubtotal()

  return (
    <div className={styles.cartOverlay} onClick={() => toggleCart(false)}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label='Carrito de compras'
      >
        <div className={styles.header}>
          <h2 className={styles.title}>TU BOLSA [{cart.length}]</h2>
          <button
            type='button'
            className={styles.closeBtn}
            onClick={() => toggleCart(false)}
            aria-label='Cerrar carrito'
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>TU BOLSA ESTÁ VACÍA</p>
            <p style={{ fontSize: '0.85rem' }}>Explora nuestras siluetas y agrega tu par favorito.</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${index}`} className={styles.cartItem}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className={styles.itemThumb}
                />
                <div className={styles.itemInfo}>
                  <div>
                    <h4 className={styles.itemTitle}>{item.product.name}</h4>
                    <p className={styles.itemVariant}>
                      Talla: EU {item.size} {item.color?.name ? `• ${item.color.name}` : ''}
                    </p>
                  </div>
                  <div className={styles.itemRow}>
                    <span className={styles.itemPrice}>
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <div className={styles.qtyControls}>
                      <button
                        type='button'
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(index, -1)}
                      >
                        -
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        type='button'
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>SUBTOTAL:</span>
              <span className={styles.totalAmount}>{formatPrice(subtotal)}</span>
            </div>
            <Link
              to='/checkout'
              className={styles.checkoutBtn}
              onClick={() => toggleCart(false)}
            >
              FINALIZAR PEDIDO
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
