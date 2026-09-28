import { create } from 'zustand'
import type {
  Cart,
  CartItem,
  CartItemModifier,
  Discount,
  HeldOrder,
} from '@/types/pos.types'

let _heldOrderCounter = 1

interface CartState extends Cart {
  heldOrders: HeldOrder[]

  // Cart actions
  addItem: (item: Omit<CartItem, 'lineTotal'>) => void
  removeItem: (cartItemId: string) => void
  incrementItem: (cartItemId: string) => void
  decrementItem: (cartItemId: string) => void
  updateNote: (cartItemId: string, note: string) => void
  updateModifiers: (cartItemId: string, modifiers: CartItemModifier[]) => void
  applyDiscount: (discount: Discount) => void
  removeDiscount: () => void
  clearCart: () => void

  // Hold / Resume
  holdOrder: (name?: string) => void
  resumeOrder: (heldOrderId: string) => void
  deleteHeldOrder: (heldOrderId: string) => void
}

const TAX_RATE = 0.12 // 12% VAT — adjust per locale

function calcLineTotal(price: number, quantity: number, modifiers: CartItemModifier[] = []) {
  const modTotal = modifiers.reduce((s, m) => s + m.price, 0)
  return (price + modTotal) * quantity
}

function recalcTotals(items: CartItem[], discount?: Discount) {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
  let discountAmount = 0
  if (discount) {
    discountAmount =
      discount.type === 'percentage'
        ? subtotal * (discount.value / 100)
        : Math.min(discount.value, subtotal)
  }
  const taxable = subtotal - discountAmount
  const tax = parseFloat((taxable * TAX_RATE).toFixed(2))
  const total = parseFloat((taxable + tax).toFixed(2))
  return { subtotal, discountAmount, tax, total }
}

const emptyCart: Pick<Cart, 'items' | 'subtotal' | 'discountAmount' | 'tax' | 'total'> = {
  items: [],
  subtotal: 0,
  discountAmount: 0,
  tax: 0,
  total: 0,
}

export const useCartStore = create<CartState>((set, get) => ({
  ...emptyCart,
  heldOrders: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId && !item.modifiers?.length)
      let items: CartItem[]
      if (existing) {
        items = state.items.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + 1, lineTotal: calcLineTotal(i.price, i.quantity + 1, i.modifiers) }
            : i
        )
      } else {
        const newItem: CartItem = {
          ...item,
          lineTotal: calcLineTotal(item.price, item.quantity, item.modifiers),
        }
        items = [...state.items, newItem]
      }
      return { items, ...recalcTotals(items, state.discount) }
    }),

  removeItem: (cartItemId) =>
    set((state) => {
      const items = state.items.filter((i) => i.id !== cartItemId)
      return { items, ...recalcTotals(items, state.discount) }
    }),

  incrementItem: (cartItemId) =>
    set((state) => {
      const items = state.items.map((i) =>
        i.id === cartItemId
          ? { ...i, quantity: i.quantity + 1, lineTotal: calcLineTotal(i.price, i.quantity + 1, i.modifiers) }
          : i
      )
      return { items, ...recalcTotals(items, state.discount) }
    }),

  decrementItem: (cartItemId) =>
    set((state) => {
      const items = state.items
        .map((i) =>
          i.id === cartItemId
            ? { ...i, quantity: i.quantity - 1, lineTotal: calcLineTotal(i.price, i.quantity - 1, i.modifiers) }
            : i
        )
        .filter((i) => i.quantity > 0)
      return { items, ...recalcTotals(items, state.discount) }
    }),

  updateNote: (cartItemId, note) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === cartItemId ? { ...i, note } : i)),
    })),

  updateModifiers: (cartItemId, modifiers) =>
    set((state) => {
      const items = state.items.map((i) =>
        i.id === cartItemId
          ? { ...i, modifiers, lineTotal: calcLineTotal(i.price, i.quantity, modifiers) }
          : i
      )
      return { items, ...recalcTotals(items, state.discount) }
    }),

  applyDiscount: (discount) =>
    set((state) => ({ discount, ...recalcTotals(state.items, discount) })),

  removeDiscount: () =>
    set((state) => ({ discount: undefined, ...recalcTotals(state.items) })),

  clearCart: () =>
    set({ ...emptyCart, discount: undefined }),

  holdOrder: (name) => {
    const state = get()
    if (!state.items.length) return
    const held: HeldOrder = {
      id: crypto.randomUUID(),
      name: name ?? `Order #${_heldOrderCounter++}`,
      items: state.items,
      discount: state.discount,
      createdAt: new Date(),
    }
    set((s) => ({ heldOrders: [...s.heldOrders, held], ...emptyCart, discount: undefined }))
  },

  resumeOrder: (heldOrderId) =>
    set((state) => {
      const order = state.heldOrders.find((o) => o.id === heldOrderId)
      if (!order) return state
      const heldOrders = state.heldOrders.filter((o) => o.id !== heldOrderId)
      return {
        items: order.items,
        discount: order.discount,
        heldOrders,
        ...recalcTotals(order.items, order.discount),
      }
    }),

  deleteHeldOrder: (heldOrderId) =>
    set((state) => ({ heldOrders: state.heldOrders.filter((o) => o.id !== heldOrderId) })),
}))
