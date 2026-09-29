# Mapeo de Vistas y Estado Actual (DC Sneakers)

Este documento detalla el estado actual del componente monolítico `Home.jsx` y su correspondencia con las rutas y stores que estamos construyendo de forma incremental.

## Vistas identificadas en el monolito (`Home.jsx`)

1. **Home / Catálogo Principal (`/`)**:
   - Muestra el banner principal, filtros por categoría de tenis ('ALL', 'BASKETBALL', 'VOLEIBOL', 'CASUAL'), barra de búsqueda y la grilla de productos.
   - Maneja estado local de búsqueda (`searchQuery`), categoría seleccionada (`selectedCategory`), y favoritos (`favorites`).

2. **Detalle de Producto (`/product/:id`)**:
   - Actualmente se abre como un modal / vista superpuesta dentro de `Home.jsx`.
   - Permite seleccionar talla (`detailSize`), color (`detailColor`), cantidad y agregar al carrito.

3. **Colecciones (`/collections`)**:
   - Vista especializada de filtrado avanzado y listado masivo de productos.

4. **Checkout (`/checkout`)**:
   - Flujo de compra completo dentro de modales o secciones condicionales (Envío, Pago, Confirmación).

5. **Perfil / Cuenta (`/account`)**:
   - Historial de órdenes de compra (`ordersList`), datos de cuenta y notificaciones.

---

## Plan de extracción de estado hacia Zustand y Stores Globales

- **Carrito (`useCartStore`)**:
  - Extraer `cart` y `isCartOpen`, junto con métodos `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
  - Persistencia en `localStorage`.

- **Autenticación (`useAuthStore`)**:
  - Manejo de sesión de Supabase (`session`, `user`), integrando `supabase.auth`.

- **Catálogo y Filtros**:
  - Mantener sincronización con parámetros de URL (`useSearchParams`, `useParams`) y preparar servicios hacia Supabase.
