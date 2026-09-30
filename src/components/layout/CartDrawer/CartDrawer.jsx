/**
 * CartDrawer.jsx
 * Cajón lateral del carrito según el plan (Sección 8.1):
 * - Panel lateral con los ítems, subtotal, regalo de medias y botón hacia /checkout.
 * - Conectado con cartStore y uiStore.
 * - Copys 100% en español.
 */

import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/utils/formatPrice'
import { storeConfig } from '@/config/storeConfig'
import Price from '@/components/ui/Price'
import styles from './CartDrawer.module.css'

export default function CartDrawer () {
  const isCartOpen = useUIStore((state) => state.isCartOpen)
  const closeCart = useUIStore((state) => state.closeCart)
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.getSubtotal())

  if (!isCartOpen) return null

  return (
    <div className={styles.overlay} onClick={closeCart} aria-modal='true' role='dialog'>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>TU BOLSA DE COMPRA [{items.length}]</h2>
          <button
            type='button'
            className={styles.closeBtn}
            onClick={closeCart}
            aria-label='Cerrar bolsa de compra'
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>TU BOLSA ESTÁ VACÍA</p>
            <p style={{ fontSize: '0.85rem' }}>
              Explora nuestras siluetas y agrega tu par favorito.
            </p>
            <Link
              to='/catalogo'
              className={styles.payBtn}
              onClick={closeCart}
              style={{ marginTop: '1rem', width: 'auto', padding: '0.8rem 1.5rem' }}
            >
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className={styles.item}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.thumb}
                />
                <div className={styles.info}>
                  <div>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <span className={styles.itemMeta}>Talla: COL {item.size}</span>
                  </div>

                  <div className={styles.itemBottom}>
                    <Price price={item.unitPrice * item.quantity} size='sm' />

                    <div className={styles.qtyBox}>
                      <button
                        type='button'
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.size, -1)}
                        aria-label='Disminuir cantidad'
                      >
                        -
                      </button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        type='button'
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.size, 1)}
                        aria-label='Aumentar cantidad'
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

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.giftBanner}>
              <span>🧦</span>
              <span><strong>¡Genial!</strong> Tu compra incluye {storeConfig.giftText}.</span>
            </div>

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>SUBTOTAL:</span>
              <span className={styles.totalAmount}>{formatPrice(subtotal)}</span>
            </div>

            <Link
              to='/checkout'
              className={styles.payBtn}
              onClick={closeCart}
            >
              IR A PAGAR (CONTRAENTREGA / TRANSFERENCIA) →
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
