import { useEffect } from 'react'
import './App.css'
import { Header } from '@/components/layout/Header'
import { POSWorkspace } from '@/components/layout/POSWorkspace'
import { CatalogPanel } from '@/components/catalog/CatalogPanel'
import { CartPanel } from '@/components/cart/CartPanel'
import { ModifierModal } from '@/components/modals/ModifierModal'
import { PaymentModal } from '@/components/modals/PaymentModal'
import { ReceiptModal } from '@/components/modals/ReceiptModal'
import { HeldOrdersModal } from '@/components/modals/HeldOrdersModal'
import { useUIStore } from '@/stores/useUIStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { syncManager } from '@/lib/syncManager'

export default function App() {
  const activeModal = useUIStore((s) => s.activeModal)
  const setConnectionStatus = useSessionStore((s) => s.setConnectionStatus)

  // Phase 2: Start the background sync manager for the lifetime of the app.
  // It actively checks the API status and flushes the IndexedDB orders outbox.
  useEffect(() => {
    syncManager.start()
    const unsub = syncManager.onStatusChange((status, pendingCount) => {
      setConnectionStatus(status, pendingCount)
    })
    return () => {
      unsub()
      syncManager.stop()
    }
  }, [setConnectionStatus])

  return (
    <div className="app">
      <Header />
      <POSWorkspace
        catalog={<CatalogPanel />}
        cart={<CartPanel />}
      />

      {/* Modal layer */}
      {activeModal === 'modifiers' && <ModifierModal />}
      {activeModal === 'payment' && <PaymentModal />}
      {activeModal === 'receipt' && <ReceiptModal />}
      {activeModal === 'held-orders' && <HeldOrdersModal />}
    </div>
  )
}
