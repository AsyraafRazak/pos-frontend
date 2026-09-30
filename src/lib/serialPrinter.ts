import type { CompletedOrder } from '@/types/pos.types'
import { buildReceiptEscPos, buildCashDrawerEscPos, type ReceiptOptions } from './escpos'

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
 * Obtains an authorized serial port (or requests user permission).
 */
async function getOrRequestPort(): Promise<SerialPort | null> {
  if (!isWebSerialSupported()) return null
  const serial = navigator.serial!

  const existingPorts = await serial.getPorts()
  if (existingPorts.length > 0) {
    return existingPorts[0]
  }
  return await serial.requestPort()
}

/**
 * Sends a raw ESC/POS binary buffer to the serial printer.
 */
async function sendRawBytesToPrinter(
  bytes: Uint8Array,
  baudRate = DEFAULT_BAUD_RATE
): Promise<{ success: boolean; message?: string }> {
  let port: SerialPort | null = null

  try {
    port = await getOrRequestPort()
    if (!port) {
      return { success: false, message: 'No serial port selected.' }
    }

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

    const writer = port.writable.getWriter()
    try {
      await writer.write(bytes)
    } finally {
      writer.releaseLock()
    }

    // Allow hardware UART buffer to finish transmitting final cut bytes over serial cable
    await new Promise((resolve) => setTimeout(resolve, 350))

    await port.close()
    return { success: true }
  } catch (err: unknown) {
    console.error('Serial communication error:', err)

    if (port) {
      try {
        await port.close()
      } catch {
        // Ignore close error
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
      message: error.message || 'Failed to communicate with printer via serial port.',
    }
  }
}

/**
 * Connects to the Epson TM-T82II printer via Web Serial and prints the receipt (with auto-cut).
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

  const escposData = buildReceiptEscPos(order, config.receiptOptions)
  return await sendRawBytesToPrinter(escposData, config.baudRate || DEFAULT_BAUD_RATE)
}

/**
 * Pulses the cash drawer solenoid to pop it open standalone without printing a full receipt.
 */
export async function openCashDrawerViaSerial(
  baudRate = DEFAULT_BAUD_RATE
): Promise<{ success: boolean; message?: string }> {
  if (!isWebSerialSupported()) {
    return {
      success: false,
      message: 'Web Serial API is not supported in this browser.',
    }
  }

  const drawerCommand = buildCashDrawerEscPos()
  return await sendRawBytesToPrinter(drawerCommand, baudRate)
}
