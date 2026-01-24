import { useMemo, useCallback } from 'react'
import { useStore } from '../store'
import type { Transaction } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

export function useWalletActions() {
  const {
    wallet,
    addTransaction,
    createReservation,
    releaseReservation,
    completeReservation,
    setBalance,
    setDailyLimit,
    resetWallet,
  } = useStore()

  const availableBalance = useMemo(() => {
    return wallet.balance - wallet.reservedAmount
  }, [wallet.balance, wallet.reservedAmount])

  const canSpend = useCallback(
    (amount: number) => {
      return availableBalance >= amount && wallet.dailySpent + amount <= wallet.dailyLimit
    },
    [availableBalance, wallet.dailySpent, wallet.dailyLimit]
  )

  const spend = useCallback(
    (amount: number, description: string, agentId: string, options?: Partial<Transaction>) => {
      if (!canSpend(amount)) return false

      addTransaction({
        amount,
        type: 'debit',
        status: 'completed',
        agentId,
        description,
        ...options,
      })

      return true
    },
    [canSpend, addTransaction]
  )

  const receive = useCallback(
    (amount: number, description: string, agentId: string, options?: Partial<Transaction>) => {
      addTransaction({
        amount,
        type: 'credit',
        status: 'completed',
        agentId,
        description,
        ...options,
      })
    },
    [addTransaction]
  )

  const reserve = useCallback(
    (amount: number, agentId: string, reason: string, merchantId?: string) => {
      if (availableBalance < amount) return null

      return createReservation({
        amount,
        agentId,
        reason,
        merchantId,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      })
    },
    [availableBalance, createReservation]
  )

  const dailyProgress = useMemo(() => {
    return (wallet.dailySpent / wallet.dailyLimit) * 100
  }, [wallet.dailySpent, wallet.dailyLimit])

  const formattedBalance = useMemo(() => formatCurrency(wallet.balance), [wallet.balance])
  const formattedAvailable = useMemo(() => formatCurrency(availableBalance), [availableBalance])

  return {
    balance: wallet.balance,
    availableBalance,
    reservedAmount: wallet.reservedAmount,
    reservations: wallet.reservations,
    transactions: wallet.transactions,
    dailySpent: wallet.dailySpent,
    dailyLimit: wallet.dailyLimit,
    dailyProgress,
    formattedBalance,
    formattedAvailable,
    canSpend,
    spend,
    receive,
    reserve,
    releaseReservation,
    completeReservation,
    setBalance,
    setDailyLimit,
    resetWallet,
  }
}
