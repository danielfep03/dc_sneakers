/**
 * Product2.jsx
 * Vista de Detalle de Producto V2 con estética streetwear:
 * - Compatible con búsqueda por ID numérico o slug.
 * - LiveViewers (contador de espectadores en vivo).
 * - Galería de imágenes interactiva con miniaturas.
 * - Selector de tallas con soporte de tallas agotadas y guía de tallas modal.
 * - AddiBadge informativo ("Paga a cuotas con 0% de interés").
 * - Botón de compra contraentrega conectado a useCartStore.
 * - Copys 100% en español.
 */

import SizeGuideModal from '@/components/product/SizeGuideModal'
import { SNEAKERS_DATA } from '@/data/sneakers'
import { useCartStore } from '@/store/useCartStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/utils/formatPrice'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Product2.module.css'

export default function Product2 () {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, toggleCart } = useCartStore()
  const openSizeGuide = useUIStore((state) => state.openSizeGuide)

  // Encontrar producto por ID numérico o fallback por slug
  const product =
    SNEAKERS_DATA.find((p) => String(p.id) === String(id)) ||
    SNEAKERS_DATA[0]

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 40)
  const [selectedImage, setSelectedImage] = useState(product?.image)
  const [viewers, setViewers] = useState(7)

  // Imágenes de galería (principal + secundarias de prueba)
  const galleryImages = [
    product?.image,
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
  ].filter(Boolean)

  // Efecto de espectadores en vivo dinámicos (cambia cada 4s)
  useEffect(() => {
    setSelectedImage(product?.image)
    const interval = setInterval(() => {
      setViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2
        const next = prev + delta
        if (next < 3) return 3
        if (next > 15) return 15
        return next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    const defaultColor = product.colors?.[0] || { name: 'Default', hex: '#000' }
    addItem(product, selectedSize, defaultColor, 1)
    toggleCart(true)
  }

  if (!product) {
    return (
      <div className={styles.productPage} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Sneaker no encontrado</h2>
        <button type='button' className={styles.backBtn} onClick={() => navigate('/categorias')}>
          VOLVER AL CATÁLOGO
        </button>
      </div>
    )
  }

  return (
    <div className={styles.productPage}>
      <button
        type='button'
        className={styles.backBtn}
        onClick={() => navigate(-1)}
      >
        ← VOLVER AL CATÁLOGO
      </button>

      <div className={styles.productLayout}>
        {/* Galería de Producto */}
        <div className={styles.galleryWrap}>
          <div className={styles.mainImageWrap}>
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className={styles.mainImage}
            />
            <span className={styles.tagBadge}>DISPONIBLE CONTRAENTREGA</span>
          </div>

          <div className={styles.thumbnails}>
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type='button'
                className={`${styles.thumbBtn} ${
                  selectedImage === img ? styles.thumbActive : ''
                }`}
                onClick={() => setSelectedImage(img)}
                aria-label={`Ver vista ${idx + 1}`}
              >
                <img src={img} alt='' className={styles.thumbImg} />
              </button>
            ))}
          </div>
        </div>

        {/* Columna de Detalles y Compra */}
        <div className={styles.detailsCol}>
          <span className={styles.brandLabel}>{product.brand} // COLECCIÓN OFICIAL</span>
          <h1 className={styles.productTitle}>{product.name}</h1>

          {/* Precio */}
          <div className={styles.priceRow}>
            <span className={styles.priceTag}>{formatPrice(product.price)}</span>
            <span className={styles.originalPrice}>
              {formatPrice(Math.round(product.price * 1.25))}
            </span>
          </div>

          {/* Indicador de Personas Viendo en Vivo */}
          <div className={styles.liveBox} aria-live='polite'>
            <span className={styles.pulseDot} />
            <span>
              👀 <strong className={styles.liveCount}>{viewers} personas</strong> están viendo este sneaker ahora mismo
            </span>
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Selector de Tallas */}
          <div className={styles.sizesSection}>
            <div className={styles.sizesHeader}>
              <span className={styles.sectionLabel}>SELECCIONA TU TALLA (COL / EU):</span>
              <button
                type='button'
                className={styles.guideBtn}
                onClick={openSizeGuide}
              >
                Guía de tallas 📏
              </button>
            </div>

            <div className={styles.sizesGrid}>
              {product.sizes.map((size, index) => {
                // Simular una talla agotada de prueba
                const isOutOfStock = index === 2
                const isSelected = selectedSize === size

                return (
                  <button
                    key={size}
                    type='button'
                    className={`${styles.sizeBtn} ${
                      isSelected ? styles.sizeActive : ''
                    } ${isOutOfStock ? styles.sizeDisabled : ''}`}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(size)}
                    aria-label={`Talla ${size} ${isOutOfStock ? 'Agotada' : 'Disponible'}`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Badge Informativo de Addi */}
          <div className={styles.addiBox}>
            <span className={styles.addiLogo}>addi</span>
            <div className={styles.addiText}>
              <span className={styles.addiMain}>Compra ahora y paga a cuotas con 0% de interés</span>
              <span className={styles.addiSub}>Sin tarjeta de crédito. Aprobación inmediata en minutos.</span>
            </div>
          </div>

          {/* Botón Principal de Compra */}
          <button
            type='button'
            className={styles.buyBtn}
            onClick={handleAddToCart}
          >
            <span>AGREGAR AL CARRITO</span>
            <span>→</span>
          </button>

          {/* Beneficios */}
          <div className={styles.perksList}>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>Pagas cuando recibes en tu puerta (Toda Colombia 🇨🇴)</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>Garantía de 30 días y cambios por talla sin costo adicional</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>🧦 Incluye par de medias de regalo con tu pedido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Oficial de Guía de Tallas */}
      <SizeGuideModal />
    </div>
  )
}

