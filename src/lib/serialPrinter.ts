import type { CompletedOrder } from '@/types/pos.types'
import { buildReceiptEscPos, type ReceiptOptions } from './escpos'

// Web Serial API Interface Definitions (for TypeScript compatibility)
interface SerialPort {
  open(options: {
    baudRate: number
    dataBits?: number
    stopBits?: number
    parity?: 'none' | 'even' | 'odd'
    bufferSize?: number
    flowControl?: 'none' | 'hardware'
  }): Promise<void>
  close(): Promise<void>
  readable: ReadableStream | null
  writable: WritableStream | null
  getInfo(): { usbVendorId?: number; usbProductId?: number }
}

interface Serial {
  requestPort(options?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>
  getPorts(): Promise<SerialPort[]>
}

declare global {
  interface Navigator {
    serial?: Serial
  }
}

export interface PrintConfig {
  baudRate?: number
  receiptOptions?: ReceiptOptions
}

const DEFAULT_BAUD_RATE = 38400

/**
 * Checks if the Web Serial API is supported in this browser.
 */
export function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator && !!navigator.serial
}

/**
 * Connects to the Epson TM-T82II printer via Web Serial and prints the receipt.
 */
export async function printOrderReceipt(
  order: CompletedOrder,
  config: PrintConfig = {}
): Promise<{ success: boolean; message?: string }> {
  if (!isWebSerialSupported()) {
    return {
      success: false,
      message:
        'Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge on HTTPS / localhost.',
    }
  }

  const serial = navigator.serial!
  let port: SerialPort | null = null

  try {
    // 1. Check if user already authorized a port previously
    const existingPorts = await serial.getPorts()
    if (existingPorts.length > 0) {
      port = existingPorts[0]
    } else {
      // 2. Prompt user to select port (e.g. COM1)
      port = await serial.requestPort()
    }

    if (!port) {
      return { success: false, message: 'No serial port selected.' }
    }

    // 3. Open port with TM-T82II parameters
    const baudRate = config.baudRate || DEFAULT_BAUD_RATE
    await port.open({
      baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    })

    if (!port.writable) {
      await port.close()
      return { success: false, message: 'Serial port is not writable.' }
    }

    // 4. Generate 80mm ESC/POS binary data
    const escposData = buildReceiptEscPos(order, config.receiptOptions)

    // 5. Write binary data to printer stream
    const writer = port.writable.getWriter()
    try {
      await writer.write(escposData)
    } finally {
      writer.releaseLock()
    }

    // 6. Close port gracefully to release hardware lock
    await port.close()

    return { success: true }
  } catch (err: unknown) {
    console.error('Serial printing error:', err)

    // Clean up if port was left open
    if (port) {
      try {
        await port.close()
      } catch {
        // Ignore close errors if already closed
      }
    }

    const error = err as Error
    if (error.name === 'NotFoundError') {
      return { success: false, message: 'Printer selection was cancelled.' }
    }
    if (error.name === 'SecurityError') {
      return { success: false, message: 'Permission to access serial port was denied.' }
    }
    if (error.name === 'InvalidStateError') {
      return {
        success: false,
        message: 'Serial port is already in use by another program or process.',
      }
    }

    return {
      success: false,
      message: error.message || 'Failed to print receipt via serial port.',
    }
  }
}
