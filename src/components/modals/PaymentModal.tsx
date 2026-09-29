import { useState, useRef } from 'react'
import { X, Banknote, CreditCard, Wallet, Delete } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useUIStore } from '@/stores/useUIStore'
import { useCartStore } from '@/stores/useCartStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { submitOrder } from '@/lib/api'
import { adaptCartItemToRequest, adaptPaymentToRequest } from '@/lib/adapters'
import { formatCurrency } from '@/lib/utils'
import type { PaymentMethod, CompletedOrder } from '@/types/pos.types'
import './PaymentModal.css'

type MethodConfig = { id: PaymentMethod; label: string; icon: React.ReactNode }

const METHODS: MethodConfig[] = [
  { id: 'cash', label: 'Cash', icon: <Banknote size={15} /> },
  { id: 'card', label: 'Card', icon: <CreditCard size={15} /> },
  { id: 'ewallet', label: 'E-Wallet / QR', icon: <Wallet size={15} /> },
]

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0', '⌫']
const QUICK_AMOUNTS = [50, 100, 200, 500]

export function PaymentModal() {
  const closeModal = useUIStore((s) => s.closeModal)
  const openModal = useUIStore((s) => s.openModal)
  const setCompletedOrder = useUIStore((s) => s.setCompletedOrder)

  const { items, subtotal, discountAmount, tax, total, discount } = useCartStore(
    useShallow((s) => ({
      items: s.items,
      subtotal: s.subtotal,
      discountAmount: s.discountAmount,
      tax: s.tax,
      total: s.total,
      discount: s.discount,
    })),
  )
  const clearCart = useCartStore((s) => s.clearCart)
  const session = useSessionStore((s) => s.session)

  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [tenderStr, setTenderStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Stable order number for this payment session
  const orderNumRef = useRef(`ORD-${Date.now().toString().slice(-6)}`)

  const tendered = parseFloat(tenderStr || '0')
  const change = Math.max(0, tendered - total)
  const canComplete = !submitting && (method !== 'cash' || tendered >= total)

  function handleNumpad(key: string) {
    if (key === '⌫') {
      setTenderStr((p) => p.slice(0, -1))
    } else if (key === '00') {
      setTenderStr((p) => (p.length > 0 ? (p + '00').slice(0, 7) : p))
    } else {
      setTenderStr((p) => (p + key).slice(0, 7))
    }
  }

  function handleQuick(amt: number | 'exact') {
    if (amt === 'exact') {
      setTenderStr(Math.ceil(total).toString())
    } else {
      setTenderStr((Math.ceil(tendered) + amt).toString())
    }
  }

  async function handleComplete() {
    setSubmitting(true)

    const amountTendered = method === 'cash' ? tendered : total
    const changeGiven = method === 'cash' ? change : 0

    // 1. Show receipt immediately (optimistic UX — cashier flow never blocks)
    const completed: CompletedOrder = {
      id: crypto.randomUUID(),
      orderNumber: orderNumRef.current,
      cashierName: session?.cashierName ?? 'Unknown',
      terminalId: session?.terminalId ?? 'POS-01',
      items: [...items],
      subtotal,
      discountAmount,
      tax,
      total,
      paymentMethod: method,
      paymentLabel: METHODS.find((m) => m.id === method)?.label ?? method,
      amountTendered,
      change: changeGiven,
      completedAt: new Date(),
    }
    setCompletedOrder(completed)
    clearCart()
    openModal('receipt')

    // 2. Persist to backend in the background
    submitOrder({
      orderNumber: orderNumRef.current,
      type: 'Takeaway',
      subtotal,
      discountTotal: discountAmount,
      taxTotal: tax,
      grandTotal: total,
      cashierId: session?.id ?? 'cashier-1',
      cashierName: session?.cashierName ?? 'Cashier',
      shiftId: session?.shiftId,
      items: items.map(adaptCartItemToRequest),
      payments: [adaptPaymentToRequest(method, total, amountTendered, changeGiven)],
    }).catch((err: unknown) => {
      // Non-blocking: log to console; in production you could queue for retry
      console.error('[POS] Failed to persist order to backend:', err)
    }).finally(() => {
      setSubmitting(false)
    })
  }

  const isCash = method === 'cash'

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <p className="modal__title">Payment</p>
          <button className="modal__close" onClick={closeModal}>
            <X size={16} />
          </button>
        </div>

        {/* Order Summary */}
        <div className="payment-modal__summary">
          <div className="payment-modal__summary-row">
            <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="payment-modal__summary-row payment-modal__summary-row--discount">
              <span>Discount {discount?.label ? `(${discount.label})` : ''}</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="payment-modal__summary-row">
            <span>VAT 12%</span><span>{formatCurrency(tax)}</span>
          </div>
          <div className="payment-modal__summary-row payment-modal__summary-row--total">
            <span>TOTAL</span><span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Method Tabs */}
        <div className="payment-modal__tabs">
          {METHODS.map((m) => (
            <button
              key={m.id}
              className={`payment-modal__tab no-select ${method === m.id ? 'payment-modal__tab--active' : ''}`}
              onClick={() => { setMethod(m.id); setTenderStr('') }}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Cash Numpad */}
        {isCash ? (
          <div className="payment-modal__body">
            {/* Amount display */}
            <div className="payment-modal__amount-display">
              <div className="payment-modal__amount-col">
                <span className="payment-modal__amount-label">Tendered</span>
                <span className="payment-modal__amount-value">
                  RM {tendered.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {tendered >= total && (
                <div className="payment-modal__amount-col">
                  <span className="payment-modal__amount-label">Change</span>
                  <span className="payment-modal__change-value">
                    RM {change.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Quick amount buttons */}
            <div className="payment-modal__quick-amounts">
              <button className="payment-modal__quick-btn no-select" onClick={() => handleQuick('exact')}>
                Exact
              </button>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  className="payment-modal__quick-btn no-select"
                  onClick={() => handleQuick(amt)}
                >
                  +{amt}
                </button>
              ))}
            </div>

            {/* Numpad */}
            <div className="payment-modal__numpad">
              {NUMPAD_KEYS.map((key) => (
                <button
                  key={key}
                  className={`payment-modal__numpad-key no-select ${key === '⌫' ? 'payment-modal__numpad-key--delete' : ''}`}
                  onClick={() => handleNumpad(key)}
                >
                  {key === '⌫' ? <Delete size={16} /> : key}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="payment-modal__body payment-modal__body--card">
            <div className="payment-modal__card-notice">
              {method === 'card' ? (
                <CreditCard size={40} strokeWidth={1} />
              ) : (
                <Wallet size={40} strokeWidth={1} />
              )}
              <p className="payment-modal__card-amount">{formatCurrency(total)}</p>
              <p className="payment-modal__card-hint">
                {method === 'card'
                  ? 'Process card on your payment terminal, then confirm below.'
                  : 'Have the customer scan the QR code, then confirm below.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={closeModal}>Cancel</button>
          <button
            className="btn btn--success btn--full btn--lg"
            disabled={!canComplete}
            onClick={handleComplete}
          >
            {submitting ? 'Saving…' : `Complete Sale · ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
