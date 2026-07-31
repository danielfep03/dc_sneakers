import { useState, useMemo } from 'react'
import styles from './Home.module.css'

// High-quality sneaker database
const SNEAKERS_DATA = [
  {
    id: 1,
    name: 'Air Max 270 Premium',
    brand: 'Nike',
    price: 149.99,
    category: 'RUNNING',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: 'Con la primera unidad Max Air diseñada específicamente para Nike Sportswear, las Nike Air Max 270 ofrecen un aire visible que amortigua cada paso. Actualizadas para una comodidad moderna, rinden homenaje a las originales de 1991.',
    sizes: [38, 39, 40, 41, 42, 43],
    colors: [
      { name: 'Rojo Fuego', hex: '#ff3b30' },
      { name: 'Negro Mate', hex: '#1c1c1e' },
      { name: 'Azul Eléctrico', hex: '#007aff' }
    ]
  },
  {
    id: 2,
    name: 'Air Force 1 Pastel Bloom',
    brand: 'Nike',
    price: 119.99,
    category: 'CASUAL',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    description: 'El fulgor sigue vivo en las Nike Air Force 1, un clásico del baloncesto que aporta un toque fresco a sus detalles más conocidos: revestimientos con costuras resistentes, acabados limpios y la cantidad perfecta de brillo.',
    sizes: [36, 37, 38, 39, 40, 41],
    colors: [
      { name: 'Lavanda', hex: '#d9b8f1' },
      { name: 'Blanco Puro', hex: '#ffffff' },
      { name: 'Rosa Pastel', hex: '#ffb3ba' }
    ]
  },
  {
    id: 3,
    name: 'Ultraboost 22 Infinite',
    brand: 'Adidas',
    price: 189.99,
    category: 'RUNNING',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    description: 'Diseñadas pensando en la anatomía femenina y la comodidad extrema, las Ultraboost 22 ofrecen un retorno de energía increíble gracias a la tecnología Boost, junto con un ajuste de tipo calcetín Primeknit.',
    sizes: [38, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Gris Oscuro', hex: '#3a3a3c' },
      { name: 'Blanco Off', hex: '#f2f2f7' },
      { name: 'Azul Deportivo', hex: '#0052cc' }
    ]
  },
  {
    id: 4,
    name: 'Retro Jordan 1 High',
    brand: 'Jordan',
    price: 179.99,
    category: 'JORDAN',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80',
    description: 'Familiar pero siempre fresca, la icónica silueta Air Jordan 1 se actualiza con materiales premium, amortiguación Air encapsulada y los bloques de color clásicos que definieron el inicio de una leyenda.',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Negro y Rojo', hex: '#ff3b30' },
      { name: 'Blanco Clásico', hex: '#ffffff' },
      { name: 'Gris Carbón', hex: '#2c2c2e' }
    ]
  },
  {
    id: 5,
    name: 'Future Rider Neo',
    brand: 'Puma',
    price: 89.99,
    category: 'CASUAL',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
    description: 'Nacidas en 1980 cuando el running saltó a las calles, las Future Rider se renuevan con una suela Federbein que absorbe los impactos y una combinación de materiales ligeros con un estilo retro sumamente colorido.',
    sizes: [37, 38, 39, 40, 41, 42],
    colors: [
      { name: 'Verde Neón', hex: '#34c759' },
      { name: 'Amarillo Pop', hex: '#ffcc00' },
      { name: 'Negro', hex: '#1c1c1e' }
    ]
  },
  {
    id: 6,
    name: 'Court Star Classic',
    brand: 'Puma',
    price: 99.99,
    category: 'CASUAL',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
    description: 'Un homenaje al calzado de tenis de los años 80. Confeccionadas con cuero premium ultra suave y detalles perforados para máxima transpirabilidad, ideales para tu rotación diaria.',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Blanco', hex: '#ffffff' },
      { name: 'Marrón Cuero', hex: '#a2845e' }
    ]
  }
]

