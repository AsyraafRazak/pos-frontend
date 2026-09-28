import { useState, useCallback } from 'react'
import { SearchBar } from './SearchBar'
import { ProductCard } from './ProductCard'
import { useCartStore } from '@/stores/useCartStore'
import { useUIStore } from '@/stores/useUIStore'
import { CATEGORIES, MOCK_PRODUCTS } from '@/data/mockData'
import { generateCartItemId } from '@/lib/utils'
import type { Product } from '@/types/pos.types'
import './CatalogPanel.css'

export function CatalogPanel() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const addItem = useCartStore((s) => s.addItem)
  const openModal = useUIStore((s) => s.openModal)

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory
    const matchesSearch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      const product = MOCK_PRODUCTS.find((p) => p.barcode === barcode)
      if (product) handleProductClick(product)
    },
    [handleProductClick],
  )

  return (
    <div className="catalog">
      {/* Toolbar: Search + Category Tabs */}
      <div className="catalog__toolbar">
        <SearchBar value={searchQuery} onChange={setSearchQuery} onBarcode={handleBarcode} />
        <div className="catalog__tabs">
          {CATEGORIES.map((cat) => (
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
      {filteredProducts.length === 0 ? (
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
