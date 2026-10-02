/**
 * Thin API client for pos-backend.
 *
 * All paths are relative so Vite's dev-server proxy transparently forwards
 * them to http://localhost:5009. In production, set VITE_API_BASE to the
 * deployed backend URL.
 */

import type {
  CategoryDto,
  ProductDto,
  CreateOrderRequest,
  OrderResponseDto,
  OpenShiftRequest,
  CloseShiftRequest,
  ShiftResponseDto,
} from './api.types'

const BASE = (import.meta.env.VITE_API_BASE ?? '') + '/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  // 204 No Content — return undefined cast as T
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function fetchCategories(activeOnly = true): Promise<CategoryDto[]> {
  return request<CategoryDto[]>(`/categories?activeOnly=${activeOnly}`)
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function fetchProducts(params?: {
  categoryId?: number
  search?: string
  activeOnly?: boolean
}): Promise<ProductDto[]> {
  const qs = new URLSearchParams()
  if (params?.categoryId != null) qs.set('categoryId', String(params.categoryId))
  if (params?.search) qs.set('search', params.search)
  if (params?.activeOnly) qs.set('activeOnly', 'true')
  const q = qs.toString()
  return request<ProductDto[]>(`/products${q ? '?' + q : ''}`)
}

export function fetchProductByBarcode(barcode: string): Promise<ProductDto> {
  return request<ProductDto>(`/products/barcode/${encodeURIComponent(barcode)}`)
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function submitOrder(payload: CreateOrderRequest): Promise<OrderResponseDto> {
  return request<OrderResponseDto>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export function openShift(payload: OpenShiftRequest): Promise<ShiftResponseDto> {
  return request<ShiftResponseDto>('/shifts/open', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function closeShift(shiftId: number, payload: CloseShiftRequest): Promise<ShiftResponseDto> {
  return request<ShiftResponseDto>(`/shifts/${shiftId}/close`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchShift(shiftId: number): Promise<ShiftResponseDto> {
  return request<ShiftResponseDto>(`/shifts/${shiftId}`)
}

// ─── Health / Ping ────────────────────────────────────────────────────────────

export async function pingApi(timeoutMs = 2500): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // Add cache: 'no-store' and _t cache-buster so PWA Service Worker / HTTP cache won't serve a stale 200 OK
    const res = await fetch(`${BASE}/categories?activeOnly=true&_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) return false

    // Ensure it's genuine JSON from ASP.NET API, not an HTML error page or fallback
    const contentType = res.headers.get('content-type')
    return contentType !== null && contentType.includes('application/json')
  } catch {
    return false
  }
}

/** Check if the client has active WAN/Internet access (independent of local Edge server) */
export async function checkInternetAccess(timeoutMs = 2500): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // Fast 204 no-content probe with no-cors to test WAN connectivity
    await fetch('https://www.gstatic.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timer)
    return true
  } catch {
    return false
  }
}

