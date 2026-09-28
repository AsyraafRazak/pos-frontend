import { create } from 'zustand'
import type { Product, CompletedOrder } from '@/types/pos.types'

type ModalType = 'modifiers' | 'payment' | 'receipt' | 'held-orders' | null

interface UIState {
  activeModal: ModalType
  selectedProduct: Product | null
  completedOrder: CompletedOrder | null

  openModal: (modal: ModalType, product?: Product) => void
  closeModal: () => void
  setCompletedOrder: (order: CompletedOrder | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  selectedProduct: null,
  completedOrder: null,

  openModal: (modal, product) =>
    set({ activeModal: modal, selectedProduct: product ?? null }),

  closeModal: () =>
    set({ activeModal: null, selectedProduct: null }),

  setCompletedOrder: (completedOrder) =>
    set({ completedOrder }),
}))
