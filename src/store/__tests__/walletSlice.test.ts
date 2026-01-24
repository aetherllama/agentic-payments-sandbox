import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../index'

describe('walletSlice', () => {
  beforeEach(() => {
    useStore.getState().resetWallet(1000)
  })

  it('should initialize with default balance', () => {
    const { wallet } = useStore.getState()
    expect(wallet.balance).toBe(1000)
    expect(wallet.reservedAmount).toBe(0)
    expect(wallet.transactions).toHaveLength(0)
  })

  it('should add a transaction', () => {
    const store = useStore.getState()

    store.addTransaction({
      amount: 50,
      type: 'debit',
      status: 'completed',
      agentId: 'test-agent',
      description: 'Test purchase',
    })

    const { wallet } = useStore.getState()
    expect(wallet.transactions).toHaveLength(1)
    expect(wallet.balance).toBe(950)
    expect(wallet.dailySpent).toBe(50)
  })

  it('should create and release a reservation', () => {
    const store = useStore.getState()

    const reservationId = store.createReservation({
      amount: 100,
      agentId: 'test-agent',
      reason: 'Test reservation',
      expiresAt: Date.now() + 60000,
    })

    let { wallet } = useStore.getState()
    expect(wallet.reservedAmount).toBe(100)
    expect(wallet.reservations).toHaveLength(1)

    store.releaseReservation(reservationId)

    wallet = useStore.getState().wallet
    expect(wallet.reservedAmount).toBe(0)
    expect(wallet.reservations).toHaveLength(0)
  })

  it('should complete a reservation', () => {
    const store = useStore.getState()

    const reservationId = store.createReservation({
      amount: 75,
      agentId: 'test-agent',
      reason: 'Complete test',
      expiresAt: Date.now() + 60000,
    })

    store.completeReservation(reservationId)

    const { wallet } = useStore.getState()
    expect(wallet.reservedAmount).toBe(0)
    expect(wallet.transactions).toHaveLength(1)
    expect(wallet.balance).toBe(925)
  })

  it('should set daily limit', () => {
    const store = useStore.getState()
    store.setDailyLimit(250)

    const { wallet } = useStore.getState()
    expect(wallet.dailyLimit).toBe(250)
  })

  it('should reset wallet', () => {
    const store = useStore.getState()

    store.addTransaction({
      amount: 50,
      type: 'debit',
      status: 'completed',
      agentId: 'test-agent',
      description: 'Test',
    })

    store.resetWallet(2000)

    const { wallet } = useStore.getState()
    expect(wallet.balance).toBe(2000)
    expect(wallet.transactions).toHaveLength(0)
    expect(wallet.dailySpent).toBe(0)
  })
})
