import { useEffect, useState } from 'react'
import './App.css'
import { Header } from '@/components/layout/Header'
import { POSWorkspace } from '@/components/layout/POSWorkspace'
import { UpdatePrompt } from '@/components/layout/UpdatePrompt'
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

  // PWA update state — set when the service worker signals a new version is cached
  const [updateReady, setUpdateReady] = useState(false)
  const [swUpdate, setSwUpdate] = useState<((reload?: boolean) => Promise<void>) | null>(null)

  // Listen for the custom event dispatched by main.tsx when SW has a new version
  useEffect(() => {
    const handler = (e: Event) => {
      const { updateSW } = (e as CustomEvent).detail
      setSwUpdate(() => updateSW)
      setUpdateReady(true)
    }
    window.addEventListener('pwa-update-available', handler)
    return () => window.removeEventListener('pwa-update-available', handler)
  }, [])

  const handleUpdate = () => {
    swUpdate?.(true) // pass true to reload after SW activation
    setUpdateReady(false)
  }

  const handleDismiss = () => setUpdateReady(false)

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
      {updateReady && (
        <UpdatePrompt onUpdate={handleUpdate} onDismiss={handleDismiss} />
      )}
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
