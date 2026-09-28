import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/pos.types'
import { useCartStore } from '@/stores/useCartStore'
import { formatCurrency } from '@/lib/utils'
import './CartItem.css'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const incrementItem = useCartStore((s) => s.incrementItem)
  const decrementItem = useCartStore((s) => s.decrementItem)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <li className="cart-item">
      {/* Qty stepper */}
      <div className="cart-item__qty-ctrl">
        <button
          className="cart-item__qty-btn no-select"
          onClick={() => incrementItem(item.id)}
          aria-label="Increase quantity"
        >
          <Plus size={10} />
        </button>
        <span className="cart-item__qty">{item.quantity}</span>
        <button
          className="cart-item__qty-btn no-select"
          onClick={() => decrementItem(item.id)}
          aria-label="Decrease quantity"
        >
          <Minus size={10} />
        </button>
      </div>

      {/* Item details */}
      <div className="cart-item__info">
        <p className="cart-item__name truncate">{item.name}</p>
        {item.modifiers && item.modifiers.length > 0 && (
          <p className="cart-item__modifiers">
            {item.modifiers.map((m) => m.name).join(' · ')}
          </p>
        )}
        {item.note && <p className="cart-item__note">&ldquo;{item.note}&rdquo;</p>}
        <p className="cart-item__unit-price">@ {formatCurrency(item.price)}</p>
      </div>

      {/* Line total + remove */}
      <div className="cart-item__right">
        <span className="cart-item__line-total">{formatCurrency(item.lineTotal)}</span>
        <button
          className="cart-item__remove no-select"
          onClick={() => removeItem(item.id)}
          aria-label="Remove item"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </li>
  )
}
