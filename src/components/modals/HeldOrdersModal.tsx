import { X, PlayCircle, Trash2, Clock } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { useCartStore } from '@/stores/useCartStore'
import { formatCurrency } from '@/lib/utils'
import './HeldOrdersModal.css'

export function HeldOrdersModal() {
  const closeModal = useUIStore((s) => s.closeModal)
  const heldOrders = useCartStore((s) => s.heldOrders)
  const resumeOrder = useCartStore((s) => s.resumeOrder)
  const deleteHeldOrder = useCartStore((s) => s.deleteHeldOrder)

  function handleResume(id: string) {
    resumeOrder(id)
    closeModal()
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal held-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <p className="modal__title">
            Parked Orders
            {heldOrders.length > 0 && (
              <span className="held-modal__count">{heldOrders.length}</span>
            )}
          </p>
          <button className="modal__close" onClick={closeModal}>
            <X size={16} />
          </button>
        </div>

        <div className="modal__body">
          {heldOrders.length === 0 ? (
            <div className="held-modal__empty">
              <Clock size={36} strokeWidth={1} />
              <p>No parked orders</p>
            </div>
          ) : (
            <div className="held-modal__list">
              {heldOrders.map((order) => {
                const count = order.items.reduce((s, i) => s + i.quantity, 0)
                const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0)
                return (
                  <div key={order.id} className="held-order-card">
                    <div className="held-order-card__info">
                      <p className="held-order-card__name">{order.name}</p>
                      <p className="held-order-card__meta">
                        {count} item{count !== 1 ? 's' : ''} &middot; {formatCurrency(subtotal)}
                      </p>
                      <p className="held-order-card__time">
                        Parked at{' '}
                        {order.createdAt.toLocaleTimeString('en-MY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="held-order-card__actions">
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleResume(order.id)}
                      >
                        <PlayCircle size={13} />
                        Resume
                      </button>
                      <button
                        className="btn btn--danger btn--sm btn--icon"
                        onClick={() => deleteHeldOrder(order.id)}
                        title="Delete parked order"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
