# Plan de trabajo – Front de **dc_sneakers**

> Documento para el agente de código. Léelo completo antes de escribir código.
> Alcance de esta etapa: **solo front-end**, con datos mock en JSON. La conexión real con Supabase se hará después, por eso la arquitectura debe dejar ese cambio listo (ver sección 6).

---

## 1. Objetivo

Construir la tienda online de sneakers **dc_sneakers** con estética streetwear oscura (negro + verde lima), muy intuitiva, con el **logo y la marca siempre muy visibles**.

Vistas a construir:

| Ruta | Vista |
|------|-------|
| `/` | Home |
| `/catalogo` | Catálogo con filtros e infinite scroll |
| `/producto/:slug` | Detalle de producto |
| `/checkout` | Checkout en 2 columnas |
| `*` | Página 404 simple |

Fuera de alcance por ahora: autenticación, SEO, páginas extra (contacto, términos), contador regresivo de lanzamiento, integración real de Addi y Bold.

---

## 2. Stack y reglas técnicas

- **React + Vite** (JavaScript; TypeScript solo si el equipo lo pide).
- **CSS Modules** (un `.module.css` por componente). Sin librerías de UI.
- **React Router** para las rutas.
- **Zustand** para todo el estado global (carrito, favoritos, filtros, UI, checkout).
- **Carrusel:** usar Embla Carousel (`embla-carousel-react`) o Swiper. Elegir una y usarla en todo el proyecto.
- **Datos:** archivos JSON en `src/data/` accedidos **solo** a través de la capa `services/`.
- **Idioma:** español. **Moneda:** COP, formateada con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.

### Reglas de código (obligatorias)

1. **Un componente = una carpeta** con su `.jsx` y su `.module.css`. Ejemplo: `ProductCard/ProductCard.jsx` + `ProductCard.module.css` + `index.js`.
2. **Componentes pequeños**. Si un componente pasa de ~120 líneas, se divide.
3. **Evitar prop drilling**: los componentes reciben pocas props (idealmente 1 a 3). Si un dato es global, el componente lo lee directo del store de Zustand con un selector.
4. **Selectores de Zustand siempre específicos**, nunca el store completo:
   ```js
   // Bien: solo re-renderiza si cambia count
   const count = useCartStore((state) => state.items.length);
   // Mal: re-renderiza con cualquier cambio del store
   const store = useCartStore();
   ```
5. **La lógica no vive en los componentes visuales**: va en `hooks/`, `stores/` y `services/`. Los componentes solo pintan.
6. **Nombres**: identificadores de código en inglés (`ProductCard`, `addItem`), **comentarios en español**.
7. **Comentarios pensados para un desarrollador junior**:
   - Cada archivo empieza con un comentario de 1–3 líneas que explica su propósito.
   - Cada store documenta sus acciones.
   - **El CSS lleva comentarios en cada bloque importante**: qué hace, por qué se hizo así (por ejemplo `/* Zoom suave al hacer hover: la imagen crece pero el contenedor la recorta con overflow hidden */`).
8. **Sin números ni colores "mágicos"** en el CSS: todo sale de variables (`var(--color-accent)`, `var(--space-4)`).
9. **Accesibilidad básica**: `alt` en imágenes, `aria-label` en botones de solo ícono, foco visible, navegación por teclado en el menú y modales.
10. **Mobile first**. Breakpoints definidos en un solo lugar (ver sección 4).

---

## 3. Estructura de carpetas

