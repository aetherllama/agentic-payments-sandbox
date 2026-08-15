import type { SingaporePaymentMethod, Transaction } from '../types'

export type SafrOutcome = 'allow' | 'block' | 'approval'

export interface SafrTestCase {
  id: string
  label: string
  mandate: string
  transaction: {
    amount: number
    merchantName: string
    category: string
    paymentMethod?: SingaporePaymentMethod
  }
  isNewMerchant: boolean
  priorTransactions?: Array<{ amount: number; secondsAgo: number }>
  expected: SafrOutcome
}

export function buildTestHistory(
  entries: Array<{ amount: number; secondsAgo: number }> = []
): Transaction[] {
  const now = Date.now()
  return entries.map((entry, i) => ({
    id: `safr_test_hist_${i}`,
    timestamp: now - entry.secondsAgo * 1000,
    amount: entry.amount,
    type: 'debit',
    status: 'completed',
    agentId: 'safr-test-suite',
    description: 'Seeded history (SAFR Test Suite)',
  }))
}

export const SAFR_TEST_CASES: SafrTestCase[] = [
  {
    id: 'in-limit-allow',
    label: 'Small purchase, known merchant, within every limit',
    mandate: 'Baseline',
    transaction: { amount: 12, merchantName: 'FairPrice', category: 'Groceries', paymentMethod: 'PayNow' },
    isNewMerchant: false,
    expected: 'allow',
  },
  {
    id: 'blocked-category',
    label: 'Purchase from a restricted-category merchant',
    mandate: 'Category Restriction',
    transaction: { amount: 10, merchantName: 'Casino Royale', category: 'Gambling' },
    isNewMerchant: true,
    expected: 'block',
  },
  {
    id: 'new-merchant',
    label: 'Unverified, previously-unseen merchant',
    mandate: 'Authorization',
    transaction: { amount: 15, merchantName: 'Pop-Up Stall', category: 'Electronics' },
    isNewMerchant: true,
    expected: 'approval',
  },
  {
    id: 'over-threshold',
    label: 'Amount exceeds the confirmation threshold',
    mandate: 'Spending Limit',
    transaction: { amount: 999, merchantName: 'Challenger', category: 'Electronics' },
    isNewMerchant: false,
    expected: 'approval',
  },
  {
    id: 'rate-limit',
    label: 'Hourly transaction cap already reached',
    mandate: 'Velocity',
    transaction: { amount: 10, merchantName: 'FairPrice', category: 'Groceries' },
    isNewMerchant: false,
    priorTransactions: Array.from({ length: 5 }, (_, i) => ({ amount: 10, secondsAgo: 120 + i })),
    expected: 'approval',
  },
  {
    id: 'cooldown',
    label: 'Last transaction was seconds ago',
    mandate: 'Cooldown',
    transaction: { amount: 10, merchantName: 'FairPrice', category: 'Groceries' },
    isNewMerchant: false,
    priorTransactions: [{ amount: 10, secondsAgo: 5 }],
    expected: 'approval',
  },
  {
    id: 'bad-payment-method',
    label: 'Payment channel not on the allow-list',
    mandate: 'Channel Security',
    transaction: { amount: 10, merchantName: 'FairPrice', category: 'Groceries', paymentMethod: 'GrabPay' },
    isNewMerchant: false,
    expected: 'approval',
  },
]
