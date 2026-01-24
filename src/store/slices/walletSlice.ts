import { StateCreator } from 'zustand'
import type { WalletState, Transaction, Reservation, StoreState } from '../../types'

export interface WalletSlice {
  wallet: WalletState
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  updateTransactionStatus: (id: string, status: Transaction['status']) => void
  createReservation: (reservation: Omit<Reservation, 'id'>) => string
  releaseReservation: (id: string) => void
  completeReservation: (id: string) => void
  setBalance: (amount: number) => void
  addBalance: (amount: number) => void
  subtractBalance: (amount: number) => boolean
  setDailyLimit: (limit: number) => void
  resetDailySpent: () => void
  resetWallet: (initialBalance?: number) => void
}

const initialWalletState: WalletState = {
  balance: 1000,
  reservedAmount: 0,
  reservations: [],
  transactions: [],
  dailySpent: 0,
  dailyLimit: 500,
}

export const createWalletSlice: StateCreator<StoreState & WalletSlice, [], [], WalletSlice> = (set, get) => ({
  wallet: { ...initialWalletState },

  addTransaction: (transaction) => {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: Date.now(),
    }

    set((state) => {
      const newDailySpent = transaction.type === 'debit'
        ? state.wallet.dailySpent + transaction.amount
        : state.wallet.dailySpent

      const newBalance = transaction.type === 'debit'
        ? state.wallet.balance - transaction.amount
        : state.wallet.balance + transaction.amount

      return {
        wallet: {
          ...state.wallet,
          balance: newBalance,
          transactions: [newTransaction, ...state.wallet.transactions],
          dailySpent: newDailySpent,
        },
      }
    })
  },

  updateTransactionStatus: (id, status) => {
    set((state) => ({
      wallet: {
        ...state.wallet,
        transactions: state.wallet.transactions.map((t) =>
          t.id === id ? { ...t, status } : t
        ),
      },
    }))
  },

  createReservation: (reservation) => {
    const id = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newReservation: Reservation = { ...reservation, id }

    set((state) => ({
      wallet: {
        ...state.wallet,
        reservedAmount: state.wallet.reservedAmount + reservation.amount,
        reservations: [...state.wallet.reservations, newReservation],
      },
    }))

    return id
  },

  releaseReservation: (id) => {
    set((state) => {
      const reservation = state.wallet.reservations.find((r) => r.id === id)
      if (!reservation) return state

      return {
        wallet: {
          ...state.wallet,
          reservedAmount: state.wallet.reservedAmount - reservation.amount,
          reservations: state.wallet.reservations.filter((r) => r.id !== id),
        },
      }
    })
  },

  completeReservation: (id) => {
    const state = get()
    const reservation = state.wallet.reservations.find((r) => r.id === id)
    if (!reservation) return

    state.addTransaction({
      amount: reservation.amount,
      type: 'debit',
      status: 'completed',
      agentId: reservation.agentId,
      description: reservation.reason,
      merchantId: reservation.merchantId,
      reservationId: id,
    })

    set((state) => ({
      wallet: {
        ...state.wallet,
        reservedAmount: state.wallet.reservedAmount - reservation.amount,
        reservations: state.wallet.reservations.filter((r) => r.id !== id),
      },
    }))
  },

  setBalance: (amount) => {
    set((state) => ({
      wallet: { ...state.wallet, balance: amount },
    }))
  },

  addBalance: (amount) => {
    set((state) => ({
      wallet: { ...state.wallet, balance: state.wallet.balance + amount },
    }))
  },

  subtractBalance: (amount) => {
    const state = get()
    const availableBalance = state.wallet.balance - state.wallet.reservedAmount
    if (availableBalance < amount) return false

    set((state) => ({
      wallet: { ...state.wallet, balance: state.wallet.balance - amount },
    }))
    return true
  },

  setDailyLimit: (limit) => {
    set((state) => ({
      wallet: { ...state.wallet, dailyLimit: limit },
    }))
  },

  resetDailySpent: () => {
    set((state) => ({
      wallet: { ...state.wallet, dailySpent: 0 },
    }))
  },

  resetWallet: (initialBalance = 1000) => {
    set({
      wallet: { ...initialWalletState, balance: initialBalance },
    })
  },
})
