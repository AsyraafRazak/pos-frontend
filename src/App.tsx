import './App.css'
import { Header } from '@/components/layout/Header'
import { POSWorkspace } from '@/components/layout/POSWorkspace'
import { CatalogPanel } from '@/components/catalog/CatalogPanel'
import { CartPanel } from '@/components/cart/CartPanel'

export default function App() {
  return (
    <div className="app">
      <Header />
      <POSWorkspace
        catalog={<CatalogPanel />}
        cart={<CartPanel />}
      />
    </div>
  )
}