```
src/
├─ assets/                # logo, íconos, imágenes placeholder
├─ config/
│  └─ storeConfig.js      # WhatsApp, datos bancarios, envío, regalo (ver sección 9)
├─ data/                  # datos mock (temporal, luego Supabase)
│  ├─ products.json
│  ├─ brands.json
│  ├─ categories.json
│  └─ sizeGuide.json
├─ services/              # ÚNICA capa que sabe de dónde vienen los datos
│  ├─ productService.js
│  ├─ brandService.js
│  ├─ categoryService.js
│  └─ orderService.js
├─ stores/                # Zustand
│  ├─ cartStore.js
│  ├─ favoritesStore.js
│  ├─ catalogStore.js
│  ├─ checkoutStore.js
│  └─ uiStore.js
├─ hooks/
│  ├─ useInfiniteScroll.js
│  ├─ useLiveViewers.js
│  ├─ useCountdown.js     # NO se usa por ahora, no crear
│  └─ useMediaQuery.js
├─ utils/
│  ├─ formatPrice.js
│  ├─ buildWhatsappMessage.js
│  └─ calcDiscount.js
├─ styles/
│  ├─ variables.css       # tokens de diseño (colores, tipografía, espacios)
│  ├─ reset.css
│  └─ global.css
├─ components/
│  ├─ layout/             # Header, Footer, MobileMenu, CartDrawer, Layout
│  ├─ ui/                 # Button, Badge, Price, Modal, Skeleton, IconButton, SectionTitle
│  ├─ home/               # HeroSection, PerksBar, OffersCarousel, BrandsSection, MoreProducts, StoreBanner
│  ├─ product/            # ProductCard, ProductGrid, ProductGallery, SizeSelector, SizeGuideModal, LiveViewers, AddiBadge
│  ├─ catalog/            # FiltersPanel, FilterGroup, ActiveFilters, SortSelect
│  └─ checkout/           # ContactForm, PaymentMethods, BankTransferInfo, BoldDemo, OrderSummary, OrderItem
├─ pages/
│  ├─ HomePage.jsx
│  ├─ CatalogPage.jsx
│  ├─ ProductPage.jsx
│  ├─ CheckoutPage.jsx
│  └─ NotFoundPage.jsx
├─ App.jsx                # rutas
└─ main.jsx
```

> Nota: `useCountdown.js` aparece solo para dejar claro que **no se implementa** (el contador se descartó). No crearlo.

---

## 4. Sistema de diseño

Inspirado en la imagen de referencia. Todo en `src/styles/variables.css`, con comentarios.

### Colores (ajustar con un selector de color sobre la imagen)

```css
:root {
  /* Fondos */
  --color-bg: #0a0a0a;            /* negro base de la página */
  --color-surface: #141414;       /* tarjetas y paneles */
  --color-surface-2: #1c1c1c;     /* hover de tarjetas */
  --color-paper: #ececec;         /* secciones "papel rasgado" claras */

  /* Texto */
  --color-text: #ffffff;
  --color-text-muted: #9a9a9a;
  --color-text-on-accent: #0a0a0a;

  /* Acento: verde lima de la referencia */
  --color-accent: #c6ff00;
  --color-accent-hover: #d8ff4d;

  /* Estados */
  --color-danger: #ff4d4d;        /* etiqueta de oferta / errores */
  --color-border: #2a2a2a;
}
```

### Tipografía (Google Fonts)

- **Títulos:** fuente condensada en mayúsculas, estilo "BUILT DIFFERENT" → `Anton` o `Bebas Neue`.
- **Acentos manuscritos** ("RULE THE STREETS", subrayado marcador): `Permanent Marker` o `Caveat Brush`, usada con moderación.
- **Texto general:** `Barlow` o `Inter`.
- Definir `--font-display`, `--font-script`, `--font-body`, y una escala de tamaños (`--text-sm` … `--text-hero`).

### Otros tokens

- Espaciado: `--space-1` … `--space-8` (múltiplos de 4px).
- Radios: `--radius-sm`, `--radius-md`. Los botones de la referencia son **rectos o casi rectos**.
- Breakpoints (documentarlos en un comentario, ya que CSS no permite variables en `@media`): `640px` (móvil grande), `900px` (tablet), `1200px` (escritorio).

### Rasgos visuales a replicar

- Botones lima con texto negro en mayúsculas y flecha (`SHOP NOW →`).
- Botón cuadrado lima con `+` en las esquinas de las tarjetas.
- Subrayado tipo marcador lima bajo títulos clave.
- Borde de "papel rasgado" en la sección de oferta destacada (con `clip-path` o SVG).
- Barra de perks con separadores `+` en lima.
- Sellos circulares lima (ej. "ONLY 200 PIECES") para etiquetas especiales.
- Líneas y cuadrícula sutil de fondo en secciones oscuras.

