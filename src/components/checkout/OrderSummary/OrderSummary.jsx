/**
 * OrderSummary.jsx
 * Resumen de orden en Checkout según el plan:
 * - Lista de productos (OrderItem: imagen, nombre, talla, cantidad, precio).
 * - Subtotal, Envío: GRATIS, Total en COP.
 * - Mensaje destacado obligatorio: "🧦 ¡Te regalamos un par de medias con tu pedido!".
 * Copys 100% en español.
 */

import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import { storeConfig } from '@/config/storeConfig'
import styles from './OrderSummary.module.css'

export default function OrderSummary () {
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.getSubtotal())

  return (
    <div className={styles.summaryCard}>
      <h2 className={styles.title}>RESUMEN DE TU COMPRA [{items.length}]</h2>

      <div className={styles.itemsList}>
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className={styles.itemRow}>
            <img src={item.image} alt={item.name} className={styles.thumb} />
            <div className={styles.itemInfo}>
              <h4 className={styles.itemName}>{item.name}</h4>
              <span className={styles.itemMeta}>
                Talla: COL {item.size} · Cant: {item.quantity}
              </span>
            </div>
            <span className={styles.itemPrice}>
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Regalo Obligatorio de Medias */}
      <div className={styles.giftBox}>
        <span style={{ fontSize: '1.2rem' }}>🧦</span>
        <span>
          <strong>¡Te regalamos un par de medias con tu pedido!</strong>
          <br />
          <span style={{ color: 'var(--color-text-muted)' }}>
            Diseño exclusivo streetwear incluido automáticamente.
          </span>
        </span>
      </div>

      <div className={styles.costsList}>
        <div className={styles.costRow}>
          <span>Subtotal</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>{formatPrice(subtotal)}</span>
        </div>
        <div className={styles.costRow}>
          <span>Envío nacional</span>
          <span className={styles.freeTag}>
            {storeConfig.freeShipping ? '¡GRATIS!' : '$ 15.000'}
          </span>
        </div>
        <div className={styles.costRow}>
          <span>Garantía de satisfacción</span>
          <span style={{ color: '#ffffff' }}>30 días directa</span>
        </div>
      </div>

      <div className={styles.totalRow}>
        <span>TOTAL A PAGAR:</span>
        <span className={styles.totalAmount}>{formatPrice(subtotal)}</span>
      </div>
    </div>
  )
}
