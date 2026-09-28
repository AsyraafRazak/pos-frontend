import { useState } from 'react'
import { ShoppingCart, PauseCircle, PlayCircle, Tag, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { CartItem } from './CartItem'
import { useCartStore } from '@/stores/useCartStore'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency } from '@/lib/utils'
import './CartPanel.css'

export function CartPanel() {
  const { items, subtotal, discountAmount, tax, total, discount, heldOrders } = useCartStore(
    useShallow((s) => ({
      items: s.items,
      subtotal: s.subtotal,
      discountAmount: s.discountAmount,
      tax: s.tax,
      total: s.total,
      discount: s.discount,
      heldOrders: s.heldOrders,
    })),
  )
  const holdOrder = useCartStore((s) => s.holdOrder)
  const applyDiscount = useCartStore((s) => s.applyDiscount)
  const removeDiscount = useCartStore((s) => s.removeDiscount)
  const openModal = useUIStore((s) => s.openModal)

  const [discountOpen, setDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountInput, setDiscountInput] = useState('')

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  function handleApplyDiscount() {
    const value = parseFloat(discountInput)
    if (!value || value <= 0) return
    applyDiscount({
      type: discountType,
      value,
      label: discountType === 'percentage' ? `${value}% off` : `₱${value} off`,
    })
    setDiscountOpen(false)
    setDiscountInput('')
  }

  function handleCancelDiscount() {
    setDiscountOpen(false)
    setDiscountInput('')
  }

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart__header">
        <div className="cart__header-left">
          <ShoppingCart size={15} />
          <span className="cart__title">Order</span>
          {itemCount > 0 && (
            <span className="cart__count-badge">{itemCount}</span>
          )}
        </div>

        <div className="cart__header-actions">
          {heldOrders.length > 0 && (
            <button
              className="cart__parked-btn no-select"
              onClick={() => openModal('held-orders')}
            >
              <PlayCircle size={13} />
              <span>Parked ({heldOrders.length})</span>
            </button>
          )}
          <button
            className="cart__hold-btn no-select"
            onClick={() => holdOrder()}
            disabled={items.length === 0}
            title="Hold current order"
          >
            <PauseCircle size={16} />
          </button>
        </div>
      </div>

      {/* Item list */}
      <ul className="cart__list scrollbar-thin">
        {items.length === 0 ? (
          <div className="cart__empty">
            <ShoppingCart size={36} strokeWidth={1} />
            <p className="cart__empty-title">Cart is empty</p>
            <p className="cart__empty-hint">Tap a product to add it</p>
          </div>
        ) : (
          items.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </ul>

      {/* Discount section — only when cart has items */}
      {items.length > 0 && (
        <div className="cart__discount-section">
          {discount ? (
            <div className="cart__active-discount">
              <Tag size={11} />
              <span>{discount.label}</span>
              <button className="cart__remove-discount-btn" onClick={removeDiscount}>
                <X size={11} />
              </button>
            </div>
          ) : discountOpen ? (
            <div className="cart__discount-form">
              <div className="cart__discount-type-toggle">
                <button
                  className={`cart__discount-type-btn ${discountType === 'percentage' ? 'active' : ''}`}
                  onClick={() => setDiscountType('percentage')}
                >
                  %
                </button>
                <button
                  className={`cart__discount-type-btn ${discountType === 'fixed' ? 'active' : ''}`}
                  onClick={() => setDiscountType('fixed')}
                >
                  ₱
                </button>
              </div>
              <input
                className="form-input cart__discount-input"
                type="number"
                placeholder={discountType === 'percentage' ? '0–100' : 'Amount'}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                autoFocus
              />
              <button className="btn btn--primary btn--sm" onClick={handleApplyDiscount}>
                Apply
              </button>
              <button className="btn btn--ghost btn--sm btn--icon" onClick={handleCancelDiscount}>
                <X size={12} />
              </button>
            </div>
          ) : (
            <button className="cart__add-discount-btn no-select" onClick={() => setDiscountOpen(true)}>
              <Tag size={12} />
              <span>Add Discount</span>
            </button>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="cart__totals">
        <div className="cart__total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="cart__total-row cart__total-row--discount">
            <span>Discount</span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="cart__total-row">
          <span>VAT (12%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="cart__total-row cart__total-row--grand">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Charge button */}
      <div className="cart__footer">
        <button
          className="cart__charge-btn no-select"
          disabled={items.length === 0}
          onClick={() => openModal('payment')}
        >
          {items.length === 0 ? 'No Items' : `Charge  ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  )
}