### Logo (prioridad alta)

- Componente `Logo` reutilizable con la variante del header y la del footer.
- **Grande y siempre visible**: en móvil también debe verse claramente, no como un ícono pequeño.
- El header es **sticky**, con fondo negro y un ligero blur al hacer scroll.

---

## 5. Datos mock (temporal)

Los archivos JSON viven en `src/data/`. **Las imágenes son placeholders** (usar `https://placehold.co/600x600/141414/c6ff00?text=Sneaker` o archivos locales en `assets/placeholders/`). Generar **mínimo 24 productos** para probar infinite scroll, repartidos entre Nike, Adidas, New Balance y Jordan, con ~8 en oferta.

### `products.json` (forma de cada producto)

Pensada para mapear casi 1 a 1 con una futura tabla de Supabase.

```json
{
  "id": "p-001",
  "slug": "nike-air-force-1-low-white",
  "name": "Nike Air Force 1 Low White",
  "brandId": "nike",
  "categoryId": "lifestyle",
  "description": "Descripción corta del producto.",
  "price": 459900,
  "salePrice": 389900,
  "images": [
    "https://placehold.co/800x800/141414/c6ff00?text=AF1+1",
    "https://placehold.co/800x800/141414/c6ff00?text=AF1+2"
  ],
  "sizes": [
    { "size": 38, "stock": 3 },
    { "size": 39, "stock": 0 },
    { "size": 40, "stock": 5 }
  ],
  "isNew": true,
  "createdAt": "2026-09-01T00:00:00Z"
}
```

Reglas:
- `salePrice` es `null` cuando no hay oferta.
- Una talla con `stock: 0` se muestra deshabilitada.
- Precios en pesos colombianos, enteros.

### `brands.json`
```json
[
  { "id": "nike", "name": "Nike", "logo": "..." },
  { "id": "adidas", "name": "Adidas", "logo": "..." },
  { "id": "new-balance", "name": "New Balance", "logo": "..." },
  { "id": "jordan", "name": "Jordan", "logo": "..." }
]
```

### `categories.json`
Categorías de ejemplo: `lifestyle`, `running`, `basketball`, `skate`. Cada una con `id`, `name`, `slug`.

### `sizeGuide.json`
Tabla con equivalencias: talla COL/EU, US hombre, US mujer y longitud del pie en cm.

---

## 6. Capa de servicios (clave para migrar a Supabase)

Los componentes y stores **nunca** importan los JSON directamente. Solo llaman a funciones de `services/`. Todas son `async` y simulan una pequeña latencia (300–600 ms) para probar estados de carga.

```js
// services/productService.js  (versión mock)
// Cuando conectemos Supabase, SOLO se reescribe el interior de estas funciones.
export async function getProducts({ filters, sort, page, pageSize }) { /* ... */ }
export async function getProductBySlug(slug) { /* ... */ }
export async function getOffers() { /* ... */ }
export async function getNewProducts(limit) { /* ... */ }
```

```js
// services/orderService.js
// Mock: guarda la orden en localStorage y devuelve un id.
// Futuro: insertará en las tablas orders y order_items de Supabase.
export async function createOrder(orderData) { /* ... */ }
```

Contrato de `getProducts`: devuelve `{ items, total, hasMore }`. El infinite scroll depende de `hasMore`.

Otros servicios: `getBrands()`, `getCategories()`.

> Las órdenes se guardarán en Supabase antes de abrir WhatsApp. En esta etapa `createOrder` es un mock con la misma firma.

---

## 7. Stores de Zustand

Todos con comentarios que expliquen el estado y cada acción.

