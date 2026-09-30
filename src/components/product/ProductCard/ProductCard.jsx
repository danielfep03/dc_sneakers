/**
 * ProductCard.jsx
 * Componente compartido de producto utilizado en Home, Catálogo y Favoritos.
 * Reglas del plan (Sección 8.4):
 * - Recibe únicamente la prop 'product'.
 * - Zoom suave en hover (solo con soporte de ratón/hover).
 * - Componente Price integrado (original tachado + oferta en COP).
 * - Etiquetas "Nuevo", "-XX%".
 * - Botón de favorito corazón que interactúa directamente con 'useFavoritesStore'.
 * - Botón '+' lima para agregar rápido o ver detalle.
 */

import { Link } from 'react-router-dom'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import Price from '@/components/ui/Price'
import Badge from '@/components/ui/Badge'
import { calcDiscount } from '@/utils/calcDiscount'
import styles from './ProductCard.module.css'

export default function ProductCard ({ product }) {
  const isFav = useFavoritesStore((state) => state.isFavorite(product.id))
  const toggleFav = useFavoritesStore((state) => state.toggleFavorite)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)

  if (!product) return null

  const discountPercent = calcDiscount(product.price, product.salePrice)
  const primaryImage =
    product.images?.[0] || product.image || 'https://placehold.co/600x600/141416/c6ff00?text=Sneaker'

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFav(product.id)
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Buscar la primera talla con stock disponible
    const availableSize =
      product.sizes?.find((s) => s.stock > 0)?.size || product.sizes?.[0]?.size || 40

    addItem(product, availableSize, 1)
    openCart()
  }

  return (
    <Link to={`/producto/${product.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={primaryImage}
          alt={product.name}
          className={styles.productImage}
          loading='lazy'
        />

        {/* Badges superiores */}
        <div className={styles.badgeArea}>
          {discountPercent > 0 && (
            <Badge variant='sale'>-{discountPercent}% OFF</Badge>
          )}
          {product.isNew && <Badge variant='new'>NUEVO</Badge>}
        </div>

        {/* Botón Favorito (Corazón) */}
        <button
          type='button'
          className={`${styles.favoriteBtn} ${isFav ? styles.isFavorite : ''}`}
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill={isFav ? 'currentColor' : 'none'}
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
          </svg>
        </button>

        {/* Botón de compra rápida '+' lima */}
        <button
          type='button'
          className={styles.addBtn}
          onClick={handleQuickAdd}
          aria-label={`Añadir ${product.name} al carrito`}
          title='Añadir al carrito'
        >
          +
        </button>
      </div>

      <div className={styles.footer}>
        <span className={styles.brand}>{product.brandId || product.brand}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <Price price={product.price} salePrice={product.salePrice} size='sm' />
      </div>
    </Link>
  )
}