const CATEGORIES = ['ALL', 'RUNNING', 'BASKETBALL', 'JORDAN', 'CASUAL']

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [favorites, setFavorites] = useState(new Set([1, 4])) // Default favorites
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [notificationsActive, setNotificationsActive] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Cart state
  const [cart, setCart] = useState([
    {
      product: SNEAKERS_DATA[0],
      size: 40,
      color: SNEAKERS_DATA[0].colors[0],
      quantity: 1
    }
  ])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Detail modal states
  const [detailSize, setDetailSize] = useState(null)
  const [detailColor, setDetailColor] = useState(0)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  // Filter products
  const filteredProducts = useMemo(() => {
    return SNEAKERS_DATA.filter((product) => {
      const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const toggleFavorite = (id, e) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setDetailSize(product.sizes[2]) // default size selection
    setDetailColor(0)
    setIsAddedToCart(false)
  }

  const handleAddToCart = () => {
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id &&
              item.size === detailSize &&
              item.color.name === selectedProduct.colors[detailColor].name
    )

    if (existingIndex > -1) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    } else {
      setCart([
        ...cart,
        {
          product: selectedProduct,
          size: detailSize,
          color: selectedProduct.colors[detailColor],
          quantity: 1
        }
      ])
    }

    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
      setSelectedProduct(null)
      setIsCartOpen(true) // Open cart sidebar to show the added item
    }, 1000)
  }

  const updateCartQuantity = (index, delta) => {
    const newCart = [...cart]
    newCart[index].quantity += delta
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1)
    }
    setCart(newCart)
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  }, [cart])

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  }, [cart])

  return (
    <div className={styles.ecommerceWrapper}>
      {/* Top Banner Ticker */}
      <div className={styles.topTicker}>
        <span>ENVIOS GRATIS EN COMPRAS MAYORES A $150 | DEVOLUCIONES HASTA 30 DIAS</span>
      </div>

      {/* Main Premium Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="#" className={styles.logo}>
            SNEAKERS<span className={styles.logoDot}>.</span>
          </a>
          <nav className={styles.navLinks}>
            <a href="#" className={`${styles.navLink} ${styles.activeLink}`}>Inicio</a>
            <a href="#" className={styles.navLink}>Colecciones</a>
            <a href="#" className={styles.navLink}>Hombre</a>
            <a href="#" className={styles.navLink}>Mujer</a>
            <a href="#" className={styles.navLink}>Ofertas</a>
          </nav>
        </div>

        <div className={styles.navCenter}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar modelos, marcas, colecciones..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.navRight}>
          {/* User info showing profile back */}
          <div className={styles.userInfo}>
            <div className={styles.avatarWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                alt="Tariqul Islam Avatar" 
                className={styles.avatar} 
              />
              <span className={styles.verifiedDot}></span>
            </div>
            <div className={styles.userText}>
              <span className={styles.welcomeText}>Hola de nuevo</span>
              <h4 className={styles.userName}>T. ISLAM</h4>
            </div>
          </div>

          {/* Notifications */}
          <button 
            className={styles.navActionBtn}
            onClick={() => setNotificationsActive(!notificationsActive)}
            title="Notificaciones"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationsActive && <span className={styles.notificationBadge}></span>}
          </button>

          {/* Shopping Cart Button */}
          <button 
            className={styles.navActionBtn}
            onClick={() => setIsCartOpen(true)}
            title="Carrito de compras"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Main E-commerce Layout Content */}
      <main className={styles.mainContainer}>
        
        {/* Full-width interactive Hero Banner */}
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>SNEAKERS SPECIAL SALE</span>
            <h1 className={styles.heroTitle}>
              CONSIGUE HASTA EL <br />
              <span className={styles.heroHighlight}>30% DE DESCUENTO</span>
            </h1>
            <p className={styles.heroDesc}>
              Descubre las siluetas más icónicas y exclusivas de la temporada. Comodidad urbana combinada con diseños premium listos para marcar tu estilo.
            </p>
            <button 
              className={styles.heroCTA}
              onClick={() => setShowPromoModal(true)}
            >
              ACTIVAR CUPÓN
            </button>
          </div>

          <div className={styles.heroImageSection}>
            <div className={styles.heroGlow}></div>
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80" 
              alt="Model Shoe Promo" 
              className={styles.heroShoe} 
            />
            <div className={styles.badgeSale}>30% OFF</div>
          </div>
        </section>

        {/* Categories Bar & Grid Header */}
        <div className={styles.catalogControls}>
          <div className={styles.categoriesBar}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'ALL' ? 'TODOS' : cat}
              </button>
            ))}
          </div>

          <div className={styles.gridInfo}>
            <h3 className={styles.sectionHeading}>PRODUCTOS POPULARES</h3>
            <span className={styles.productCount}>
              Mostrando {filteredProducts.length} productos
            </span>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {filteredProducts.length > 0 ? (
          <section className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={styles.productCard}
                onClick={() => handleProductClick(product)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardBrand}>{product.brand}</span>
                  <button 
                    className={`${styles.favoriteBtn} ${favorites.has(product.id) ? styles.isFavorite : ''}`}
                    onClick={(e) => toggleFavorite(product.id, e)}
                    aria-label="Agregar a favoritos"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={favorites.has(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                <div className={styles.cardImageWrapper}>
                  <div className={styles.cardGlow}></div>
                  <img src={product.image} alt={product.name} className={styles.cardImg} />
                </div>

                <div className={styles.cardInfo}>
                  <h4 className={styles.cardName}>{product.name}</h4>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>${product.price.toFixed(2)}</span>
                    <div className={styles.ratingBadge}>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className={styles.starIcon}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.quickAddOverlay}>
                  <span>VER DETALLES</span>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className={styles.noResults}>
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>No se encontraron tenis</h3>
            <p>Intenta ajustar tu búsqueda o busca otra categoría.</p>
            <button className={styles.resetBtn} onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>
              Ver todos los tenis
            </button>
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <h2>SNEAKERS.</h2>
            <p>La tienda definitiva para apasionados del estilo urbano y la cultura de los tenis.</p>
          </div>
          <div className={styles.footerLinksGroup}>
            <div className={styles.footerLinksCol}>
              <h4>Soporte</h4>
              <a href="#">Ayuda y Contacto</a>
              <a href="#">Envíos y Entregas</a>
              <a href="#">Devoluciones</a>
              <a href="#">Garantía</a>
            </div>
            <div className={styles.footerLinksCol}>
              <h4>Tienda</h4>
              <a href="#">Nuevos Lanzamientos</a>
              <a href="#">Colecciones Especiales</a>
              <a href="#">Outlets y Descuentos</a>
              <a href="#">Tarjetas de Regalo</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 SNEAKERS Premium Store. Todos los derechos reservados.</span>
          <span>Desarrollado con pasión para los amantes de la moda.</span>
        </div>
      </footer>

      {/* Coupon Modal (Popup) */}
      {showPromoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPromoModal(false)}>
          <div className={styles.promoModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowPromoModal(false)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className={styles.promoBadge}>% DESCUENTO</div>
            <h3>¡Desbloqueaste tu Cupón!</h3>
            <p>Aplica este código promocional al final de tu compra para recibir un 30% de rebaja en tenis seleccionados.</p>
            <div className={styles.couponBox}>
              <span className={styles.couponCode}>SNEAKER30</span>
              <button 
                className={styles.copyCouponBtn} 
                onClick={(e) => {
                  navigator.clipboard.writeText('SNEAKER30');
                  const target = e.currentTarget;
                  target.innerText = 'COPIADO!';
                  target.classList.add(styles.copied);
                  setTimeout(() => {
                    target.innerText = 'COPIAR';
                    target.classList.remove(styles.copied);
                  }, 1500);
                }}
              >
                COPIAR
              </button>
            </div>
            <button className={styles.promoActionBtn} onClick={() => setShowPromoModal(false)}>
              Seguir explorando
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Sidebar Shopping Cart */}
      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
          <div className={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <h3>Tu Carrito ({cartCount})</h3>
              <button className={styles.closeCartBtn} onClick={() => setIsCartOpen(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.cartItemsWrapper}>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${item.color.name}`} className={styles.cartItem}>
                    <img src={item.product.image} alt={item.product.name} className={styles.cartItemImg} />
                    
                    <div className={styles.cartItemDetails}>
                      <h4>{item.product.name}</h4>
                      <span className={styles.cartItemMeta}>
                        Talla: {item.size} | Color: {item.color.name}
                      </span>
                      <div className={styles.cartItemPriceRow}>
                        <span className={styles.cartItemPrice}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <div className={styles.quantityControls}>
                          <button onClick={() => updateCartQuantity(index, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(index, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyCart}>
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p>Aún no has agregado tenis a tu bolsa.</p>
                  <button className={styles.startShoppingBtn} onClick={() => setIsCartOpen(false)}>
                    Empezar a comprar
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className={styles.cartFooter}>
                <div className={styles.subtotalRow}>
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.shippingRow}>
                  <span>Envío</span>
                  <span className={styles.freeLabel}>Gratis</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  className={styles.checkoutBtn}
                  onClick={() => {
                    alert('¡Gracias por tu compra! Procesando pedido simulado...');
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                >
                  PROCEDER AL PAGO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal (Quick View) */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedProduct(null)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.detailGrid}>
              <div className={styles.detailLeft}>
                <div className={styles.glowBg}></div>
                <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.detailImg} />
              </div>

              <div className={styles.detailRight}>
                <div className={styles.detailBrandRow}>
                  <span className={styles.detailBrand}>{selectedProduct.brand}</span>
                  <div className={styles.detailRating}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className={styles.starIcon}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{selectedProduct.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h2 className={styles.detailName}>{selectedProduct.name}</h2>
                <span className={styles.detailPrice}>${selectedProduct.price.toFixed(2)}</span>
                
                <p className={styles.detailDesc}>{selectedProduct.description}</p>

                {/* Size Selector */}
                <div className={styles.selectorSection}>
                  <span className={styles.selectorTitle}>Seleccionar Talla (US)</span>
                  <div className={styles.sizesRow}>
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        className={`${styles.sizeBtn} ${detailSize === size ? styles.activeSize : ''}`}
                        onClick={() => setDetailSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
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
                        <span className={styles.colorCircle}></span>
                      </button>
                    ))}
                    <span className={styles.colorTextLabel}>
                      {selectedProduct.colors[detailColor]?.name}
                    </span>
                  </div>
                </div>

                {/* Add To Cart Trigger */}
                <button 
                  className={`${styles.addToCartBtn} ${isAddedToCart ? styles.added : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAddedToCart}
                >
                  {isAddedToCart ? (
                    <>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>¡AGREGADO!</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>AÑADIR A LA BOLSA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home