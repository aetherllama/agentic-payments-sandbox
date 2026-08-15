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

  describe('SAFR Sandbox Tokens', () => {
    it('should fund the wallet from the sandbox token pool', () => {
      const store = useStore.getState()
      const initialPool = useStore.getState().wallet.sandboxTokenPool

      const funded = store.fundWithSandboxTokens(200)

      const { wallet } = useStore.getState()
      expect(funded).toBe(true)
      expect(wallet.balance).toBe(1200)
      expect(wallet.sandboxTokenPool).toBe(initialPool - 200)
      expect(wallet.transactions[0].description).toContain('SAFR Sandbox Tokens')
    })

    it('should refuse to fund more than the remaining sandbox token pool', () => {
      const store = useStore.getState()
      const initialPool = useStore.getState().wallet.sandboxTokenPool

      const funded = store.fundWithSandboxTokens(initialPool + 1)

      const { wallet } = useStore.getState()
      expect(funded).toBe(false)
      expect(wallet.balance).toBe(1000)
      expect(wallet.sandboxTokenPool).toBe(initialPool)
    })

    it('should preserve the sandbox token pool across a wallet reset', () => {
      const store = useStore.getState()
      store.fundWithSandboxTokens(300)
      const poolAfterFunding = useStore.getState().wallet.sandboxTokenPool

      store.resetWallet(2000)

      expect(useStore.getState().wallet.sandboxTokenPool).toBe(poolAfterFunding)
    })
  })
})
