import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SNEAKERS_DATA } from '../../data/sneakers'
import { useCartStore } from '../../store/useCartStore'
import styles from '../Home/Home.module.css'

export default function Product () {
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.id ? Number(params.id) : null

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailSize, setDetailSize] = useState(null)
  const [detailColor, setDetailColor] = useState(0)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const { addItem, toggleCart } = useCartStore()

  useEffect(() => {
    if (productId) {
      const prod = SNEAKERS_DATA.find((p) => p.id === productId)
      if (prod) {
        setSelectedProduct(prod)
        setDetailSize(prod.sizes[2] || prod.sizes[0])
        setDetailColor(0)
      }
    }
  }, [productId])

  const handleAddToCart = () => {
    if (!selectedProduct) return
    const chosenColor = selectedProduct.colors[detailColor] || selectedProduct.colors[0]
    addItem(selectedProduct, detailSize, chosenColor, 1)
    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
      toggleCart(true)
    }, 500)
  }

  if (!selectedProduct) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Producto no encontrado</h2>
        <button
          className={styles.backToCatalogBtn}
          style={{ margin: '20px auto', display: 'inline-flex' }}
          onClick={() => navigate('/')}
        >
          ← Volver al Catálogo
        </button>
      </div>
    )
  }

  return (
    <div className={styles.productDetailPage}>
      <button
        className={styles.backToCatalogBtn}
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <div className={styles.productDetailViewGrid}>
        <div className={styles.productViewGallery}>
          <div className={styles.productViewMainImageWrapper}>
            <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.productViewMainImg} />
          </div>
        </div>

        <div className={styles.productViewInfo}>
          <span className={styles.productViewCategoryBadge}>
            {selectedProduct.category} • {selectedProduct.brand}
          </span>
          <h1 className={styles.productViewTitle}>{selectedProduct.name}</h1>
          <div className={styles.productViewPriceRow}>
            <span className={styles.productViewPrice}>${selectedProduct.price.toFixed(2)} USD</span>
          </div>
          <p className={styles.detailDesc}>{selectedProduct.description}</p>

          <div className={styles.selectorSection}>
            <span className={styles.selectorTitle}>Seleccionar Talla (EU)</span>
            <div className={styles.sizesRow}>
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeBtn} ${detailSize === size ? styles.activeSize : ''}`}
                  onClick={() => setDetailSize(size)}
                >
                  EU {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.selectorSection}>
            <span className={styles.selectorTitle}>Seleccionar Color</span>
            <div className={styles.colorsRow}>
              {selectedProduct.colors.map((color, index) => (
                <button
                  key={color.name}
                  className={`${styles.colorBtn} ${detailColor === index ? styles.activeColor : ''}`}
                  style={{ '--color-hex': color.hex }}
                  onClick={() => setDetailColor(index)}
                  title={color.name}
                >
                  <span className={styles.colorCircle} />
                </button>
              ))}
            </div>
          </div>

          <button
            className={`${styles.addToCartBtn} ${isAddedToCart ? styles.added : ''}`}
            onClick={handleAddToCart}
            disabled={isAddedToCart}
          >
            {isAddedToCart ? '¡AGREGADO A LA BOLSA!' : 'AÑADIR A LA BOLSA'}
          </button>
        </div>
      </div>
    </div>
  )
}
