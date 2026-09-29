# Plan de refactorización — Ecommerce React

## Contexto

Este proyecto es una tienda de ecommerce construida en React. Actualmente:

- Casi todo el proyecto vive en **un solo archivo `.jsx`**.
- La navegación entre pantallas se maneja con **estado** (`useState`, condicionales tipo `view === 'x'`), **no con rutas reales**.
- Los estilos están en **un solo `module.css`**.

El objetivo es refactorizar hacia una arquitectura componentizada, con rutas reales (`react-router`) y estado global manejado con **Zustand**, sin romper la funcionalidad existente.

## Objetivo del agente

Migrar el proyecto de forma **incremental** (no big-bang) a la siguiente estructura, manteniendo la app funcional en cada paso.

```
src/
  routes/
    Home/
      Home.jsx
      Home.module.css
    Catalogo/
      Catalogo.jsx
      Catalogo.module.css
    Checkout/
      Checkout.jsx
      Checkout.module.css
      steps/
        Envio.jsx
        Pago.jsx
        Confirmacion.jsx
    Perfil/
      Perfil.jsx
      Perfil.module.css
  components/
    ProductCard/
      ProductCard.jsx
      ProductCard.module.css
    Header/
    Footer/
    CartDrawer/
    ...
  hooks/
    useProducts.js
    useCheckout.js
  store/
    useCartStore.js
    useAuthStore.js
    useProductStore.js      # solo si NO se usa TanStack Query para catálogo
  lib/
    supabaseClient.js          # instancia única del cliente de Supabase
  services/
    products.js              # queries a la tabla/vista de productos en Supabase
    orders.js                 # creación de órdenes, items de orden en Supabase
    payments.js                # pasarela de pagos (externa a Supabase)
  styles/
    variables.css             # tokens compartidos (colores, spacing, tipografía)
  App.jsx                      # define las rutas con react-router
  main.jsx
```

## Stack y decisiones técnicas

- **Enrutamiento**: `react-router` v6/v7. Cada "vista" actual manejada por estado se convierte en una ruta real.
- **Estado global**: **Zustand**. No usar Context API para el carrito ni auth — todo eso va a stores de Zustand.
- **Base de datos / backend**: **Supabase**. Una sola instancia del cliente en `lib/supabaseClient.js` (usando variables de entorno `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` o equivalente según el bundler), importada desde `services/`. No instanciar el cliente en más de un lugar.
- **Auth**: usar `supabase.auth` (no un sistema de auth propio). `useAuthStore` se suscribe a `supabase.auth.onAuthStateChange` para mantener sincronizado el estado del usuario, en vez de manejarlo manualmente.
- **Estado de servidor** (productos, catálogo, órdenes): evaluar TanStack Query sobre las queries de Supabase en vez de un store de Zustand con `useEffect` manual — da caché, refetch y estados de loading/error gratis. Si el agente detecta fetch de datos remotos con `useState` + `useEffect`, debe señalarlo antes de decidir la solución.
- **CSS**: un `.module.css` por componente/ruta. Variables compartidas (colores, spacing) van en `styles/variables.css`, importado donde se necesite.

## Stores de Zustand a crear

### `useCartStore.js`
- Estado: items del carrito, cantidad total, subtotal.
- Acciones: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
- Debe persistir en `localStorage` (usar el middleware `persist` de Zustand).

### `useAuthStore.js`
- Estado: usuario actual (`session`, `user`), estado de sesión (autenticado / no autenticado / cargando).
- Acciones: `login`, `logout`, `setUser` — internamente llaman a `supabase.auth.signInWithPassword`, `supabase.auth.signOut`, etc.
- Debe inicializarse escuchando `supabase.auth.onAuthStateChange` (típicamente en `App.jsx` o un provider raíz) para mantener el store sincronizado con la sesión real de Supabase.

