import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import type { KdsOrder, RestaurantTable } from '@/types/pos.types'

let connection: HubConnection | null = null

type OrderCallback = (order: KdsOrder) => void
type TableCallback = (table: RestaurantTable) => void

const orderCreatedListeners = new Set<OrderCallback>()
const orderFiredListeners = new Set<OrderCallback>()
const orderStatusListeners = new Set<OrderCallback>()
const orderPaidListeners = new Set<OrderCallback>()
const tableStatusListeners = new Set<TableCallback>()

export function getSignalRConnection(): HubConnection {
  if (connection) return connection

  const hubUrl = (import.meta.env.VITE_API_BASE ?? '') + '/hubs/pos'

  connection = new HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('OrderCreated', (order: KdsOrder) => {
    orderCreatedListeners.forEach((cb) => cb(order))
  })

  connection.on('OrderFiredToKitchen', (order: KdsOrder) => {
    orderFiredListeners.forEach((cb) => cb(order))
  })

  connection.on('OrderStatusChanged', (order: KdsOrder) => {
    orderStatusListeners.forEach((cb) => cb(order))
  })

  connection.on('OrderPaid', (order: KdsOrder) => {
    orderPaidListeners.forEach((cb) => cb(order))
  })

  connection.on('TableStatusChanged', (table: RestaurantTable) => {
    tableStatusListeners.forEach((cb) => cb(table))
  })

  return connection
}

export async function startSignalR(): Promise<void> {
  const conn = getSignalRConnection()
  if (conn.state === HubConnectionState.Disconnected) {
    try {
      await conn.start()
      console.log('[SignalR] Connected to POS Hub')
    } catch (err) {
      console.warn('[SignalR] Connection failed, will retry on event:', err)
    }
  }
}

export function onOrderFiredToKitchen(cb: OrderCallback): () => void {
  orderFiredListeners.add(cb)
  return () => orderFiredListeners.delete(cb)
}

export function onOrderStatusChanged(cb: OrderCallback): () => void {
  orderStatusListeners.add(cb)
  return () => orderStatusListeners.delete(cb)
}

export function onOrderPaid(cb: OrderCallback): () => void {
  orderPaidListeners.add(cb)
  return () => orderPaidListeners.delete(cb)
}

export function onTableStatusChanged(cb: TableCallback): () => void {
  tableStatusListeners.add(cb)
  return () => tableStatusListeners.delete(cb)
}

