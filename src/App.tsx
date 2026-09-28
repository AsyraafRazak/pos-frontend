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

export default function App() {
  const activeModal = useUIStore((s) => s.activeModal)

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
