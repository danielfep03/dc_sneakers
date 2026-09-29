import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import styles from '../../pages/Home/Home.module.css'

export default function CartDrawer () {
  const navigate = useNavigate()
  const { cart, isCartOpen, toggleCart, updateQuantity, getTotalItems, getSubtotal } = useCartStore()
  const cartCount = getTotalItems()
  const subtotal = getSubtotal()

  if (!isCartOpen) return null

  const handleGoToCheckout = () => {
    toggleCart(false)
    navigate('/checkout')
  }

  return (
    <div className={styles.cartOverlay} onClick={() => toggleCart(false)}>
      <div className={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h3>Tu Carrito ({cartCount})</h3>
          <button className={styles.closeCartBtn} onClick={() => toggleCart(false)} aria-label='Cerrar Carrito'>✕</button>
        </div>

        <div className={styles.cartItemsWrapper}>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${item.size}-${item.color?.name || 'color'}`} className={styles.cartItem}>
                <img src={item.product.image} alt={item.product.name} className={styles.cartItemImg} />
                <div className={styles.cartItemDetails}>
                  <h4>{item.product.name}</h4>
                  <span className={styles.cartItemMeta}>Talla: {item.size} | {item.color?.name}</span>
                  <div className={styles.cartItemPriceRow}>
                    <span className={styles.cartItemPrice}>${(item.product.price * item.quantity).toFixed(2)}</span>
                    <div className={styles.quantityControls}>
                      <button onClick={() => updateQuantity(index, -1)} aria-label='Disminuir cantidad'>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} aria-label='Aumentar cantidad'>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyCart}>
              <p>Aún no has agregado tenis a tu bolsa.</p>
              <button className={styles.startShoppingBtn} onClick={() => toggleCart(false)}>
                Empezar a comprar
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)} USD</span>
            </div>
            <div className={styles.shippingRow}>
              <span>Envío (Colombia)</span>
              <span className={styles.freeLabel}>GRATIS</span>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>${subtotal.toFixed(2)} USD</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleGoToCheckout}>
              FINALIZAR COMPRA
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
