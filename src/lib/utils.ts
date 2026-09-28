/** Format a number as currency */
export function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Generate a short unique cart item ID */
export function generateCartItemId(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
