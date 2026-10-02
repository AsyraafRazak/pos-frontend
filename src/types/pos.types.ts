// Shared TypeScript types/interfaces for the POS system

export interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
  hasModifiers?: boolean
  /** Parsed modifier groups from the API (modifiersJson). Replaces the static PRODUCT_MODIFIERS lookup. */
  modifierGroups?: ModifierGroup[]
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
  /** Real shift ID from the backend (int). Undefined until the shift is opened via API. */
  shiftId?: number
}

export type ConnectionStatus = 'online' | 'edge-only' | 'offline' | 'syncing'

export type OrderType = 'DineIn' | 'Takeaway' | 'Delivery'
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled' | 'Parked'
export type PaymentStatus = 'Pending' | 'Completed' | 'Refunded' | 'Failed'
export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'BillRequested'

export interface RestaurantTable {
  id: number
  tableNumber: string
  zone: string
  capacity: number
  status: TableStatus
  currentOrderId?: number
  currentOrderNumber?: string
  currentOrderTotal?: number
  currentOrderTime?: string
  currentOrderItemCount?: number
}

export interface KdsOrderItem {
  id: number
  productId?: number
  productName: string
  unitPrice: number
  quantity: number
  discountAmount: number
  totalPrice: number
  selectedModifiersJson?: string
  notes?: string
}

export interface KdsOrder {
  id: number
  orderNumber: string
  tableId?: number
  tableNumber?: string
  type: OrderType
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  customerName?: string
  notes?: string
  cashierName: string
  createdAt: string
  sentToKitchenAt?: string
  readyAt?: string
  completedAt?: string
  items: KdsOrderItem[]
}

export interface CompletedOrder {
  id: string
  orderNumber: string
  cashierName: string
  terminalId: string
  tableNumber?: string
  orderType: OrderType
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
