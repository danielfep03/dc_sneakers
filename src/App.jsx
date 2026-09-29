import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout2 from './components/Layout2/Layout2'

import Checkout2 from './pages/Checkout2/Checkout2'
import Collections2 from './pages/Collections2/Collections2'
import Home2 from './pages/Home2/Home2'
import NotFound from './pages/NotFound/NotFound'

function App () {
  const router = createBrowserRouter([
    {
      element: <Layout2 />,
      children: [
        { path: '/', element: <Home2 /> },
        { path: '/checkout', element: <Checkout2 /> },
        { path: '/categorias', element: <Collections2 /> },
        { path: '*', element: <NotFound /> }
      ]
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
