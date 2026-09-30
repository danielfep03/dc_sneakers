/**
 * CatalogPage.jsx
 * Vista de Catálogo según el plan (Sección 8.3):
 * - FiltersPanel lateral (escritorio) y modal/drawer (móvil).
 * - SortSelect con opciones en español.
 * - ActiveFilters con chips removibles.
 * - ProductGrid con Infinite Scroll (hook useInfiniteScroll con IntersectionObserver).
 * - Skeletons mientras carga y mensajes de estado vacío amigables.
 * - Sincronización con Query Params en la URL.
 * Copys 100% en español.
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCatalogStore } from '@/stores/catalogStore'
import { getProducts } from '@/services/productService'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import ProductCard from '@/components/product/ProductCard'
import FiltersPanel from '@/components/catalog/FiltersPanel'
import ActiveFilters from '@/components/catalog/ActiveFilters'
import SortSelect from '@/components/catalog/SortSelect'
import Skeleton from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import styles from './CatalogPage.module.css'

export default function CatalogPage () {
  const [searchParams] = useSearchParams()

  const filters = useCatalogStore((state) => state.filters)
  const sort = useCatalogStore((state) => state.sort)
  const syncFromUrlParams = useCatalogStore((state) => state.syncFromUrlParams)
  const clearFilters = useCatalogStore((state) => state.clearFilters)

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Sincronizar filtros desde la URL al montar
  useEffect(() => {
    syncFromUrlParams(searchParams)
  }, [searchParams, syncFromUrlParams])

  // Cargar productos de la primera página cuando cambian los filtros o el orden
  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setPage(1)

    getProducts({ filters, sort, page: 1, pageSize: 12 })
      .then((data) => {
        if (!isCurrent) return
        setProducts(data.items)
        setTotalCount(data.total)
        setHasMore(data.hasMore)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando catálogo:', err)
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [filters, sort])

  // Cargar más productos (Infinite Scroll)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1

    getProducts({ filters, sort, page: nextPage, pageSize: 12 })
      .then((data) => {
        setProducts((prev) => [...prev, ...data.items])
        setPage(nextPage)
        setHasMore(data.hasMore)
        setIsLoadingMore(false)
      })
      .catch((err) => {
        console.error('Error en infinite scroll:', err)
        setIsLoadingMore(false)
      })
  }, [isLoadingMore, hasMore, page, filters, sort])

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore
  })

  return (
    <div className={styles.catalogPage}>
      {/* Encabezado y Contador */}
      <div className={styles.topBar}>
        <h1 className={styles.title}>CATÁLOGO DE SNEAKERS</h1>
        <span className={styles.counter}>
          [{totalCount} SILUETAS DISPONIBLES]
        </span>
      </div>

      {/* Barra de Filtros Activos y Ordenamiento */}
      <ActiveFilters />

      <div className={styles.actionsRow}>
        <button
          type='button'
          className={styles.mobileFilterBtn}
          onClick={() => setMobileFilterOpen(true)}
        >
          <span>Filtros</span>
          <span>⚙</span>
        </button>

        <SortSelect />
      </div>

      {/* Grid Principal con Panel de Filtros a la izquierda */}
      <div className={styles.layout}>
        <div className={styles.desktopFilters}>
          <FiltersPanel />
        </div>

        <div>
          {isLoading ? (
            <div className={styles.productsGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height='380px' />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>NO HAY RESULTADOS</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No encontramos sneakers que coincidan con los filtros seleccionados.
              </p>
              <Button variant='outline' size='md' onClick={clearFilters}>
                LIMPIAR TODOS LOS FILTROS
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.productsGrid}>
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Centinela para Infinite Scroll */}
              <div ref={sentinelRef} className={styles.sentinel}>
                {isLoadingMore && <span>Cargando más siluetas...</span>}
                {!hasMore && products.length > 0 && (
                  <span>Has llegado al final del catálogo.</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Filtros en Mobile */}
      <Modal
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title='FILTRAR CATÁLOGO'
      >
        <FiltersPanel />
        <div style={{ marginTop: '1.5rem' }}>
          <Button
            variant='primary'
            fullWidth
            onClick={() => setMobileFilterOpen(false)}
          >
            APLICAR FILTROS
          </Button>
        </div>
      </Modal>
    </div>
  )
}
