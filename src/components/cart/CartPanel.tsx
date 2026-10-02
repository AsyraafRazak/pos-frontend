import { useState } from 'react'
import {
  ShoppingCart,
  PauseCircle,
  PlayCircle,
  Tag,
  X,
  Utensils,
  ShoppingBag,
  Send,
  CreditCard,
  User,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { CartItem } from './CartItem'
import { useCartStore } from '@/stores/useCartStore'
import { useUIStore } from '@/stores/useUIStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { submitOrder } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import './CartPanel.css'

export function CartPanel() {
  const {
    items,
    subtotal,
    discountAmount,
    tax,
    total,
    discount,
    heldOrders,
    orderType,
    selectedTableId,
    selectedTableNumber,
    customerName,
    activeOrderId,
  } = useCartStore(
    useShallow((s) => ({
      items: s.items,
      subtotal: s.subtotal,
      discountAmount: s.discountAmount,
      tax: s.tax,
      total: s.total,
      discount: s.discount,
      heldOrders: s.heldOrders,
      orderType: s.orderType,
      selectedTableId: s.selectedTableId,
      selectedTableNumber: s.selectedTableNumber,
      customerName: s.customerName,
      activeOrderId: s.activeOrderId,
    })),
  )

  const setOrderType = useCartStore((s) => s.setOrderType)
  const setCustomerName = useCartStore((s) => s.setCustomerName)
  const clearCart = useCartStore((s) => s.clearCart)
  const holdOrder = useCartStore((s) => s.holdOrder)
  const applyDiscount = useCartStore((s) => s.applyDiscount)
  const removeDiscount = useCartStore((s) => s.removeDiscount)
  const openModal = useUIStore((s) => s.openModal)
  const session = useSessionStore((s) => s.session)

  const [discountOpen, setDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountInput, setDiscountInput] = useState('')
  const [isSendingToKitchen, setIsSendingToKitchen] = useState(false)
  const [showCustomerInput, setShowCustomerInput] = useState(false)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  function handleApplyDiscount() {
    const value = parseFloat(discountInput)
    if (!value || value <= 0) return
    applyDiscount({
      type: discountType,
      value,
      label: discountType === 'percentage' ? `${value}% off` : `RM${value} off`,
    })
    setDiscountOpen(false)
    setDiscountInput('')
  }

  function handleCancelDiscount() {
    setDiscountOpen(false)
    setDiscountInput('')
  }

  async function handleSendToKitchen() {
    if (items.length === 0 || isSendingToKitchen) return

    setIsSendingToKitchen(true)
    try {
      await submitOrder({
        tableId: selectedTableId,
        tableNumber: selectedTableNumber,
        type: orderType as any,
        status: 'Preparing',
        paymentStatus: 'Pending',
        subtotal,
        discountTotal: discountAmount,
        taxTotal: tax,
        grandTotal: total,
        customerName: customerName ?? (orderType === 'DineIn' ? `Table ${selectedTableNumber ?? 'Walk-in'}` : 'Takeaway'),
        cashierId: session?.cashierCode ?? 'cashier-1',
        cashierName: session?.cashierName ?? 'Cashier',
        shiftId: session?.shiftId,
        items: items.map((i) => ({
          productId: isNaN(Number(i.productId)) ? undefined : Number(i.productId),
          productName: i.name,
          unitPrice: i.price,
          quantity: i.quantity,
          discountAmount: 0,
          totalPrice: i.lineTotal,
          selectedModifiersJson: i.modifiers?.length ? JSON.stringify(i.modifiers) : undefined,
          notes: i.note,
        })),
      })

      clearCart()
    } catch (err: any) {
      alert(`Failed to send order to kitchen: ${err.message}`)
    } finally {
      setIsSendingToKitchen(false)
    }
  }

  return (
    <div className="cart">
      {/* Header */}
      <div className="cart__header">
        <div className="cart__header-left">
          <ShoppingCart size={15} />
          <span className="cart__title">{activeOrderId ? `Editing Bill #${activeOrderId}` : 'Current Order'}</span>
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

      {/* Dining Type & Table Selector Bar */}
      <div className="cart__dining-bar">
        <div className="cart__type-toggle">
          <button
            className={`cart__type-btn ${orderType === 'DineIn' ? 'active' : ''}`}
            onClick={() => setOrderType('DineIn')}
          >
            <Utensils size={12} />
            <span>Dine In</span>
          </button>
          <button
            className={`cart__type-btn ${orderType === 'Takeaway' ? 'active' : ''}`}
            onClick={() => setOrderType('Takeaway')}
          >
            <ShoppingBag size={12} />
            <span>Takeaway</span>
          </button>
        </div>

        {orderType === 'DineIn' ? (
          <button
            className={`cart__table-badge-btn ${selectedTableNumber ? 'has-table' : ''}`}
            onClick={() => openModal('tables')}
            title="Click to assign or change table"
          >
            <span>{selectedTableNumber ? `Table: ${selectedTableNumber}` : '+ Select Table'}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {showCustomerInput ? (
              <input
                className="form-input"
                style={{ padding: '3px 8px', fontSize: '11px', width: '110px' }}
                placeholder="Name / Note"
                value={customerName ?? ''}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={() => setShowCustomerInput(false)}
                autoFocus
              />
            ) : (
              <button
                className="cart__table-badge-btn"
                onClick={() => setShowCustomerInput(true)}
              >
                <User size={11} />
                <span>{customerName || '+ Name'}</span>
              </button>
            )}
          </div>
        )}
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
                  RM
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

      {/* Footer Dual Actions */}
      <div className="cart__footer">
        <div className="cart__footer-actions">
          <button
            className="cart__kitchen-btn no-select"
            disabled={items.length === 0 || isSendingToKitchen}
            onClick={handleSendToKitchen}
            title="Fire order directly to Kitchen (Pay later)"
          >
            <Send size={14} />
            <span>{isSendingToKitchen ? 'Sending...' : 'Kitchen (Tab)'}</span>
          </button>

          <button
            className="cart__charge-btn no-select"
            disabled={items.length === 0}
            onClick={() => openModal('payment')}
            title="Tender and settle payment immediately"
          >
            <CreditCard size={14} />
            <span>Pay  {formatCurrency(total)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
