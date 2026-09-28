import { LayoutGrid } from 'lucide-react'
import './CatalogPanel.css'

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Desserts']

export function CatalogPanel() {
  return (
    <div className="catalog">
      {/* Category Tabs */}
      <div className="catalog__tabs">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className={`catalog__tab no-select ${i === 0 ? 'catalog__tab--active' : 'catalog__tab--inactive'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="catalog__grid scrollbar-thin">
        {Array.from({ length: 20 }).map((_, i) => (
          <button key={i} className="product-card no-select">
            <div className="product-card__icon">
              <LayoutGrid size={20} />
            </div>
            <span className="product-card__name truncate">Product {i + 1}</span>
            <span className="product-card__price">
              ₱{(Math.random() * 200 + 50).toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
