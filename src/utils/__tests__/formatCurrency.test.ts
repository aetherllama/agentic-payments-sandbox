import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCompactCurrency, parseCurrencyInput } from '../formatCurrency'

describe('formatCurrency', () => {
  it('should format basic amounts in SGD', () => {
    expect(formatCurrency(100)).toBe('S$100.00')
    expect(formatCurrency(0)).toBe('S$0.00')
    expect(formatCurrency(1234.56)).toBe('S$1,234.56')
  })

  it('should handle decimals', () => {
    expect(formatCurrency(99.99)).toBe('S$99.99')
    expect(formatCurrency(0.01)).toBe('S$0.01')
    expect(formatCurrency(123.456)).toBe('S$123.46')
  })

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000)).toBe('S$1,000,000.00')
  })
})

describe('formatCompactCurrency', () => {
  it('should format small amounts normally in SGD', () => {
    expect(formatCompactCurrency(100)).toBe('S$100.00')
    expect(formatCompactCurrency(999)).toBe('S$999.00')
  })

  it('should compact thousands', () => {
    const result = formatCompactCurrency(1500)
    expect(result).toMatch(/S\$1\.5K|S\$1,500/)
  })

  it('should compact millions', () => {
    const result = formatCompactCurrency(1500000)
    expect(result).toMatch(/S\$1\.5M|S\$1,500,000/)
  })
})

describe('parseCurrencyInput', () => {
  it('should parse valid currency strings', () => {
    expect(parseCurrencyInput('$100.00')).toBe(100)
    expect(parseCurrencyInput('$1,234.56')).toBe(1234.56)
    expect(parseCurrencyInput('99.99')).toBe(99.99)
  })

  it('should return null for invalid input', () => {
    expect(parseCurrencyInput('')).toBeNull()
    expect(parseCurrencyInput('abc')).toBeNull()
    expect(parseCurrencyInput('$')).toBeNull()
  })

  it('should handle plain numbers', () => {
    expect(parseCurrencyInput('50')).toBe(50)
    expect(parseCurrencyInput('123.45')).toBe(123.45)
  })
})
