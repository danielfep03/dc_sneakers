import { useMemo, useState } from 'react'
import brandLogo from '../../../../../../.gemini/antigravity/brain/9cf0a029-5ac1-4f5f-9ad6-74053783364a/.user_uploaded/media_1790036437257.png'
import styles from './Home.module.css'

// High-quality sneaker database
const SNEAKERS_DATA = [
  {
    id: 1,
    name: 'LeBron XXI Basketball Pro',
    brand: 'Nike',
    price: 189.99,
    category: 'BASKETBALL',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    description: 'Diseñadas para máximo rendimiento en la cancha de baloncesto. Sistema de amortiguación Zoom Air con respuesta explosiva y soporte lateral de alta tracción para cambios de ritmo.',
    sizes: [38, 39, 40, 41, 42, 43, 44],
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
    description: 'El fulgor sigue vivo en las Nike Air Force 1, un clásico que aporta un toque fresco a sus detalles más conocidos: revestimientos con costuras resistentes y acabados limpios.',
    sizes: [36, 37, 38, 39, 40, 41],
    colors: [
      { name: 'Lavanda', hex: '#d9b8f1' },
      { name: 'Blanco Puro', hex: '#ffffff' },
      { name: 'Rosa Pastel', hex: '#ffb3ba' }
    ]
  },
  {
    id: 3,
    name: 'Metarise Voleibol Elite',
    brand: 'Asics',
    price: 179.99,
    category: 'VOLEIBOL',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
    description: 'Silueta especializada para voleibol de alto nivel. Tecnología RISETRUSS para potencia de salto vertical superior y amortiguación FlyteFoam para aterrizajes suaves.',
    sizes: [38, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Gris Oscuro', hex: '#3a3a3c' },
      { name: 'Blanco Off', hex: '#f2f2f7' },
      { name: 'Azul Deportivo', hex: '#0052cc' }
    ]
  },
  {
    id: 4,
    name: 'Retro Jordan 1 High Chicago',
    brand: 'Jordan',
    price: 199.99,
    category: 'BASKETBALL',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80',
    description: 'La silueta legendaria Air Jordan 1 en su combinación clásica de baloncesto. Materiales de cuero premium, amortiguación Air encapsulada y estilo místico dentro y fuera de la cancha.',
    sizes: [40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Negro y Rojo', hex: '#ff3b30' },
      { name: 'Blanco Clásico', hex: '#ffffff' },
      { name: 'Gris Carbón', hex: '#2c2c2e' }
    ]
  },
  {
    id: 5,
    name: 'Future Rider Streetwear',
    brand: 'Puma',
    price: 89.99,
    category: 'CASUAL',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
    description: 'Estilo urbano retro con suela Federbein que absorbe impactos. Combinación de materiales ligeros con colores llamativos para tu outfit diario.',
    sizes: [37, 38, 39, 40, 41, 42],
    colors: [
      { name: 'Verde Neón', hex: '#34c759' },
      { name: 'Amarillo Pop', hex: '#ffcc00' },
      { name: 'Negro', hex: '#1c1c1e' }
    ]
  },
  {
    id: 6,
    name: 'Wave Lightning Z7 Voleibol',
    brand: 'Mizuno',
    price: 159.99,
    category: 'VOLEIBOL',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
    description: 'Diseñadas para velocidad y agilidad extrema en cancha cubierta de voleibol. Estructura ligera con tecnología Mizuno Wave para estabilidad en desplazamientos laterales.',
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Blanco', hex: '#ffffff' },
      { name: 'Azul Marino', hex: '#1e3a8a' }
    ]
  }
]

const CATEGORIES = ['ALL', 'BASKETBALL', 'VOLEIBOL', 'CASUAL']

