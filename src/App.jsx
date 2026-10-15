import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout/Layout'

const Home = lazy(() => import('./pages/Home/Home'))
const Checkout = lazy(() => import('./pages/Checkout/Checkout'))
const Collections = lazy(() => import('./pages/Collections/Collections'))
const Product = lazy(() => import('./pages/Product/Product'))
const NotFound = lazy(() => import('./pages/NotFound/NotFound'))

function RouteFallback () {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(48, 79, 254, 0.2)',
          borderTopColor: 'var(--color-accent, #304FFE)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

function withSuspense (Component) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  )
}

function App () {
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        { path: '/', element: withSuspense(Home) },
        { path: '/checkout', element: withSuspense(Checkout) },
        { path: '/catalogo', element: withSuspense(Collections) },
        { path: '/categorias', element: withSuspense(Collections) },
        { path: '/producto/:id', element: withSuspense(Product) },
        { path: '/product/:id', element: withSuspense(Product) },
        { path: '*', element: withSuspense(NotFound) }
      ]
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
