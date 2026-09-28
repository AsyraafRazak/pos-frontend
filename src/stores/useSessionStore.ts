import { create } from 'zustand'
import type { CashierSession, ConnectionStatus } from '@/types/pos.types'

interface SessionState {
  session: CashierSession | null
  connectionStatus: ConnectionStatus
  currentTime: Date

  setSession: (session: CashierSession) => void
  clearSession: () => void
  setConnectionStatus: (status: ConnectionStatus) => void
  tickClock: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  // Default mock session for development — replace with real auth later
  session: {
    id: 'shift-001',
    cashierName: 'Admin',
    cashierCode: 'ADM',
    terminalId: 'POS-01',
    openedAt: new Date(),
    openingFloat: 1000,
  },
  connectionStatus: 'edge-only',
  currentTime: new Date(),

  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  tickClock: () => set({ currentTime: new Date() }),
}))
