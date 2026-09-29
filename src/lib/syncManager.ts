/**
 * Sync Manager — Phase 2: Outbox + Background Sync
 *
 * Responsibilities:
 *  1. Save completed orders into IndexedDB `ordersOutbox` (status = 'PENDING').
 *  2. Listen for `online` / `offline` browser events to update connection status.
 *  3. Periodically flush PENDING orders to the backend API when online.
 *  4. Idempotency: each record carries a `clientId` (UUID) sent to the backend
 *     so re-sending after a partial failure does NOT create duplicate orders.
 *
 * Usage:
 *   // In App.tsx (once on mount):
 *   import { syncManager } from '@/lib/syncManager'
 *   syncManager.start()
 *
 *   // In PaymentModal (on checkout):
 *   import { syncManager } from '@/lib/syncManager'
 *   await syncManager.enqueueOrder(clientId, orderNumber, payload)
 */

import { getDb } from './db'
import { submitOrder, pingApi } from './api'
import type { OutboxRecord, OutboxStatus } from './db'
import type { CreateOrderRequest } from './api.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'online' | 'offline' | 'syncing'

type SyncStatusListener = (status: SyncStatus, pendingCount: number) => void

// ─── Singleton Sync Manager ───────────────────────────────────────────────────

class SyncManager {
  private _status: SyncStatus = 'offline'
  private _listeners: Set<SyncStatusListener> = new Set()
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private _started = false

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  start() {
    if (this._started) return
    this._started = true

    window.addEventListener('online', this._handleOnline)
    window.addEventListener('offline', this._handleOffline)

    // Immediate initial API check + outbox flush
    void this.checkApiStatus()

    // Heartbeat every 10 seconds: probe the actual API server
    this._heartbeatTimer = setInterval(() => void this.checkApiStatus(), 10_000)
  }

  stop() {
    window.removeEventListener('online', this._handleOnline)
    window.removeEventListener('offline', this._handleOffline)
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer)
    this._started = false
  }

  // ─── Status ────────────────────────────────────────────────────────────────

  get status(): SyncStatus {
    return this._status
  }

  onStatusChange(listener: SyncStatusListener): () => void {
    this._listeners.add(listener)
    // Send current status immediately upon subscription
    listener(this._status, 0)
    return () => this._listeners.delete(listener)
  }

  private _emit(status: SyncStatus, pendingCount = 0) {
    this._status = status
    this._listeners.forEach((fn) => fn(status, pendingCount))
  }

  /** Actively pings the backend API to determine real online/offline status */
  async checkApiStatus(): Promise<boolean> {
    if (!navigator.onLine) {
      const pending = await this._countByStatus('PENDING')
      this._emit('offline', pending)
      return false
    }

    const isApiAlive = await pingApi(3000)
    const pending = await this._countByStatus('PENDING')

    if (isApiAlive) {
      this._emit('online', pending)
      // Flush outbox if there are pending orders
      if (pending > 0) {
        void this._flushOutbox()
      }
      return true
    } else {
      this._emit('offline', pending)
      return false
    }
  }

  // ─── Event handlers ────────────────────────────────────────────────────────

  private _handleOnline = () => {
    void this.checkApiStatus()
  }

  private _handleOffline = () => {
    void this.pendingCount().then((pending) => this._emit('offline', pending))
  }

  // ─── Outbox ────────────────────────────────────────────────────────────────

  /**
   * Enqueue a completed order into IndexedDB.
   * Call this immediately after the cashier completes a sale, regardless of
   * connectivity. The manager will submit it to the API when possible.
   */
  async enqueueOrder(
    clientId: string,
    orderNumber: string,
    payload: CreateOrderRequest,
  ): Promise<void> {
    const db = await getDb()
    const record: OutboxRecord = {
      clientId,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retries: 0,
      payload,
    }
    await db.put('ordersOutbox', record)

    // Try to flush immediately if online
    if (navigator.onLine) {
      void this._flushOutbox()
    } else {
      const pending = await this._countByStatus('PENDING')
      this._emit('offline', pending)
    }
  }

  /** Returns all records matching the given status. */
  async getOutboxRecords(status?: OutboxStatus): Promise<OutboxRecord[]> {
    const db = await getDb()
    if (status) {
      return db.getAllFromIndex('ordersOutbox', 'byStatus', status)
    }
    return db.getAll('ordersOutbox')
  }

  /** Count of orders still waiting to sync. */
  async pendingCount(): Promise<number> {
    return this._countByStatus('PENDING')
  }

  // ─── Flush ─────────────────────────────────────────────────────────────────

  private async _flushOutbox(): Promise<void> {
    if (!navigator.onLine) return

    const pending = await this.getOutboxRecords('PENDING')
    if (pending.length === 0) return

    this._emit('syncing', pending.length)

    for (const record of pending) {
      await this._syncRecord(record)
    }

    const remaining = await this._countByStatus('PENDING')
    this._emit(navigator.onLine ? 'online' : 'offline', remaining)
  }

  private async _syncRecord(record: OutboxRecord): Promise<void> {
    const db = await getDb()

    // Mark as in-progress
    await db.put('ordersOutbox', { ...record, status: 'SYNCING' })

    try {
      // The backend should treat the same orderNumber as idempotent
      await submitOrder(record.payload)

      // Success — mark synced
      await db.put('ordersOutbox', { ...record, status: 'SYNCED', lastError: undefined })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const retries = record.retries + 1

      // After 5 retries, mark as failed (manual intervention needed)
      const newStatus: OutboxStatus = retries >= 5 ? 'FAILED' : 'PENDING'

      await db.put('ordersOutbox', {
        ...record,
        status: newStatus,
        retries,
        lastError: msg,
      })

      console.warn(`[SyncManager] Order ${record.orderNumber} sync failed (attempt ${retries}): ${msg}`)
    }
  }

  private async _countByStatus(status: OutboxStatus): Promise<number> {
    const db = await getDb()
    return db.countFromIndex('ordersOutbox', 'byStatus', status)
  }
}

// Export a single shared instance
export const syncManager = new SyncManager()
