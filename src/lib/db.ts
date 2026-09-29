/**
 * IndexedDB schema — Phase 2: Offline-First Client Storage
 *
 * Uses the `idb` library (already installed) to define the client-side database.
 * Tables:
 *   - products      : Cached product catalog from the backend (or seed data).
 *   - categories    : Cached category list.
 *   - ordersOutbox  : Completed orders queued for sync to the backend.
 *   - settings      : Arbitrary key-value store (e.g. lastSyncedAt).
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ProductDto, CategoryDto, CreateOrderRequest } from './api.types'

// ─── Outbox record ────────────────────────────────────────────────────────────

export type OutboxStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'

export interface OutboxRecord {
  /** Client-generated UUID — also used as idempotency key on the backend */
  clientId: string
  createdAt: string          // ISO timestamp from the client clock
  orderNumber: string
  status: OutboxStatus
  retries: number
  lastError?: string
  payload: CreateOrderRequest
}

// ─── DB Schema ────────────────────────────────────────────────────────────────

interface PosDB extends DBSchema {
  products: {
    key: number
    value: ProductDto
    indexes: {
      byCategory: number
      byBarcode: string
    }
  }
  categories: {
    key: number
    value: CategoryDto
  }
  ordersOutbox: {
    key: string           // clientId
    value: OutboxRecord
    indexes: { byStatus: OutboxStatus }
  }
  settings: {
    key: string
    value: { key: string; value: string }
  }
}

// ─── Singleton DB promise ─────────────────────────────────────────────────────

let _db: IDBPDatabase<PosDB> | null = null

export async function getDb(): Promise<IDBPDatabase<PosDB>> {
  if (_db) return _db
  _db = await openDB<PosDB>('pos-client-db', 1, {
    upgrade(db) {
      // products
      const productStore = db.createObjectStore('products', { keyPath: 'id' })
      productStore.createIndex('byCategory', 'categoryId')
      productStore.createIndex('byBarcode', 'barcode')

      // categories
      db.createObjectStore('categories', { keyPath: 'id' })

      // ordersOutbox
      const outboxStore = db.createObjectStore('ordersOutbox', { keyPath: 'clientId' })
      outboxStore.createIndex('byStatus', 'status')

      // settings
      db.createObjectStore('settings', { keyPath: 'key' })
    },
  })
  return _db
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb()
  const row = await db.get('settings', key)
  return row?.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.put('settings', { key, value })
}
