import { type ReactNode } from 'react'
import './POSWorkspace.css'

interface POSWorkspaceProps {
  catalog: ReactNode
  cart: ReactNode
}

export function POSWorkspace({ catalog, cart }: POSWorkspaceProps) {
  return (
    <div className="pos-workspace">
      <main className="pos-workspace__catalog">{catalog}</main>
      <aside className="pos-workspace__cart">{cart}</aside>
    </div>
  )
}
