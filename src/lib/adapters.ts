/**
 * Adapters — convert backend DTOs to frontend model shapes and vice-versa.
 *
 * Frontend types  →  src/types/pos.types.ts
 * Backend DTO types →  src/lib/api.types.ts
 */

import type {
  CategoryDto,
  ProductDto,
  CreateOrderItemRequest,
  CreatePaymentRequest,
  ApiPaymentMethod,
} from './api.types'
import type { Category, Product, CartItem, ModifierGroup } from '@/types/pos.types'

// ─── Backend → Frontend ───────────────────────────────────────────────────────

export function adaptCategory(dto: CategoryDto): Category {
  return {
    id: String(dto.id),
    name: dto.name,
    icon: dto.icon ?? undefined,
  }
}

export function adaptProduct(dto: ProductDto): Product {
  let modifierGroups: ModifierGroup[] | undefined
  if (dto.modifiersJson) {
    try {
      modifierGroups = JSON.parse(dto.modifiersJson) as ModifierGroup[]
    } catch {
      modifierGroups = undefined
    }
  }

  return {
    id: String(dto.id),
    name: dto.name,
    price: dto.price,
    category: dto.categoryName ?? '',
    image: dto.imageUrl ?? undefined,
    hasModifiers: !!modifierGroups?.length,
    modifierGroups,
    stock: dto.stockQuantity,
    barcode: dto.barcode ?? undefined,
  }
}

// ─── Frontend → Backend ───────────────────────────────────────────────────────

/** Map frontend PaymentMethod string to the backend enum string value */
const PAYMENT_METHOD_MAP: Record<string, ApiPaymentMethod> = {
  cash: 'Cash',
  card: 'Card',
  ewallet: 'EWallet',
}

export function adaptPaymentMethod(method: string): ApiPaymentMethod {
  return PAYMENT_METHOD_MAP[method] ?? 'Cash'
}

export function adaptCartItemToRequest(item: CartItem): CreateOrderItemRequest {
  return {
    productId: /^\d+$/.test(item.productId) ? Number(item.productId) : undefined,
    productName: item.name,
    unitPrice: item.price,
    quantity: item.quantity,
    discountAmount: 0,
    totalPrice: item.lineTotal,
    selectedModifiersJson:
      item.modifiers && item.modifiers.length > 0
        ? JSON.stringify(item.modifiers)
        : undefined,
    notes: item.note ?? undefined,
  }
}

export function adaptPaymentToRequest(
  method: string,
  total: number,
  amountTendered: number,
  change: number,
): CreatePaymentRequest {
  return {
    method: adaptPaymentMethod(method),
    amountTendered,
    changeGiven: change,
    totalPaid: total,
  }
}
