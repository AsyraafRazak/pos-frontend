import { ShoppingBasket } from 'lucide-react'
import type { Product } from '@/types/pos.types'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onClick: (product: Product) => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      className="product-card no-select"
      onClick={() => onClick(product)}
      title={product.name}
    >
      <div className="product-card__image">
        <ShoppingBasket size={24} />
      </div>

      {product.hasModifiers && (
        <span className="product-card__options-badge">Options</span>
      )}

      <span className="product-card__name truncate">{product.name}</span>
      <span className="product-card__price">RM{product.price.toFixed(2)}</span>
    </button>
  )
}