function Home () {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [favorites, setFavorites] = useState(new Set([1, 4]))
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [notificationsActive, setNotificationsActive] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedAccount, setCopiedAccount] = useState('')

  const [ordersList, setOrdersList] = useState([
    {
      id: 'DC-98214',
      date: '18 Sep 2026',
      status: 'En Camino 🚚',
      statusBg: '#e0f2fe',
      statusColor: '#0284c7',
      customerName: 'Tariqul Islam',
      city: 'Medellín, Antioquia',
      items: [
        { name: 'Retro Jordan 1 High Chicago', size: '42', quantity: 1, price: 199.99, image: SNEAKERS_DATA[3].image }
      ],
      total: 199.99,
      paymentMethod: 'Pago Contraentrega'
    }
  ])

  const [cart, setCart] = useState([
    {
      product: SNEAKERS_DATA[0],
      size: 40,
      color: SNEAKERS_DATA[0].colors[0],
      quantity: 1
    }
  ])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [detailSize, setDetailSize] = useState(null)
  const [detailColor, setDetailColor] = useState(0)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    whatsapp: '3008625143',
    department: 'Antioquia',
    city: 'Medellín',
    address: '',
    neighborhood: '',
    notes: ''
  })
  const [completedOrder, setCompletedOrder] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCheckoutForm(prev => ({ ...prev, [name]: value }))
  }

  const handleOpenCheckout = () => {
    setIsCartOpen(false)
    setCheckoutStep(1)
    setIsCheckoutOpen(true)
  }

  const handleCopyAccount = (number, bankName) => {
    navigator.clipboard.writeText(number)
    setCopiedAccount(bankName)
    setTimeout(() => setCopiedAccount(''), 2000)
  }

  const handleConfirmOrder = (e) => {
    e.preventDefault()
    if (!checkoutForm.fullName.trim() || !checkoutForm.whatsapp.trim() || !checkoutForm.address.trim() || !checkoutForm.city.trim()) {
      alert('Por favor completa los campos obligatorios del Paso 1: Nombre completo, WhatsApp, Ciudad y Dirección de entrega.')
      setCheckoutStep(1)
      return
    }

    const orderId = `DC-${Math.floor(10000 + Math.random() * 90000)}`

    let methodTitle = 'Pago Contraentrega (En Puerta)'
    if (paymentMethod === 'NEQUI') methodTitle = 'Transferencia Nequi Directa'
    if (paymentMethod === 'BANCOLOMBIA') methodTitle = 'Transferencia Bancolombia Directa'

    let waMessage = '*NUEVO PEDIDO DC SNEAKERS*%0A%0A'
    waMessage += `*Nº de Pedido:* ${orderId}%0A`
    waMessage += `💳 *Método de Pago:* ${methodTitle}%0A`
    waMessage += '-----------------------------------%0A'
    waMessage += `👤 *Cliente:* ${checkoutForm.fullName}%0A`
    waMessage += `📱 *WhatsApp:* +57 ${checkoutForm.whatsapp}%0A`
    waMessage += `📍 *Ciudad/Dpto:* ${checkoutForm.city}, ${checkoutForm.department}%0A`
    waMessage += `🏠 *Dirección:* ${checkoutForm.address}${checkoutForm.neighborhood ? ` (${checkoutForm.neighborhood})` : ''}%0A`
    if (checkoutForm.notes) waMessage += `📝 *Notas:* ${checkoutForm.notes}%0A`
    waMessage += '-----------------------------------%0A'
    waMessage += '👟 *PRODUCTOS SOLICITADOS:*%0A'
    cart.forEach(item => {
      waMessage += `• ${item.product.name} (Talla EU: ${item.size}, Color: ${item.color.name}) x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)} USD%0A`
    })
    waMessage += '-----------------------------------%0A'
    waMessage += '💰 *DESGLOSE TRANSPARENTE:*%0A'
    waMessage += `• Subtotal: $${cartTotal.toFixed(2)} USD%0A`
    waMessage += '• Envío Nacional: ¡GRATIS! 🇨🇴%0A'
    waMessage += '• Comisión Pasarela: $0.00 (0% Ahorrado)%0A'
    waMessage += `👉 *TOTAL FINAL:* $${cartTotal.toFixed(2)} USD%0A`

    const newOrderObj = {
      id: orderId,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Procesando ⏳',
      statusBg: '#fef3c7',
      statusColor: '#d97706',
      customerName: checkoutForm.fullName,
      city: `${checkoutForm.city}, ${checkoutForm.department}`,
      items: cart.map(i => ({
        name: i.product.name,
        size: `${i.size}`,
        quantity: i.quantity,
        price: i.product.price,
        image: i.product.image
      })),
      total: cartTotal,
      paymentMethod: methodTitle
    }

    setOrdersList(prev => [newOrderObj, ...prev])

    setCompletedOrder({
      id: orderId,
      customer: { ...checkoutForm },
      items: [...cart],
      total: cartTotal,
      methodTitle,
      waLink: `https://wa.me/573008625143?text=${waMessage}`
    })

    setCart([])
    setIsCheckoutOpen(false)
  }

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
    setDetailSize(product.sizes[2])
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
      setIsCartOpen(true)
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
      <div className={styles.topTicker}>
        <span>ENVÍOS GRATIS A TODA COLOMBIA 🇨🇴 | <span className={styles.topTickerHighlight}>DC SNEAKERS</span> | HASTA 30 DÍAS DE GARANTÍA</span>
      </div>

      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href='#' className={styles.logoContainer}>
            <img src={brandLogo} alt='DC SNEAKERS' className={styles.logoImg} />
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTextMain}>DC</span>
              <span className={styles.logoTextSub}>SNEAKERS</span>
            </div>
          </a>
          <nav className={styles.navLinks}>
            <a href='#' className={`${styles.navLink} ${styles.activeLink}`}>Inicio</a>
            <a href='#' className={styles.navLink}>Colecciones</a>
            <a href='#' className={styles.navLink}>Hombre</a>
            <a href='#' className={styles.navLink}>Mujer</a>
            <a href='#' className={styles.navLink}>Ofertas</a>
          </nav>
        </div>

        <div className={styles.navCenter}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              type='text'
              placeholder='Buscar modelos, marcas, colecciones...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                <svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.navRight}>
          <div
            className={styles.userInfo}
            onClick={() => setShowOrdersModal(true)}
            title='Ver Historial de Pedidos'
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.avatarWrapper}>
              <img
                src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                alt='Tariqul Islam Avatar'
                className={styles.avatar}
              />
              <span className={styles.verifiedDot} />
            </div>
            <div className={styles.userText}>
              <span className={styles.welcomeText}>Mis Pedidos ({ordersList.length})</span>
              <h4 className={styles.userName}>T. ISLAM 📋</h4>
            </div>
          </div>

          <button
            className={styles.navActionBtn}
            onClick={() => setNotificationsActive(!notificationsActive)}
            title='Notificaciones'
          >
            <svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
              <path d='M13.73 21a2 2 0 0 1-3.46 0' />
            </svg>
            {notificationsActive && <span className={styles.notificationBadge} />}
          </button>

          <button
            className={styles.navActionBtn}
            onClick={() => setIsCartOpen(true)}
            title='Carrito de compras'
          >
            <svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
              <line x1='3' y1='6' x2='21' y2='6' />
              <path d='M16 10a4 4 0 0 1-8 0' />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className={styles.mainContainer}>
        <section className={styles.heroBanner}>
          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>DC SNEAKERS • SNEAKERS & STREETWEAR</span>
            <h1 className={styles.heroTitle}>
              EL TEMPLO DEL <br />
              <span className={styles.heroHighlight}>SNEAKERHEAD</span>
            </h1>
            <p className={styles.heroDesc}>
              Descubre las siluetas más icónicas y exclusivas de tenis en Colombia. Cultura urbana combinada con diseños legendarios listos para marcar tu estilo.
            </p>
            <button
              className={styles.heroCTA}
              onClick={() => setShowPromoModal(true)}
            >
              ACTIVAR CUPÓN DC SNEAKERS
            </button>
          </div>

          <div className={styles.heroImageSection}>
            <div className={styles.heroGlow} />
            <img
              src='https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80'
              alt='Air Jordan 1 DC SNEAKERS'
              className={styles.heroShoe}
            />
            <div className={styles.badgeSale}>30% OFF</div>
          </div>
        </section>

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

        {filteredProducts.length > 0
          ? (
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
                    aria-label='Agregar a favoritos'
                  >
                    <svg viewBox='0 0 24 24' width='18' height='18' fill={favorites.has(product.id) ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
                    </svg>
                  </button>
                </div>

                <div className={styles.cardImageWrapper}>
                  <div className={styles.cardGlow} />
                  <img src={product.image} alt={product.name} className={styles.cardImg} />
                </div>

                <div className={styles.cardInfo}>
                  <h4 className={styles.cardName}>{product.name}</h4>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>${product.price.toFixed(2)}</span>
                    <div className={styles.ratingBadge}>
                      <svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor' className={styles.starIcon}>
                        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                      </svg>
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.quickAddOverlay}>
                  <span>VER DETALLES Y TALLAS EU</span>
                </div>
              </div>
            ))}
          </section>
            )
          : (
  <div className={styles.noResults}>
            <svg viewBox='0 0 24 24' width='64' height='64' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' />
              <line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <h3>No se encontraron tenis</h3>
            <p>Intenta ajustar tu búsqueda o busca otra categoría.</p>
            <button className={styles.resetBtn} onClick={() => { setSearchQuery(''); setSelectedCategory('ALL') }}>
              Ver todos los tenis
            </button>
          </div>
            )}
      </main>

      <a
        href='https://wa.me/573008625143?text=Hola%20DC%20SNEAKERS!%20Tengo%20una%20consulta%20sobre%20los%20sneakers'
        target='_blank'
        rel='noopener noreferrer'
        className={styles.whatsappFloat}
        title='Atención Inmediata por WhatsApp (+57 300 862 5143)'
      >
        <svg viewBox='0 0 24 24' width='30' height='30' fill='currentColor'>
          <path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z' />
        </svg>
        <span className={styles.whatsappFloatTooltip}>¿Dudas? Habla al 300 862 5143</span>
      </a>

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <div className={styles.logoContainer}>
              <img src={brandLogo} alt='DC SNEAKERS' className={styles.logoImg} />
              <div className={styles.logoTextWrapper}>
                <span className={styles.logoTextMain} style={{ color: '#ffffff' }}>DC</span>
                <span className={styles.logoTextSub}>SNEAKERS</span>
              </div>
            </div>
            <p style={{ marginTop: '12px' }}>La tienda oficial para los verdaderos apasionados del sneaker culture, la cultura basket y el estilo urbano en Colombia.</p>
            <div style={{ marginTop: '14px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>📱 <strong>WhatsApp:</strong> <a href='https://wa.me/573008625143' target='_blank' rel='noreferrer' style={{ color: '#25d366', textDecoration: 'none', fontWeight: '800' }}>300 862 5143</a></div>
              <div>📸 <strong>Instagram:</strong> <a href='https://instagram.com/dc.sneakers_' target='_blank' rel='noreferrer' style={{ color: '#e1306c', textDecoration: 'none', fontWeight: '800' }}>@dc.sneakers_</a></div>
            </div>
          </div>
          <div className={styles.footerLinksGroup}>
            <div className={styles.footerLinksCol}>
              <h4>Soporte</h4>
              <a href='#'>Ayuda y Contacto</a>
              <a href='#'>Envíos a Colombia</a>
              <a href='#'>Devoluciones</a>
              <a href='#'>Garantía DC SNEAKERS</a>
            </div>
            <div className={styles.footerLinksCol}>
              <h4>Tienda</h4>
              <a href='#'>Drop Jordan</a>
              <a href='#'>Colecciones Especiales</a>
              <a href='#'>Outlets y Descuentos</a>
              <a href='#'>Tarjetas de Regalo</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 DC SNEAKERS (@dc.sneakers_). Todos los derechos reservados.</span>
          <span>El templo del sneakerhead & streetwear en Colombia 🇨🇴</span>
        </div>
      </footer>

      {showPromoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPromoModal(false)}>
          <div className={styles.promoModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowPromoModal(false)}>
              <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>
            <div className={styles.promoBadge}>% DESCUENTO</div>
            <h3>¡Desbloqueaste tu Cupón DC SNEAKERS!</h3>
            <p>Aplica este código promocional al final de tu compra para recibir un 30% de rebaja en tenis seleccionados.</p>
            <div className={styles.couponBox}>
              <span className={styles.couponCode}>DC30</span>
              <button
                className={styles.copyCouponBtn}
                onClick={(e) => {
                  navigator.clipboard.writeText('DC30')
                  const target = e.currentTarget
                  target.innerText = 'COPIADO!'
                  target.classList.add(styles.copied)
                  setTimeout(() => {
                    target.innerText = 'COPIAR'
                    target.classList.remove(styles.copied)
                  }, 1500)
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

      {showSizeGuide && (
        <div className={styles.modalOverlay} onClick={() => setShowSizeGuide(false)}>
          <div className={styles.sizeGuideModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderRow}>
              <div>
                <h2>GUÍA DE TALLAS DE ZAPATILLAS</h2>
                <span className={styles.subSubtitle}>Equivalencias Oficiales EU / US / CM</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowSizeGuide(false)}>
                <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>

            <div className={styles.sizeGuideBody}>
              <p>Utiliza esta tabla para encontrar tu talla exacta en formato Europeo (EU). Si estás entre dos tallas, te recomendamos elegir la superior para mayor comodidad.</p>

              <div className={styles.tableWrapper}>
                <table className={styles.sizeTable}>
                  <thead>
                    <tr>
                      <th>Talla EU (Europa)</th>
                      <th>Talla US (Hombre)</th>
                      <th>Talla US (Mujer)</th>
                      <th>Largo del Pie (CM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>EU 36</td><td>US 4.5</td><td>US 6.0</td><td>22.5 cm</td></tr>
                    <tr><td>EU 37</td><td>US 5.0</td><td>US 6.5</td><td>23.0 cm</td></tr>
                    <tr><td>EU 38</td><td>US 6.0</td><td>US 7.5</td><td>24.0 cm</td></tr>
                    <tr className={styles.highlightRow}><td>EU 39</td><td>US 6.5</td><td>US 8.0</td><td>24.5 cm</td></tr>
                    <tr className={styles.highlightRow}><td>EU 40</td><td>US 7.0</td><td>US 8.5</td><td>25.0 cm</td></tr>
                    <tr className={styles.highlightRow}><td>EU 41</td><td>US 8.0</td><td>US 9.5</td><td>26.0 cm</td></tr>
                    <tr className={styles.highlightRow}><td>EU 42</td><td>US 8.5</td><td>US 10.0</td><td>26.5 cm</td></tr>
                    <tr><td>EU 43</td><td>US 9.5</td><td>US 11.0</td><td>27.5 cm</td></tr>
                    <tr><td>EU 44</td><td>US 10.0</td><td>US 11.5</td><td>28.0 cm</td></tr>
                    <tr><td>EU 45</td><td>US 11.0</td><td>US 12.5</td><td>29.0 cm</td></tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.howToMeasureBox}>
                <h4>📏 ¿Cómo medir la longitud de tu pie?</h4>
                <ol>
                  <li>Coloca un papel en el suelo pegado a la pared y pisa sobre él con el talón apoyado contra la pared.</li>
                  <li>Marca la punta del dedo más largo con un lápiz.</li>
                  <li>Mide la distancia desde la pared hasta la marca en centímetros y busca el número exacto en la tabla.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOrdersModal && (
        <div className={styles.modalOverlay} onClick={() => setShowOrdersModal(false)}>
          <div className={styles.ordersModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderRow}>
              <div>
                <h2>MIS ÓRDENES Y SEGUIMIENTO</h2>
                <span className={styles.subSubtitle}>Historial de compras registradas en esta sesión</span>
              </div>
              <button className={styles.modalClose} onClick={() => setShowOrdersModal(false)}>
                <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>

            <div className={styles.ordersListBody}>
              {ordersList.length > 0
                ? (
                    ordersList.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardHeader}>
                      <div>
                        <span className={styles.orderIdText}>{order.id}</span>
                        <span className={styles.orderDateText}> • {order.date}</span>
                      </div>
                      <span
                        className={styles.orderStatusBadge}
                        style={{ backgroundColor: order.statusBg, color: order.statusColor }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className={styles.orderItemsList}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className={styles.orderItemRow}>
                          <img src={item.image} alt={item.name} className={styles.orderItemThumb} />
                          <div className={styles.orderItemInfo}>
                            <h5>{item.name}</h5>
                            <span>Talla EU: {item.size} • Cantidad: {item.quantity}</span>
                          </div>
                          <span className={styles.orderItemPrice}>${(item.price * item.quantity).toFixed(2)} USD</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderCardFooter}>
                      <div>
                        <div className={styles.orderPaymentMeta}>💳 Método: <strong>{order.paymentMethod}</strong></div>
                        <div className={styles.orderShippingMeta}>📍 Destino: <strong>{order.city}</strong></div>
                      </div>
                      <div className={styles.orderTotalWrapper}>
                        <span>Total:</span>
                        <span className={styles.orderTotalAmount}>${order.total.toFixed(2)} USD</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/573008625143?text=Hola%20DC%20SNEAKERS,%20deseo%20consultar%20el%20estado%20de%20mi%20pedido%20${order.id}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={styles.trackOrderBtn}
                    >
                      <svg viewBox='0 0 24 24' width='16' height='16' fill='currentColor'>
                        <path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z' />
                      </svg>
                      Rastrear Pedido en WhatsApp (300 862 5143)
                    </a>
                  </div>
                    ))
                  )
                : (
  <div className={styles.emptyOrders}>
                  <p>No tienes órdenes recientes.</p>
                </div>
                  )}
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
          <div className={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <h3>Tu Carrito ({cartCount})</h3>
              <button className={styles.closeCartBtn} onClick={() => setIsCartOpen(false)}>
                <svg viewBox='0 0 24 24' width='24' height='24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>

            <div className={styles.cartItemsWrapper}>
              {cart.length > 0
                ? (
                    cart.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${item.color.name}`} className={styles.cartItem}>
                    <img src={item.product.image} alt={item.product.name} className={styles.cartItemImg} />

                    <div className={styles.cartItemDetails}>
                      <h4>{item.product.name}</h4>
                      <span className={styles.cartItemMeta}>
                        Talla EU: {item.size} | Color: {item.color.name}
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
                  )
                : (
  <div className={styles.emptyCart}>
                  <svg viewBox='0 0 24 24' width='64' height='64' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='9' cy='21' r='1' />
                    <circle cx='20' cy='21' r='1' />
                    <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' />
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
                  <span>Envío Nacional</span>
                  <span className={styles.freeLabel}>¡GRATIS!</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  className={styles.checkoutBtn}
                  onClick={handleOpenCheckout}
                >
                  PROCEDER AL PAGO (CONTRAENTREGA / NEQUI / BANCOLOMBIA)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedProduct(null)}>
              <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>

            <div className={styles.detailGrid}>
              <div className={styles.detailLeft}>
                <div className={styles.glowBg} />
                <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.detailImg} />
              </div>

              <div className={styles.detailRight}>
                <div className={styles.detailBrandRow}>
                  <span className={styles.detailBrand}>{selectedProduct.brand}</span>
                  <div className={styles.detailRating}>
                    <svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor' className={styles.starIcon}>
                      <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                    </svg>
                    <span>{selectedProduct.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h2 className={styles.detailName}>{selectedProduct.name}</h2>
                <span className={styles.detailPrice}>${selectedProduct.price.toFixed(2)}</span>

                <div className={styles.liveViewersBadge}>
                  <span className={styles.livePulseDot} />
                  <span>🔥 <strong>{((selectedProduct.id * 7) % 15) + 9} personas</strong> están viendo este producto ahora mismo</span>
                </div>

                <p className={styles.detailDesc}>{selectedProduct.description}</p>

                <div className={styles.selectorSection}>
                  <div className={styles.sizeHeaderRow}>
                    <span className={styles.selectorTitle}>Seleccionar Talla (EU)</span>
                    <button
                      className={styles.sizeGuideLinkBtn}
                      onClick={() => setShowSizeGuide(true)}
                    >
                      📏 Guía de Tallas
                    </button>
                  </div>
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
                    <span className={styles.colorTextLabel}>
                      {selectedProduct.colors[detailColor]?.name}
                    </span>
                  </div>
                </div>

                <button
                  className={`${styles.addToCartBtn} ${isAddedToCart ? styles.added : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAddedToCart}
                >
                  {isAddedToCart
                    ? (
  <>
                      <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                      <span>¡AGREGADO A LA BOLSA!</span>
                    </>
                      )
                    : (
  <>
                      <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' />
                        <line x1='3' y1='6' x2='21' y2='6' />
                        <path d='M16 10a4 4 0 0 1-8 0' />
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

      {isCheckoutOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCheckoutOpen(false)}>
          <div className={styles.checkoutModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.checkoutHeader}>
              <div className={styles.checkoutHeaderTitle}>
                <h2>FINALIZAR PEDIDO (CHECKOUT)</h2>
                <span className={styles.codTag}>🇨🇴 ENVIOS A TODA COLOMBIA</span>
              </div>
              <button className={styles.modalClose} onClick={() => setIsCheckoutOpen(false)}>
                <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>

            <div className={styles.stepperWizard}>
              <div className={`${styles.stepTab} ${checkoutStep === 1 ? styles.activeStep : ''} ${checkoutStep > 1 ? styles.completedStep : ''}`} onClick={() => setCheckoutStep(1)}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Datos de Entrega</span>
              </div>
              <div className={styles.stepDivider} />
              <div className={`${styles.stepTab} ${checkoutStep === 2 ? styles.activeStep : ''} ${checkoutStep > 2 ? styles.completedStep : ''}`} onClick={() => checkoutStep > 1 && setCheckoutStep(2)}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Método de Pago</span>
              </div>
              <div className={styles.stepDivider} />
              <div className={`${styles.stepTab} ${checkoutStep === 3 ? styles.activeStep : ''}`} onClick={() => checkoutStep === 3 && setCheckoutStep(3)}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepLabel}>Resumen & Confirmar</span>
              </div>
            </div>

            <div className={styles.checkoutBody}>
              {checkoutStep === 1 && (
                <div className={styles.stepContainer}>
                  <h3 className={styles.checkoutSectionTitle}>
                    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                      <circle cx='12' cy='7' r='4' />
                    </svg>
                    PASO 1: DATOS DE ENVÍO Y CONTACTO
                  </h3>

                  <div className={styles.formGroup}>
                    <label>Nombre Completo *</label>
                    <input
                      type='text'
                      name='fullName'
                      placeholder='Ej: Mateo Gutiérrez'
                      value={checkoutForm.fullName}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Número de WhatsApp (Notificaciones de Envío) *</label>
                    <div className={styles.phoneInputGroup}>
                      <span className={styles.phonePrefix}>🇨🇴 +57</span>
                      <input
                        type='tel'
                        name='whatsapp'
                        placeholder='Ej: 300 862 5143'
                        value={checkoutForm.whatsapp}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Departamento *</label>
                      <input
                        type='text'
                        name='department'
                        placeholder='Ej: Antioquia'
                        value={checkoutForm.department}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ciudad / Municipio *</label>
                      <input
                        type='text'
                        name='city'
                        placeholder='Ej: Medellín'
                        value={checkoutForm.city}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dirección Exacta de Entrega *</label>
                    <input
                      type='text'
                      name='address'
                      placeholder='Ej: Calle 10 # 43 - 20, Apto 502'
                      value={checkoutForm.address}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Barrio / Edificio / Instrucciones adicionales (Opcional)</label>
                    <input
                      type='text'
                      name='neighborhood'
                      placeholder='Ej: El Poblado - Dejar en portería'
                      value={checkoutForm.neighborhood}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>

                  <button
                    type='button'
                    className={styles.nextStepBtn}
                    onClick={() => {
                      if (!checkoutForm.fullName.trim() || !checkoutForm.whatsapp.trim() || !checkoutForm.address.trim() || !checkoutForm.city.trim()) {
                        alert('Completa los campos obligatorios antes de continuar.')
                        return
                      }
                      setCheckoutStep(2)
                    }}
                  >
                    CONTINUAR A MÉTODO DE PAGO →
                  </button>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className={styles.stepContainer}>
                  <h3 className={styles.checkoutSectionTitle}>
                    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <rect x='1' y='4' width='22' height='16' rx='2' ry='2' />
                      <line x1='1' y1='10' x2='23' y2='10' />
                    </svg>
                    PASO 2: SELECCIONA TU MÉTODO DE PAGO
                  </h3>

                  <div className={styles.paymentMethodsGrid}>
                    <div
                      className={`${styles.paymentOptionCard} ${paymentMethod === 'COD' ? styles.selectedOption : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <div className={styles.optionHeader}>
                        <div className={styles.optionRadio} />
                        <h4>🚚 Pago Contraentrega (En tu Puerta)</h4>
                      </div>
                      <p>Pagas en efectivo, Nequi o Daviplata cuando recibas el paquete con el mensajero en tu ciudad.</p>
                    </div>

                    <div
                      className={`${styles.paymentOptionCard} ${paymentMethod === 'NEQUI' ? styles.selectedOption : ''}`}
                      onClick={() => setPaymentMethod('NEQUI')}
                    >
                      <div className={styles.optionHeader}>
                        <div className={styles.optionRadio} />
                        <h4>📱 Transferencia Directa Nequi</h4>
                        <span className={styles.zeroFeeBadge}>0% Comisión</span>
                      </div>
                      <p>Transfiere rápido sin comisiones bancarias de pasarela. Copia nuestro número oficial DC SNEAKERS:</p>

                      {paymentMethod === 'NEQUI' && (
                        <div className={styles.bankAccountBox}>
                          <div className={styles.accountInfo}>
                            <span>Número Nequi Oficial:</span>
                            <strong>300 862 5143</strong>
                          </div>
                          <button
                            type='button'
                            className={styles.copyAccBtn}
                            onClick={() => handleCopyAccount('3008625143', 'Nequi')}
                          >
                            {copiedAccount === 'Nequi' ? '¡COPIADO!' : 'COPIAR NÚMERO'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className={`${styles.paymentOptionCard} ${paymentMethod === 'BANCOLOMBIA' ? styles.selectedOption : ''}`}
                      onClick={() => setPaymentMethod('BANCOLOMBIA')}
                    >
                      <div className={styles.optionHeader}>
                        <div className={styles.optionRadio} />
                        <h4>🏦 Transferencia Bancolombia (Ahorros)</h4>
                        <span className={styles.zeroFeeBadge}>0% Comisión</span>
                      </div>
                      <p>Transferencia directa a cuenta de ahorros oficial DC SNEAKERS:</p>

                      {paymentMethod === 'BANCOLOMBIA' && (
                        <div className={styles.bankAccountBox}>
                          <div className={styles.accountInfo}>
                            <span>Cta. Ahorros Bancolombia:</span>
                            <strong>912 345 678 99</strong>
                          </div>
                          <button
                            type='button'
                            className={styles.copyAccBtn}
                            onClick={() => handleCopyAccount('91234567899', 'Bancolombia')}
                          >
                            {copiedAccount === 'Bancolombia' ? '¡COPIADO!' : 'COPIAR CUENTA'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.stepButtonsRow}>
                    <button type='button' className={styles.backStepBtn} onClick={() => setCheckoutStep(1)}>
                      ← Volver a Datos
                    </button>
                    <button type='button' className={styles.nextStepBtn} onClick={() => setCheckoutStep(3)}>
                      CONTINUAR A CONFIRMACIÓN →
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === 3 && (
                <form className={styles.stepContainer} onSubmit={handleConfirmOrder}>
                  <h3 className={styles.checkoutSectionTitle}>
                    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                      <polyline points='22 4 12 14.01 9 11.01' />
                    </svg>
                    PASO 3: CONFIRMACIÓN Y DESGLOSE DE PAGO TRANSPARENTE
                  </h3>

                  <div className={styles.reviewGrid}>
                    <div className={styles.reviewBox}>
                      <h4>📍 Datos de Entrega</h4>
                      <p><strong>Cliente:</strong> {checkoutForm.fullName}</p>
                      <p><strong>WhatsApp:</strong> +57 {checkoutForm.whatsapp}</p>
                      <p><strong>Dirección:</strong> {checkoutForm.address}, {checkoutForm.city} ({checkoutForm.department})</p>
                    </div>

                    <div className={styles.reviewBox}>
                      <h4>💳 Método de Pago Elegido</h4>
                      <p>
                        {paymentMethod === 'COD' && '🚚 Pago Contraentrega en Puerta'}
                        {paymentMethod === 'NEQUI' && '📱 Transferencia Directa Nequi (300 862 5143)'}
                        {paymentMethod === 'BANCOLOMBIA' && '🏦 Transferencia Bancolombia (912 345 678 99)'}
                      </p>
                    </div>
                  </div>

                  <div className={styles.transparentBreakdown}>
                    <h4>💰 Desglose Transparente de Tu Compra</h4>

                    <div className={styles.breakdownRow}>
                      <span>Subtotal de Zapatillas</span>
                      <span>${cartTotal.toFixed(2)} USD</span>
                    </div>

                    <div className={styles.breakdownRow}>
                      <span>Envío Nacional Asegurado</span>
                      <span className={styles.freeGreenText}>¡GRATIS ($0 COP)! 🇨🇴</span>
                    </div>

                    <div className={styles.breakdownRow}>
                      <span>Comisión de Pasarela de Pago</span>
                      <span className={styles.savedFeeText}>$0.00 (0% ¡Te ahorras cargos ocultos!)</span>
                    </div>

                    <div className={styles.breakdownDivider} />

                    <div className={styles.breakdownTotalRow}>
                      <span>TOTAL NETO A PAGAR</span>
                      <span>${cartTotal.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className={styles.stepButtonsRow}>
                    <button type='button' className={styles.backStepBtn} onClick={() => setCheckoutStep(2)}>
                      ← Cambiar Método
                    </button>
                    <button type='submit' className={styles.submitOrderBtn}>
                      <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                        <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
                        <polyline points='22 4 12 14.01 9 11.01' />
                      </svg>
                      CONFIRMAR PEDIDO Y ENVIAR A WHATSAPP
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {completedOrder && (
        <div className={styles.modalOverlay} onClick={() => setCompletedOrder(null)}>
          <div className={styles.checkoutModal} style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successModalContent}>
              <div className={styles.successCheckBadge}>
                <svg viewBox='0 0 24 24' width='40' height='40' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              </div>

              <span className={styles.orderIdTag}>PEDIDO Nº {completedOrder.id}</span>
              <h2 style={{ margin: '4px 0', fontSize: '24px', fontWeight: '900', color: '#0f0f11' }}>¡PEDIDO REGISTRADO EN DC SNEAKERS!</h2>

              <p style={{ color: '#555', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                Tu orden con <strong>{completedOrder.methodTitle}</strong> para <strong>{completedOrder.customer.fullName}</strong> en <strong>{completedOrder.customer.city}</strong> ha sido creada.
              </p>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', textAlign: 'left', fontSize: '13px' }}>
                <div style={{ fontWeight: '800', marginBottom: '6px', color: '#0f0f11' }}>📱 Pasos Finales en WhatsApp:</div>
                <div style={{ color: '#475569' }}>Haz clic en el botón de abajo para enviar los detalles de tu orden directamente a nuestro número oficial de WhatsApp <strong>+57 300 862 5143</strong>.</div>
              </div>

              <a
                href={completedOrder.waLink}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.whatsappActionBtn}
              >
                <svg viewBox='0 0 24 24' width='24' height='24' fill='currentColor'>
                  <path d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z' />
                </svg>
                ENVIAR PEDIDO A WHATSAPP (300 862 5143)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
