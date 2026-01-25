// Format currency with proper SGD symbol support
// Node.js without full ICU data may not display S$ correctly, so we handle it explicitly
function formatWithSGDSymbol(formatted: string, currency: string): string {
  if (currency === 'SGD' && !formatted.startsWith('S$')) {
    return formatted.replace(/^\$/, 'S$')
  }
  return formatted
}

export function formatCurrency(
  amount: number,
  currency: string = 'SGD',
  locale: string = 'en-SG'
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return formatWithSGDSymbol(formatted, currency)
}

export function formatCompactCurrency(
  amount: number,
  currency: string = 'SGD',
  locale: string = 'en-SG'
): string {
  if (Math.abs(amount) >= 1000000) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
    return formatWithSGDSymbol(formatted, currency)
  }

  if (Math.abs(amount) >= 1000) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
    return formatWithSGDSymbol(formatted, currency)
  }

  return formatCurrency(amount, currency, locale)
}

export function parseCurrencyInput(input: string): number | null {
  const cleaned = input.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}
