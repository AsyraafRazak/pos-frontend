import type { CompletedOrder } from '@/types/pos.types'
import { formatCurrency } from '@/lib/utils'

// ESC/POS Command Byte Constants
const ESC = 0x1b
const GS = 0x1d

const CMD = {
  INIT: [ESC, 0x40], // ESC @ - Initialize printer
  ALIGN_LEFT: [ESC, 0x61, 0x00], // ESC a 0
  ALIGN_CENTER: [ESC, 0x61, 0x01], // ESC a 1
  ALIGN_RIGHT: [ESC, 0x61, 0x02], // ESC a 2
  BOLD_ON: [ESC, 0x45, 0x01], // ESC E 1
  BOLD_OFF: [ESC, 0x45, 0x00], // ESC E 0
  SIZE_NORMAL: [GS, 0x21, 0x00], // GS ! 0
  SIZE_DOUBLE_HEIGHT: [GS, 0x21, 0x01],
  SIZE_DOUBLE_WIDTH: [GS, 0x21, 0x10],
  SIZE_DOUBLE: [GS, 0x21, 0x11], // GS ! 0x11 (2x width & 2x height)
  CUT_PARTIAL: [GS, 0x56, 0x42, 0x03], // GS V 'B' 3 - Feed 3 lines & cut
  PULSE_CASH_DRAWER: [ESC, 0x70, 0x00, 0x19, 0xfa], // ESC p 0 25 250 - Kick drawer (pin 2)
}

/** Total printable columns for standard 80mm thermal paper with Font A */
const COLS_80MM = 48

class EscPosBuilder {
  private buffer: number[] = []
  private encoder = new TextEncoder()

  constructor() {
    this.add(CMD.INIT)
  }

  add(bytes: number[]): this {
    this.buffer.push(...bytes)
    return this
  }

  text(str: string): this {
    const encoded = this.encoder.encode(str)
    for (let i = 0; i < encoded.length; i++) {
      this.buffer.push(encoded[i])
    }
    return this
  }

  line(str = ''): this {
    this.text(str + '\n')
    return this
  }

  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a) // LF
    }
    return this
  }

  align(alignment: 'left' | 'center' | 'right'): this {
    if (alignment === 'center') this.add(CMD.ALIGN_CENTER)
    else if (alignment === 'right') this.add(CMD.ALIGN_RIGHT)
    else this.add(CMD.ALIGN_LEFT)
    return this
  }

  bold(enable = true): this {
    this.add(enable ? CMD.BOLD_ON : CMD.BOLD_OFF)
    return this
  }

  size(type: 'normal' | 'double-height' | 'double-width' | 'double'): this {
    if (type === 'double') this.add(CMD.SIZE_DOUBLE)
    else if (type === 'double-height') this.add(CMD.SIZE_DOUBLE_HEIGHT)
    else if (type === 'double-width') this.add(CMD.SIZE_DOUBLE_WIDTH)
    else this.add(CMD.SIZE_NORMAL)
    return this
  }

  divider(char = '-', width = COLS_80MM): this {
    this.align('left').line(char.repeat(width))
    return this
  }

  twoColumns(left: string, right: string, width = COLS_80MM): this {
    const spaceCount = width - left.length - right.length
    if (spaceCount <= 0) {
      // If text overflows, wrap or truncate left column
      const maxLeft = width - right.length - 1
      const truncatedLeft = left.substring(0, maxLeft)
      this.line(truncatedLeft + ' ' + right)
    } else {
      this.line(left + ' '.repeat(spaceCount) + right)
    }
    return this
  }

  cut(): this {
    this.add(CMD.CUT_PARTIAL)
    return this
  }

  kickDrawer(): this {
    this.add(CMD.PULSE_CASH_DRAWER)
    return this
  }

  build(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}

export interface ReceiptOptions {
  storeName?: string
  storeAddress?: string
  storePhone?: string
  footerNote?: string
  kickDrawerOnCash?: boolean
}

/**
 * Builds an 80mm ESC/POS binary payload for the Epson TM-T82II printer.
 */
export function buildReceiptEscPos(
  order: CompletedOrder,
  options: ReceiptOptions = {}
): Uint8Array {
  const storeName = options.storeName || 'CloudPOS'
  const storeAddress = options.storeAddress
  const storePhone = options.storePhone
  const footerNote = options.footerNote || 'Thank you for your purchase!'
  const kickDrawer = options.kickDrawerOnCash ?? (order.paymentMethod === 'cash')

  const builder = new EscPosBuilder()

  // 1. Kick cash drawer if applicable
  if (kickDrawer) {
    builder.kickDrawer()
  }

  // 2. Store Header
  builder
    .align('center')
    .size('double')
    .bold(true)
    .line(storeName)
    .size('normal')
    .bold(false)

  if (storeAddress) builder.line(storeAddress)
  if (storePhone) builder.line(`Tel: ${storePhone}`)

  builder
    .line(`${order.terminalId || 'POS-01'} · Cashier: ${order.cashierName || 'Staff'}`)
    .divider('=')

  // 3. Order Info
  builder
    .align('left')
    .twoColumns(`Order #: ${order.orderNumber}`, '')
    .twoColumns(
      `Date: ${order.completedAt.toLocaleDateString()}`,
      `Time: ${order.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    )
    .divider('-')

  // 4. Line Items Header
  builder
    .bold(true)
    .twoColumns('QTY ITEM', 'TOTAL')
    .bold(false)
    .divider('-')

  // 5. Line Items
  for (const item of order.items) {
    const qtyStr = `${item.quantity}x `
    const itemTotalStr = formatCurrency(item.lineTotal)
    const availableWidth = COLS_80MM - itemTotalStr.length - 1

    let nameStr = item.name
    if ((qtyStr + nameStr).length > availableWidth) {
      nameStr = nameStr.substring(0, availableWidth - qtyStr.length - 1)
    }

    builder.twoColumns(`${qtyStr}${nameStr}`, itemTotalStr)

    // Modifiers / notes indented
    if (item.modifiers && item.modifiers.length > 0) {
      const mods = item.modifiers.map((m) => `+ ${m.name}`).join(', ')
      builder.line(`   ${mods}`)
    }
    if (item.note) {
      builder.line(`   "${item.note}"`)
    }
  }

  builder.divider('-')

  // 6. Totals
  builder.twoColumns('Subtotal', formatCurrency(order.subtotal))

  if (order.discountAmount > 0) {
    builder.twoColumns('Discount', `-${formatCurrency(order.discountAmount)}`)
  }

  if (order.tax > 0) {
    builder.twoColumns('Tax / VAT', formatCurrency(order.tax))
  }

  builder.divider('=')

  // Grand Total (Bold & slightly emphasized)
  builder
    .bold(true)
    .twoColumns('TOTAL', formatCurrency(order.total))
    .bold(false)
    .divider('-')

  // 7. Payment breakdown
  builder
    .twoColumns(`Payment (${order.paymentLabel})`, formatCurrency(order.amountTendered))
  
  if (order.change > 0) {
    builder
      .bold(true)
      .twoColumns('Change Due', formatCurrency(order.change))
      .bold(false)
  }

  builder.divider('-')

  // 8. Footer & Barcode/Order Number
  builder
    .align('center')
    .feed(1)
    .line(footerNote)
    .line('Please retain this receipt.')
    .feed(2)
    .cut()

  return builder.build()
}