### `cartStore`
- Estado: `items` (`[{ productId, slug, name, image, size, unitPrice, quantity }]`).
- Acciones: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
- Derivados (funciones o selectores): `getTotalItems`, `getSubtotal`.
- Persistido con el middleware `persist` (localStorage).
- La clave de un ítem es `productId + size` (misma talla suma cantidad).

### `favoritesStore`
- Estado: `favoriteIds` (arreglo de ids).
- Acciones: `toggleFavorite(id)`, `isFavorite(id)`.
- Persistido con `persist` (no hay autenticación todavía).

### `catalogStore`
- Estado: `filters` (`brands[]`, `categories[]`, `sizes[]`, `priceRange {min,max}`, `onlyOffers`), `sort` (`newest | price-asc | price-desc`).
- Acciones: `setFilter`, `toggleFilterValue`, `clearFilters`, `setSort`.
- Sincronizar con la URL (query params) para poder compartir enlaces. Ej.: `/catalogo?marca=nike&oferta=1`.

### `checkoutStore`
- Estado: `contact` (`name`, `address`, `phone`), `paymentMethod` (`transfer | bold-demo`), errores de validación.
- Acciones: `setContactField`, `setPaymentMethod`, `validate`, `reset`.

### `uiStore`
- Estado: `isMobileMenuOpen`, `isCartOpen`, `isSizeGuideOpen`.
- Acciones: `openMobileMenu`, `closeMobileMenu`, `toggleCart`, `openSizeGuide`, etc.

---

## 8. Vistas y componentes

### 8.1 Layout global
- **Header** (sticky): logo grande a la izquierda; nav de escritorio con Colecciones/Categorías (marcas y categorías); íconos de favoritos y carrito (con contador que lee `cartStore`).
- **MobileMenu** (hamburguesa): panel lateral con las **categorías**, marcas y acceso a favoritos. Se cierra con Escape, con clic fuera y al navegar.
- **CartDrawer**: panel lateral con los ítems, subtotal y botón "Ir a pagar" hacia `/checkout`.
- **Footer**: logo, enlaces a categorías y marcas, redes sociales (placeholders), medios de pago.

### 8.2 Home (`/`) — secciones en este orden
1. **HeroSection**: imagen grande de sneakers (placeholder), frase manuscrita, titular en condensada, promoción y botón "Comprar ahora" hacia `/catalogo`.
2. **PerksBar**: barra con 3 perks: 🧦 *Par de medias gratis*, 🛡️ *Garantía*, 🔄 *Cambios por talla*. En móvil puede ser un marquee/carrusel horizontal.
3. **OffersCarousel**: **carrusel** de productos en oferta. Cada card muestra precio original tachado **y a un lado** el precio de oferta, más el porcentaje de descuento. Flechas en escritorio, swipe en móvil.
4. **BrandsSection**: categorías por marca (Nike, Adidas, New Balance, Jordan). Cada tarjeta lleva a `/catalogo?marca=...`.
5. **MoreProducts**: "Más artículos", cuadrícula de productos con botón "Ver todo".
6. **StoreBanner**: foto de la tienda (placeholder) con el texto "Bienvenido a la familia dc_sneakers".
7. **Footer**.

### 8.3 Catálogo (`/catalogo`)
- **FiltersPanel** con grupos: marca, categoría, talla, rango de precio, "solo ofertas". En móvil se abre como panel/modal desde un botón "Filtros".
- **SortSelect**: más nuevos, precio menor a mayor, precio mayor a menor.
- **ActiveFilters**: chips removibles + "Limpiar todo".
- **ProductGrid** con **infinite scroll** usando `IntersectionObserver` en el hook `useInfiniteScroll` (tamaño de página: 12).
- Estados: skeletons mientras carga, mensaje amigable si no hay resultados, mensaje al llegar al final.
- Cambiar filtros reinicia la lista y vuelve arriba.

