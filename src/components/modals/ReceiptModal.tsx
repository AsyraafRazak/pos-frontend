import { X, Printer, ShoppingBag } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency } from '@/lib/utils'
import './ReceiptModal.css'

export function ReceiptModal() {
  const closeModal = useUIStore((s) => s.closeModal)
  const completedOrder = useUIStore((s) => s.completedOrder)
  const setCompletedOrder = useUIStore((s) => s.setCompletedOrder)

  if (!completedOrder) return null

  function handleNewSale() {
    setCompletedOrder(null)
    closeModal()
  }

  return (
    <div className="modal-overlay">
      <div className="modal receipt-modal">
        {/* Header */}
        <div className="modal__header">
          <p className="modal__title">Receipt</p>
          <button className="modal__close" onClick={handleNewSale}>
            <X size={16} />
          </button>
        </div>

        {/* Receipt body */}
        <div className="modal__body receipt-modal__body scrollbar-thin">
          {/* Store header */}
          <div className="receipt__store">
            <div className="receipt__store-logo">POS</div>
            <p className="receipt__store-name">CloudPOS</p>
            <p className="receipt__store-meta">
              {completedOrder.terminalId} &middot; {completedOrder.cashierName}
            </p>
          </div>

          <div className="receipt__divider" />

          {/* Order info */}
          <div className="receipt__meta-row">
            <span>Order #</span>
            <strong>{completedOrder.orderNumber}</strong>
          </div>
          <div className="receipt__meta-row">
            <span>Date / Time</span>
            <span>
              {completedOrder.completedAt.toLocaleString('en-MY', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div className="receipt__divider" />

          {/* Items */}
          <div className="receipt__items">
            {completedOrder.items.map((item) => (
              <div key={item.id} className="receipt__item">
                <div className="receipt__item-row">
                  <span className="receipt__item-qty">{item.quantity}×</span>
                  <span className="receipt__item-name">{item.name}</span>
                  <span className="receipt__item-total">{formatCurrency(item.lineTotal)}</span>
                </div>
                {item.modifiers && item.modifiers.length > 0 && (
                  <p className="receipt__item-mods">
                    {item.modifiers.map((m) => m.name).join(', ')}
                  </p>
                )}
                {item.note && (
                  <p className="receipt__item-note">&ldquo;{item.note}&rdquo;</p>
                )}
              </div>
            ))}
          </div>

          <div className="receipt__divider" />

          {/* Totals */}
          <div className="receipt__totals">
            <div className="receipt__total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(completedOrder.subtotal)}</span>
            </div>
            {completedOrder.discountAmount > 0 && (
              <div className="receipt__total-row receipt__total-row--discount">
                <span>Discount</span>
                <span>- {formatCurrency(completedOrder.discountAmount)}</span>
              </div>
            )}
            <div className="receipt__total-row">
              <span>VAT (12%)</span>
              <span>{formatCurrency(completedOrder.tax)}</span>
            </div>
            <div className="receipt__total-row receipt__total-row--grand">
              <span>TOTAL</span>
              <span>{formatCurrency(completedOrder.total)}</span>
            </div>
          </div>

          <div className="receipt__divider" />

          {/* Payment */}
          <div className="receipt__payment">
            <div className="receipt__total-row">
              <span>Payment</span>
              <span>{completedOrder.paymentLabel}</span>
            </div>
            <div className="receipt__total-row">
              <span>Tendered</span>
              <span>{formatCurrency(completedOrder.amountTendered)}</span>
            </div>
            {completedOrder.change > 0 && (
              <div className="receipt__total-row receipt__total-row--change">
                <span>Change</span>
                <span>{formatCurrency(completedOrder.change)}</span>
              </div>
            )}
          </div>

          <div className="receipt__divider" />
          <p className="receipt__thank-you">Thank you for your purchase! 🙏</p>
        </div>

        {/* Actions */}
        <div className="modal__footer">
          <button
            className="btn btn--secondary"
            onClick={() => console.log('Print receipt — connect to hardware in Phase 4')}
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button className="btn btn--primary btn--full" onClick={handleNewSale}>
            <ShoppingBag size={14} />
            <span>New Sale</span>
          </button>
        </div>
      </div>
    </div>
  )
}
