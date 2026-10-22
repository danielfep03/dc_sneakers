import { useState } from 'react'
import { Link } from 'react-router-dom'
import { validateDiscountCode } from '@/data/discountCodes'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import styles from './CartDrawer.module.css'

export default function CartDrawer () {
  const {
    isCartOpen,
    toggleCart,
    cart,
    updateQuantity,
    getSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getTotal
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false)

  if (!isCartOpen) return null

  const subtotal = getSubtotal()
  const discountAmount = getDiscountAmount()
  const total = getTotal()

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    const result = validateDiscountCode(couponInput, subtotal)
    if (!result.valid) {
      setCouponError(result.error)
      return
    }
    applyCoupon(result.coupon)
    setCouponInput('')
    setIsCouponFormOpen(false)
  }

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

        {cart.length === 0
          ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>TU BOLSA ESTÁ VACÍA</p>
              <p style={{ fontSize: '0.85rem' }}>Explora nuestras siluetas y agrega tu par favorito.</p>
            </div>
            )
          : (
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
            {/* Sección de Cupón de Descuento en Carrito */}
            <div className={styles.couponContainer}>
              {appliedCoupon
                ? (
                  <div className={styles.appliedPill}>
                    <div className={styles.appliedPillText}>
                      <span className={styles.appliedTag}>🏷️ {appliedCoupon.code}</span>
                      <span className={styles.appliedDesc}>{appliedCoupon.label}</span>
                    </div>
                    <button
                      type='button'
                      className={styles.removeCouponBtn}
                      onClick={removeCoupon}
                      title='Remover cupón'
                    >
                      ✕
                    </button>
                  </div>
                  )
                : isCouponFormOpen
                  ? (
                    <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                      <div className={styles.couponInputGroup}>
                        <input
                          type='text'
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase())
                            if (couponError) setCouponError('')
                          }}
                          placeholder='CÓDIGO (EJ: DC10)'
                          className={styles.couponDrawerInput}
                          autoFocus
                        />
                        <button type='submit' className={styles.couponDrawerBtn}>
                          APLICAR
                        </button>
                      </div>
                      {couponError && <p className={styles.couponDrawerError}>{couponError}</p>}
                    </form>
                    )
                  : (
                    <button
                      type='button'
                      className={styles.openCouponBtn}
                      onClick={() => setIsCouponFormOpen(true)}
                    >
                      + ¿Tienes un cupón de descuento?
                    </button>
                    )}
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.summaryRow}>
                <span className={styles.subtotalLabel}>SUBTOTAL:</span>
                <span className={styles.subtotalAmount}>{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className={styles.discountRow}>
                  <span className={styles.discountLabel}>DESCUENTO ({appliedCoupon?.code}):</span>
                  <span className={styles.discountAmount}>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className={`${styles.summaryRow} ${styles.finalTotalRow}`}>
                <span className={styles.totalLabel}>TOTAL A PAGAR:</span>
                <span className={styles.totalAmount}>{formatPrice(total)}</span>
              </div>
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