### 8.4 ProductCard (componente compartido)
Se usa en Home, Catálogo y Favoritos. Recibe **solo `product`** (o solo `productId`).
- **Zoom en hover** de la imagen (transform scale con `overflow: hidden` en el contenedor, transición suave). En pantallas táctiles no aplica.
- Nombre del producto y marca.
- Precio con el componente `Price`: si hay `salePrice`, muestra tachado el original + el de oferta.
- Etiquetas: "Nuevo", "-25%".
- Botón de favorito (corazón) que lee y escribe en `favoritesStore`. **No** recibe el estado por props.
- Clic en la card lleva a `/producto/:slug`.

### 8.5 Producto (`/producto/:slug`)
- **ProductGallery**: imagen principal + miniaturas; zoom opcional.
- Nombre, marca, `Price`, descripción.
- **SizeSelector**: tallas disponibles; las agotadas aparecen deshabilitadas. Botón "Agregar al carrito" deshabilitado hasta elegir talla (con mensaje claro).
- **SizeGuideModal**: se abre con el enlace "Guía de tallas" (usa `sizeGuide.json` y `uiStore`).
- **AddiBadge**: bloque informativo "Paga con Addi". **Solo visual** por ahora: no hay integración real ni cálculo de cuotas confirmado. Dejarlo como componente aislado para conectarlo después.
- **LiveViewers**: "👀 X personas están viendo este producto". Hook `useLiveViewers`:
  - Número **simulado** entre 3 y 15.
  - Cambia **cada 4 segundos**, con variaciones pequeñas (±1 a ±3) para que se sienta natural.
  - Limpia el `setInterval` al desmontar.
- Sección "También te puede gustar" (opcional, misma marca).

### 8.6 Checkout (`/checkout`) — 2 columnas
En móvil, una sola columna: primero el resumen colapsable y luego el formulario.

**Columna izquierda**
1. **ContactForm**: nombre, dirección, teléfono de contacto. Validación clara y en español (campos obligatorios, teléfono con formato colombiano).
2. **PaymentMethods** (selección de una opción):
   - **Transferencia bancaria**: al elegirla se despliega `BankTransferInfo` con banco, número de cuenta y titular (leídos de `config/storeConfig.js`), con botón "Copiar número de cuenta".
   - **Bold (demo)**: `BoldDemo` simula el flujo de pago con un botón y pantalla de éxito ficticia, claramente marcado como **DEMO**. Aislado para reemplazarlo por la integración real después. La integración real de Bold normalmente requiere generar una firma en servidor, así que en esta etapa es solo simulación (verificar en la documentación de Bold cuando se conecte).
   - **Addi**: **no** se ofrece como método en checkout por ahora.
3. Botón principal: **"Finalizar pedido por WhatsApp"**.

**Columna derecha — OrderSummary**
- Lista de productos (`OrderItem`): imagen, nombre, talla, cantidad, precio.
- Subtotal, **Envío: GRATIS**, **Total**.
- Mensaje destacado: **"🧦 ¡Te regalamos un par de medias con tu pedido!"**.

**Flujo al finalizar** (transferencia):
1. Validar formulario (`checkoutStore.validate`).
2. `orderService.createOrder(...)` (mock hoy, Supabase mañana).
3. Construir el mensaje con `buildWhatsappMessage` y abrir `https://wa.me/<numero>?text=<mensaje-codificado>` en una pestaña nueva.
4. Vaciar carrito y mostrar un estado de confirmación dentro de la misma página (sin ruta nueva).

**Formato del mensaje de WhatsApp**
```
Hola dc_sneakers, quiero confirmar mi pedido #<id>

👤 Nombre: <nombre>
📞 Teléfono: <teléfono>
📍 Dirección: <dirección>

🛒 Productos:
- Nike Air Force 1 Low White · Talla 40 · x1 · $389.900
- ...

🧦 Incluye par de medias de regalo
🚚 Envío: Gratis
💰 Total: $<total>
💳 Método de pago: Transferencia bancaria
```

---

## 9. Configuración centralizada (`config/storeConfig.js`)

Todo lo que puede cambiar sin tocar componentes. **Valores placeholder hasta que el cliente los entregue:**

