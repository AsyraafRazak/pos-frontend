import { useState } from 'react'
import { X, Printer, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { formatCurrency } from '@/lib/utils'
import { printOrderReceipt, isWebSerialSupported } from '@/lib/serialPrinter'
import './ReceiptModal.css'

export function ReceiptModal() {
  const closeModal = useUIStore((s) => s.closeModal)
  const completedOrder = useUIStore((s) => s.completedOrder)
  const setCompletedOrder = useUIStore((s) => s.setCompletedOrder)

  const [isPrinting, setIsPrinting] = useState(false)
  const [printStatus, setPrintStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  if (!completedOrder) return null

  function handleNewSale() {
    setCompletedOrder(null)
    closeModal()
  }

  async function handlePrint() {
    if (!completedOrder || isPrinting) return

    setPrintStatus(null)

    // Check if Web Serial is supported
    if (!isWebSerialSupported()) {
      // Fallback to standard browser print
      window.print()
      return
    }

    const orderToPrint = completedOrder
    setIsPrinting(true)
    try {
      const result = await printOrderReceipt(orderToPrint, {
        baudRate: 38400,
        receiptOptions: {
          storeName: 'CloudPOS',
          kickDrawerOnCash: orderToPrint.paymentMethod === 'cash',
        },
      })

      if (result.success) {
        setPrintStatus({
          type: 'success',
          message: 'Receipt sent to printer!',
        })
      } else {
        setPrintStatus({
          type: 'error',
          message: result.message || 'Could not print receipt.',
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      setPrintStatus({
        type: 'error',
        message: error.message || 'An unexpected error occurred while printing.',
      })
    } finally {
      setIsPrinting(false)
    }
  }

  function handleBrowserPrintFallback() {
    window.print()
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

        {/* Status banner if print attempted */}
        {printStatus && (
          <div
            className={`receipt__status-banner receipt__status-banner--${printStatus.type}`}
          >
            {printStatus.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <div className="receipt__status-content">
              <span>{printStatus.message}</span>
              {printStatus.type === 'error' && (
                <button
                  className="receipt__status-fallback-btn"
                  onClick={handleBrowserPrintFallback}
                >
                  Use Browser Print
                </button>
              )}
            </div>
          </div>
        )}

        {/* Receipt body */}
        <div className="modal__body receipt-modal__body scrollbar-thin print-area">
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
            {completedOrder.tax > 0 && (
              <div className="receipt__total-row">
                <span>VAT (12%)</span>
                <span>{formatCurrency(completedOrder.tax)}</span>
              </div>
            )}
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
            onClick={handlePrint}
            disabled={isPrinting}
            title={
              isWebSerialSupported()
                ? 'Print to Epson TM-T82II via Serial COM port'
                : 'Print using browser print dialog'
            }
          >
            {isPrinting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Printer size={14} />
            )}
            <span>{isPrinting ? 'Printing...' : 'Print (COM1)'}</span>
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
