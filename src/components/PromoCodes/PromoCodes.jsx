import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublicCoupons } from '@/services/couponService'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import styles from './PromoCodes.module.css'

export default function PromoCodes () {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const applyCoupon = useCartStore((state) => state.applyCoupon)

  useEffect(() => {
    let isMounted = true

    async function fetchCoupons () {
      try {
        const data = await getPublicCoupons()
        if (isMounted) {
          setCoupons(data)
        }
      } catch (err) {
        console.error('Error al cargar cupones:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCoupons()

    return () => {
      isMounted = false
    }
  }, [])

  const handleCopyCode = async (coupon) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(coupon.code)
      }
    } catch {
      // Fallback si el portapapeles está bloqueado
    }
    applyCoupon(coupon)
    setCopiedCode(coupon.code)
    setTimeout(() => {
      setCopiedCode(null)
    }, 2800)
  }

  if (!loading && coupons.length === 0) {
    return null
  }

  return (
    <section className={styles.section} aria-label='Códigos de descuento disponibles'>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.scriptBadge}>BENEFICIOS EXCLUSIVOS</span>
            <h2 className={styles.mainTitle}>CÓDIGOS DE DESCUENTO</h2>
          </div>
          <p className={styles.subtitle}>
            Aprovecha estos cupones oficiales sincronizados en tiempo real. Aplícalos directamente o cópialos para tu compra.
          </p>
        </div>

        {loading
          ? (
            <div className={styles.skeletonGrid}>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
            )
          : (
            <div className={styles.grid}>
              {coupons.map((coupon) => {
                const isCopied = copiedCode === coupon.code
                const hasMinSubtotal = coupon.min_subtotal > 0
                const hasMaxUses = coupon.max_uses !== null
                const usesRemaining = hasMaxUses ? Math.max(0, coupon.max_uses - coupon.uses_count) : null

                return (
                  <div key={coupon.id || coupon.code} className={styles.couponCard}>
                    <div className={styles.notchLeft} />
                    <div className={styles.notchRight} />

                    <div className={styles.cardHeader}>
                      <span className={styles.badge}>{coupon.badge || 'PROMO'}</span>
                      <span className={styles.ticketType}>SUPABASE DROP</span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.discountValue}>{coupon.label}</h3>
                      {coupon.description && (
                        <p className={styles.description}>{coupon.description}</p>
                      )}

                      <div className={styles.metaGroup}>
                        {hasMinSubtotal && (
                          <span className={styles.minRequirement}>
                            Mín. compra: {formatPrice(coupon.min_subtotal)}
                          </span>
                        )}
                        {hasMaxUses && (
                          <span className={styles.usesLeft}>
                            {usesRemaining} {usesRemaining === 1 ? 'uso restante' : 'usos restantes'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.codeBox}>
                        <span className={styles.codeText}>{coupon.code}</span>
                        <button
                          type='button'
                          onClick={() => handleCopyCode(coupon)}
                          className={`${styles.copyBtn} ${isCopied ? styles.copyBtnSuccess : ''}`}
                          aria-label={`Copiar cupón ${coupon.code}`}
                        >
                          {isCopied ? '✓ APLICADO' : 'COPIAR'}
                        </button>
                      </div>

                      <Link to='/categorias' className={styles.shopLink}>
                        COMPRAR AHORA →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
            )}
      </div>
    </section>
  )
}
