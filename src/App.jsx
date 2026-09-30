import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout2 from './components/Layout2/Layout2'

import Checkout2 from './pages/Checkout2/Checkout2'
import Collections2 from './pages/Collections2/Collections2'
import Home2 from './pages/Home2/Home2'
import NotFound from './pages/NotFound/NotFound'
import Product2 from './pages/Product2/Product2'

function App () {
  const router = createBrowserRouter([
    {
      element: <Layout2 />,
      children: [
        { path: '/', element: <Home2 /> },
        { path: '/checkout', element: <Checkout2 /> },
        { path: '/catalogo', element: <Collections2 /> },
        { path: '/categorias', element: <Collections2 /> },
        { path: '/producto/:id', element: <Product2 /> },
        { path: '/product/:id', element: <Product2 /> },
        { path: '*', element: <NotFound /> }
      ]
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