### `useProductStore.js` (opcional, solo si no se usa TanStack Query)
- Estado: lista de productos, filtros activos, producto seleccionado.
- Acciones: `setProducts`, `setFilter`, `selectProduct`.
- Los datos vienen de `services/products.js`, que hace las queries a la tabla de productos en Supabase (`supabase.from('products').select(...)`).

## Plan de migración — pasos ordenados

1. **Instalar dependencias**: `react-router-dom`, `zustand`, `@supabase/supabase-js` (y `@tanstack/react-query` si aplica). Crear `lib/supabaseClient.js` con la instancia única del cliente, usando variables de entorno.
2. **Mapear el archivo actual**: listar cada "vista" manejada por estado, y qué piezas de estado/handlers pertenecen a cada una. Documentar esto en un comentario o archivo `MIGRATION_NOTES.md` antes de tocar código.
3. **Configurar el router base** en `App.jsx` con las rutas principales (`/`, `/productos`, `/checkout`, `/cuenta`), cada una apuntando a un componente placeholder por ahora.
4. **Crear los stores de Zustand** (`useCartStore`, `useAuthStore`) extrayendo la lógica de carrito/auth del archivo monolítico.
5. **Migrar vista por vista**, en este orden sugerido (de menor a mayor riesgo):
   1. Home
   2. Catálogo / listado de productos
   3. Perfil / cuenta
   4. Checkout (la más compleja — dejarla para el final, y usar sub-rutas por paso: `/checkout/envio`, `/checkout/pago`, `/checkout/confirmacion`)
   - Para cada vista: extraer el JSX correspondiente a `routes/<Vista>/`, identificar qué estado local puede quedarse en el componente y qué debe ir a un store, y conectar con react-router en vez del estado condicional viejo.
6. **Extraer componentes reutilizables** a medida que aparecen duplicados (ej. `ProductCard`, botones, modales) — no antes de tenerlos identificados por repetición real.
7. **Partir el CSS**: mover las reglas correspondientes a cada vista/componente migrado a su propio `.module.css`. Extraer variables compartidas a `styles/variables.css`.
8. **Eliminar el estado de navegación viejo** (`useState('view')` o similar) solo cuando todas las vistas estén migradas a rutas reales.
9. **Verificación final**: recorrer manualmente cada flujo (home → catálogo → agregar al carrito → checkout completo → perfil) confirmando que no se rompió nada.

## Reglas para el agente durante la migración

- No reescribir toda la app de una vez. Cada paso debe dejar la app en un estado funcional y verificable.
- No mezclar lógica de negocio dentro de componentes de presentación — si un componente hace fetch, cálculos de precio, o validaciones, esa lógica va a un hook (`hooks/`) o a un store, no al JSX.
- Mantener nombres de rutas y estructura de carpetas consistentes con lo definido arriba.
- Si encuentra estado que hoy es global pero solo lo usa un componente, bajarlo a estado local en vez de meterlo en un store.
- Si encuentra acoplamientos de CSS que dependían de la jerarquía del archivo único (selectores tipo `.parent .child`), hacerlos explícitos vía props o composición al modularizar.
- Avisar (no asumir) si detecta llamadas a API mezcladas con estado de UI que convendría separar con TanStack Query antes de continuar.

## Criterios de aceptación

- [ ] La navegación entre Home, Catálogo, Checkout y Perfil funciona vía URL (recargar la página en cualquiera de ellas no rompe la app).
- [ ] El carrito persiste al recargar la página.
- [ ] No queda ningún `useState` manejando qué "vista" mostrar.
- [ ] Cada componente tiene su propio `.module.css`, sin selectores rotos.
- [ ] El checkout multi-paso tiene una ruta por paso.
- [ ] No hay lógica de negocio (cálculos, fetch, validaciones) dentro de componentes de presentación.
- [ ] Existe una única instancia del cliente de Supabase (`lib/supabaseClient.js`), sin instanciarse en varios lugares.
- [ ] El estado de auth se mantiene sincronizado con `supabase.auth` (no hay lógica de sesión manejada por fuera de Supabase).