/** Format a number as currency */
export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Generate a short unique cart item ID */
export function generateCartItemId(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
