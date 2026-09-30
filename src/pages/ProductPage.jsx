/**
 * ProductPage.jsx
 * Vista de Detalle de Producto según el plan (Sección 8.5):
 * - ProductGallery (imagen principal + miniaturas).
 * - LiveViewers (contador de personas simulado en vivo).
 * - Price, nombre, marca y descripción.
 * - SizeSelector (tallas agotadas deshabilitadas).
 * - SizeGuideModal (tabla oficial).
 * - AddiBadge (informativo).
 * - Botón "Agregar al carrito" con validación de talla obligatoria.
 * Copys 100% en español.
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductBySlug } from '@/services/productService'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import ProductGallery from '@/components/product/ProductGallery'
import SizeSelector from '@/components/product/SizeSelector'
import SizeGuideModal from '@/components/product/SizeGuideModal'
import LiveViewers from '@/components/product/LiveViewers'
import AddiBadge from '@/components/product/AddiBadge'
import Price from '@/components/ui/Price'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import styles from './ProductPage.module.css'

export default function ProductPage () {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [hasSizeError, setHasSizeError] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)

  useEffect(() => {
    let isCurrent = true
    setLoading(true)
    setSelectedSize(null)
    setHasSizeError(false)

    getProductBySlug(slug)
      .then((data) => {
        if (!isCurrent) return
        setProduct(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando producto:', err)
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [slug])

  const handleAddToCart = () => {
    if (!selectedSize) {
      setHasSizeError(true)
      return
    }

    addItem(product, selectedSize, 1)
    openCart()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.layout}>
          <Skeleton height='480px' />
          <div>
            <Skeleton height='40px' style={{ marginBottom: '1rem' }} />
            <Skeleton height='60px' style={{ marginBottom: '1rem' }} />
            <Skeleton height='120px' />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
          PRODUCTO NO ENCONTRADO
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          La silueta que buscas no está disponible o el enlace es incorrecto.
        </p>
        <Button variant='primary' size='md' onClick={() => navigate('/catalogo')}>
          VOLVER AL CATÁLOGO
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button
        type='button'
        className={styles.backBtn}
        onClick={() => navigate(-1)}
      >
        ← VOLVER AL ARCHIVO
      </button>

      <div className={styles.layout}>
        {/* Galería de Producto */}
        <ProductGallery
          images={product.images || [product.image]}
          productName={product.name}
        />

        {/* Panel de Información y Compra */}
        <div className={styles.infoCol}>
          <span className={styles.brand}>{product.brandId || product.brand} // ARCHIVO OFICIAL</span>
          <h1 className={styles.title}>{product.name}</h1>

          {/* Precio y Descuento */}
          <Price
            price={product.price}
            salePrice={product.salePrice}
            size='lg'
          />

          {/* Visitantes en Vivo */}
          <LiveViewers style={{ marginTop: '1rem' }} />

          {/* Descripción */}
          <p className={styles.desc}>{product.description}</p>

          {/* Selector de Tallas */}
          <SizeSelector
            sizes={product.sizes}
            selectedSize={selectedSize}
            onSelectSize={(size) => {
              setSelectedSize(size)
              setHasSizeError(false)
            }}
            hasError={hasSizeError}
          />

          {/* Badge Informativo de Addi */}
          <AddiBadge />

          {/* Botón Principal de Compra */}
          <Button
            variant='primary'
            size='lg'
            fullWidth
            onClick={handleAddToCart}
          >
            <span>AGREGAR A LA BOLSA</span>
            <span>→</span>
          </Button>

          {/* Beneficios de Compra */}
          <div className={styles.perksList}>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>Envíos contraentrega a toda Colombia (Pagas al recibir)</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>Garantía de 30 días y cambios por talla sin costo adicional</span>
            </div>
            <div className={styles.perkItem}>
              <span className={styles.perkDot} />
              <span>Incluye par de medias de regalo con tu compra</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Guía de Tallas */}
      <SizeGuideModal />
    </div>
  )
}
