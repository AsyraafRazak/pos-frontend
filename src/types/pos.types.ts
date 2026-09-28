// Shared TypeScript types/interfaces for the POS system

export interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
  hasModifiers?: boolean
  stock?: number
  barcode?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
}

export interface CartItemModifier {
  id: string
  name: string
  price: number
}

export interface ModifierGroup {
  id: string
  name: string
  multiSelect?: boolean
  required?: boolean
  options: CartItemModifier[]
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  modifiers?: CartItemModifier[]
  note?: string
  lineTotal: number
}

export interface Discount {
  type: 'percentage' | 'fixed'
  value: number
  label?: string
}

export interface Cart {
  items: CartItem[]
  discount?: Discount
  subtotal: number
  discountAmount: number
  tax: number
  total: number
}

export interface HeldOrder {
  id: string
  name: string
  items: CartItem[]
  discount?: Discount
  createdAt: Date
}

export type PaymentMethod = 'cash' | 'card' | 'ewallet'

export interface PaymentTender {
  method: PaymentMethod
  amount: number
  label: string
}

export interface CashierSession {
  id: string
  cashierName: string
  cashierCode: string
  terminalId: string
  openedAt: Date
  openingFloat: number
}

export type ConnectionStatus = 'online' | 'edge-only' | 'offline'

export interface CompletedOrder {
  id: string
  orderNumber: string
  cashierName: string
  terminalId: string
  items: CartItem[]
  subtotal: number
  discountAmount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  paymentLabel: string
  amountTendered: number
  change: number
  completedAt: Date
}
