/**
 * TypeScript mirrors of the backend DTOs (pos-backend).
 * Keep in sync with DTOs/CategoryDtos.cs, ProductDtos.cs, OrderDtos.cs, ShiftDtos.cs.
 */

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number
  name: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  productCount: number
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductDto {
  id: number
  name: string
  description?: string
  sku?: string
  barcode?: string
  price: number
  costPrice: number
  stockQuantity: number
  trackStock: boolean
  imageUrl?: string
  /** JSON-encoded ModifierGroup[] stored on the product */
  modifiersJson?: string
  isActive: boolean
  categoryId: number
  categoryName?: string
}

// ─── Table ────────────────────────────────────────────────────────────────────

export type ApiTableStatus = 'Available' | 'Occupied' | 'Reserved' | 'BillRequested'

export interface TableDto {
  id: number
  tableNumber: string
  zone: string
  capacity: number
  status: ApiTableStatus
  currentOrderId?: number
  currentOrderNumber?: string
  currentOrderTotal?: number
  currentOrderTime?: string
  currentOrderItemCount?: number
}

export interface CreateTableRequest {
  tableNumber: string
  zone: string
  capacity: number
}

export interface UpdateTableRequest {
  tableNumber: string
  zone: string
  capacity: number
  status: ApiTableStatus
}

export interface TransferTableRequest {
  targetTableId: number
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────

export interface CreateProductRequest {
  name: string
  description?: string
  sku?: string
  barcode?: string
  price: number
  costPrice: number
  stockQuantity: number
  trackStock: boolean
  imageUrl?: string
  modifiersJson?: string
  isActive: boolean
  categoryId: number
}

export interface UpdateProductRequest extends CreateProductRequest {}

// ─── Order ────────────────────────────────────────────────────────────────────

/** Matches backend Models/Payment.cs PaymentMethod enum (serialised as strings) */
export type ApiPaymentMethod = 'Cash' | 'Card' | 'EWallet' | 'Split' | 'Other'

/** Matches backend Models/Order.cs OrderType enum */
export type ApiOrderType = 'DineIn' | 'Takeaway' | 'Delivery'

/** Matches backend Models/Order.cs OrderStatus enum */
export type ApiOrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled' | 'Parked'

export type ApiPaymentStatus = 'Pending' | 'Completed' | 'Refunded' | 'Failed'

export interface CreateOrderItemRequest {
  productId?: number
  productName: string
  unitPrice: number
  quantity: number
  discountAmount: number
  totalPrice: number
  selectedModifiersJson?: string
  notes?: string
}

export interface CreatePaymentRequest {
  method: ApiPaymentMethod
  amountTendered: number
  changeGiven: number
  totalPaid: number
  transactionReference?: string
}

export interface CreateOrderRequest {
  orderNumber?: string
  tableId?: number
  tableNumber?: string
  type: ApiOrderType
  status?: ApiOrderStatus
  paymentStatus?: ApiPaymentStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  customerName?: string
  notes?: string
  cashierId: string
  cashierName: string
  shiftId?: number
  items: CreateOrderItemRequest[]
  payments?: CreatePaymentRequest[]
}

export interface PayOrderRequest {
  payments: CreatePaymentRequest[]
  notes?: string
}

export interface UpdateOrderStatusRequest {
  status: ApiOrderStatus
}

export interface OrderItemDto {
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

export interface PaymentDto {
  id: number
  method: ApiPaymentMethod
  amountTendered: number
  changeGiven: number
  totalPaid: number
  status: string
  transactionReference?: string
  createdAt: string
}

export interface OrderResponseDto {
  id: number
  orderNumber: string
  tableId?: number
  tableNumber?: string
  type: ApiOrderType
  status: ApiOrderStatus
  paymentStatus: ApiPaymentStatus
  subtotal: number
  discountTotal: number
  taxTotal: number
  grandTotal: number
  customerName?: string
  notes?: string
  cashierId: string
  cashierName: string
  shiftId?: number
  createdAt: string
  sentToKitchenAt?: string
  readyAt?: string
  completedAt?: string
  items: OrderItemDto[]
  payments: PaymentDto[]
}

// ─── Shift ────────────────────────────────────────────────────────────────────

export interface OpenShiftRequest {
  cashierId: string
  cashierName: string
  startingFloat: number
}

export interface CloseShiftRequest {
  actualCash: number
  closingNotes?: string
}

export interface ShiftResponseDto {
  id: number
  cashierId: string
  cashierName: string
  openedAt: string
  closedAt?: string
  startingFloat: number
  cashSales: number
  nonCashSales: number
  expectedCash: number
  actualCash?: number
  discrepancy?: number
  closingNotes?: string
  status: 'Open' | 'Closed'
  totalOrdersCount: number
}
