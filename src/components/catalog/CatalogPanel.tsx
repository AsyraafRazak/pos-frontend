import { useState, useEffect, useCallback } from 'react'
import { SearchBar } from './SearchBar'
import { ProductCard } from './ProductCard'
import { useCartStore } from '@/stores/useCartStore'
import { useUIStore } from '@/stores/useUIStore'
import { fetchCategories, fetchProducts } from '@/lib/api'
import { adaptCategory, adaptProduct } from '@/lib/adapters'
import { generateCartItemId } from '@/lib/utils'
import type { Category, Product } from '@/types/pos.types'
import './CatalogPanel.css'

export function CatalogPanel() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([{ id: 'all', name: 'All' }])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const addItem = useCartStore((s) => s.addItem)
  const openModal = useUIStore((s) => s.openModal)

  // Load categories + products from the API on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      fetchCategories(true),
      fetchProducts({ activeOnly: true }),
    ])
      .then(([catDtos, prodDtos]) => {
        if (cancelled) return
        setCategories([
          { id: 'all', name: 'All' },
          ...catDtos.map(adaptCategory),
        ])
        setProducts(prodDtos.map(adaptProduct))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(`Could not load catalogue: ${msg}`)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const query = searchQuery.trim().toLowerCase()
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.category === categories.find((c) => c.id === activeCategory)?.name
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query))
    return matchesCategory && matchesSearch
  })

  const handleProductClick = useCallback(
    (product: Product) => {
      if (product.hasModifiers) {
        openModal('modifiers', product)
      } else {
        addItem({
          id: generateCartItemId(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        })
      }
    },
    [addItem, openModal],
  )

  const handleBarcode = useCallback(
    (barcode: string) => {
      const product = products.find((p) => p.barcode === barcode)
      if (product) handleProductClick(product)
    },
    [products, handleProductClick],
  )

  const handleSearchSubmit = useCallback(() => {
    if (filteredProducts.length === 1) {
      handleProductClick(filteredProducts[0])
      setSearchQuery('')
    } else if (query) {
      const exactBarcode = products.find((p) => p.barcode === query)
      if (exactBarcode) {
        handleProductClick(exactBarcode)
        setSearchQuery('')
      }
    }
  }, [filteredProducts, handleProductClick, query, products])

  return (
    <div className="catalog">
      {/* Toolbar: Search + Category Tabs */}
      <div className="catalog__toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onBarcode={handleBarcode}
          onSubmit={handleSearchSubmit}
        />
        <div className="catalog__tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`catalog__tab no-select ${activeCategory === cat.id ? 'catalog__tab--active' : 'catalog__tab--inactive'}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="catalog__empty">
          <p>Loading catalogue…</p>
        </div>
      ) : error ? (
        <div className="catalog__empty">
          <p style={{ color: 'var(--color-danger, #e53e3e)' }}>{error}</p>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="catalog__empty">
          <p>No products found for &ldquo;{searchQuery}&rdquo;</p>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="catalog__grid scrollbar-thin">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onClick={handleProductClick} />
          ))}
        </div>
      )}
    </div>
  )
}