```js
export const storeConfig = {
  name: 'dc_sneakers',
  whatsappNumber: '57XXXXXXXXXX',      // PENDIENTE: número real con indicativo, sin +
  freeShipping: true,
  giftText: 'Par de medias de regalo',
  bank: {
    bankName: 'PENDIENTE',
    accountType: 'PENDIENTE',
    accountNumber: 'PENDIENTE',
    accountHolder: 'PENDIENTE',
  },
};
```

---

## 10. Fases de trabajo y criterios de aceptación

### Fase 0 — Base del proyecto
- Vite + React, dependencias, React Router, estructura de carpetas, `variables.css`, `reset.css`, `global.css`, fuentes, `Layout` con rutas vacías.
- ✅ `npm run dev` levanta y navega entre las 4 rutas. Los tokens de diseño están en un solo archivo comentado.

### Fase 1 — Datos, servicios y stores
- JSON mock (≥24 productos), `services/`, los 5 stores, utilidades (`formatPrice`, `calcDiscount`).
- ✅ Los servicios devuelven datos con latencia simulada. Carrito y favoritos persisten al recargar.

### Fase 2 — Componentes UI base + Layout
- `Button`, `Badge`, `Price`, `Modal`, `Skeleton`, `IconButton`, `SectionTitle`, `Logo`.
- `Header` (sticky), `MobileMenu` con categorías, `CartDrawer`, `Footer`.
- ✅ Logo grande y visible en móvil y escritorio. Menú hamburguesa funcional y accesible. El contador del carrito se actualiza.

### Fase 3 — ProductCard
- Zoom en hover, precio de oferta, favoritos con Zustand, etiquetas.
- ✅ Funciona igual en Home, Catálogo y Favoritos sin pasar más de 1 prop.

### Fase 4 — Home
- Las 6 secciones + footer, en el orden definido.
- ✅ Carrusel de ofertas con swipe/flechas. Todas las secciones responsive. Fiel al estilo de la referencia.

### Fase 5 — Catálogo
- Filtros, orden, chips activos, infinite scroll, sincronización con la URL.
- ✅ Filtrar reinicia la lista. El scroll carga más de 12 en 12. Hay skeletons y estado vacío.

### Fase 6 — Producto
- Galería, selector de tallas, guía de tallas, `AddiBadge`, `LiveViewers`, agregar al carrito.
- ✅ El indicador cambia cada 4 s y limpia su intervalo. No se puede agregar sin talla. Agotadas deshabilitadas.

### Fase 7 — Checkout
- Formulario, métodos de pago, `BankTransferInfo`, `BoldDemo`, resumen, flujo a WhatsApp.
- ✅ Validación correcta. El mensaje de WhatsApp sale bien formado y codificado. Se muestra el regalo de medias y el envío gratis. Carrito vacío redirige/avisa.

### Fase 8 — Pulido y revisión
- Revisión responsive (360px, 768px, 1280px), accesibilidad básica, estados de error, limpieza de código y comentarios.
- ✅ Sin errores en consola, sin props innecesarias, todos los archivos con comentario de propósito, CSS comentado por bloques.

---

## 11. Preparado para la siguiente etapa (Supabase)

Cuando se conecte el backend, el cambio debe limitarse a:
1. Reescribir el interior de `services/*` para usar `supabase-js`.
2. Crear las tablas sugeridas: `products`, `brands`, `categories`, `product_variants` (talla + stock), `orders`, `order_items`.
3. Guardar la orden real antes de abrir WhatsApp.
4. Sustituir los JSON y placeholders por datos e imágenes reales (Supabase Storage).

Ningún componente ni store debería necesitar cambios para esto.

---

## 12. Pendientes que debe entregar el cliente

- [ ] Archivo del logo (SVG/PNG, versión clara sobre fondo oscuro).
- [ ] Número de WhatsApp de la tienda.
- [ ] Banco, tipo y número de cuenta, y titular.
- [ ] Fotos reales de productos y de la tienda (por ahora placeholders).
- [ ] Acceso/credenciales de Bold para la demo real (cuando toque).
- [ ] Textos finales: promoción del hero, perks, mensaje del banner.
