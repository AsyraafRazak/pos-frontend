import { ShoppingCart } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useCartStore } from '@/stores/useCartStore'
import { formatCurrency } from '@/lib/utils'
import './CartPanel.css'

export function CartPanel() {
  const { items, subtotal, tax, total } = useCartStore(
    useShallow((s) => ({
      items: s.items,
      subtotal: s.subtotal,
      tax: s.tax,
      total: s.total,
    }))
  )
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart__header">
        <div className="cart__header-left">
          <ShoppingCart size={16} />
          <span className="cart__title">Current Order</span>
        </div>
        {itemCount > 0 && (
          <span className="cart__count-badge">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Item List */}
      <ul className="cart__list scrollbar-thin">
        {items.length === 0 ? (
          <div className="cart__empty">
            <ShoppingCart size={40} strokeWidth={1} className="cart__empty-icon" />
            <p className="cart__empty-title">Cart is empty</p>
            <p className="cart__empty-hint">Tap a product to add it</p>
          </div>
        ) : (
          items.map((item) => (
            <li key={item.id} className="cart-item">
              <div className="cart-item__qty">{item.quantity}</div>
              <div className="cart-item__info">
                <p className="cart-item__name">{item.name}</p>
                <p className="cart-item__unit-price">{formatCurrency(item.price)} each</p>
              </div>
              <p className="cart-item__line-total">{formatCurrency(item.lineTotal)}</p>
            </li>
          ))
        )}
      </ul>

      {/* Totals */}
      <div className="cart__totals">
        <div className="cart__total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="cart__total-row">
          <span>VAT (12%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="cart__total-row cart__total-row--grand">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Charge Button */}
      <div className="cart__footer">
        <button
          className="cart__charge-btn no-select"
          disabled={items.length === 0}
        >
          {items.length === 0 ? 'No Items' : `Charge ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  )
}
