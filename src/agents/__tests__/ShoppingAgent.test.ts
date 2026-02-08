import { describe, it, expect, beforeEach } from 'vitest'
import { ShoppingAgent } from '../ShoppingAgent'
import type { AgentConfig, Product } from '../../types'
import { DEFAULT_SG_MANDATES } from '../../types/guardrails'

describe('ShoppingAgent', () => {
  let agent: ShoppingAgent
  let config: AgentConfig

  beforeEach(() => {
    config = {
      id: 'test-agent',
      name: 'Test Shopping Agent',
      type: 'shopping',
      enabled: true,
      spendingLimits: {
        perTransaction: 100,
        daily: 500,
        autoApproveThreshold: 25,
      },
      riskSettings: {
        maxRiskLevel: 4,
        requireApprovalAbove: 3,
      },
      allowedCategories: [],
      blockedMerchants: [],
      customRules: [],
      guardrails: { ...DEFAULT_SG_MANDATES },
    }

    agent = new ShoppingAgent(config)
  })

  it('should auto-approve small purchases', async () => {
    const product: Product = {
      id: 'prod-1',
      name: 'Cheap Item',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 15,
      rating: 4.5,
      inStock: true,
    }

    const context = {
      balance: 500,
      dailySpent: 0,
      dailyLimit: 500,
      recentTransactions: [],
    }

    const decision = await agent.evaluate(product, context)

    expect(decision.action).toBe('approve')
    expect(decision.riskLevel).toBeLessThanOrEqual(2)
  })

  it('should request approval for purchases above threshold', async () => {
    const product: Product = {
      id: 'prod-2',
      name: 'Expensive Item',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 75,
      rating: 4.5,
      inStock: true,
    }

    const context = {
      balance: 500,
      dailySpent: 0,
      dailyLimit: 500,
      recentTransactions: [],
    }

    const decision = await agent.evaluate(product, context)

    expect(decision.action).toBe('request_approval')
  })

  it('should reject out of stock items', async () => {
    const product: Product = {
      id: 'prod-3',
      name: 'Out of Stock Item',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 20,
      rating: 4.5,
      inStock: false,
    }

    const context = {
      balance: 500,
      dailySpent: 0,
      dailyLimit: 500,
      recentTransactions: [],
    }

    const decision = await agent.evaluate(product, context)

    expect(decision.action).toBe('reject')
    expect(decision.reason).toContain('out of stock')
  })

  it('should reject purchases exceeding per-transaction limit', async () => {
    const product: Product = {
      id: 'prod-4',
      name: 'Too Expensive',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 150,
      rating: 4.5,
      inStock: true,
    }

    const context = {
      balance: 500,
      dailySpent: 0,
      dailyLimit: 500,
      recentTransactions: [],
    }

    const decision = await agent.evaluate(product, context)

    expect(decision.action).toBe('reject')
    expect(decision.reason).toContain('exceeds per-transaction limit')
  })

  it('should reject purchases that would exceed daily limit', async () => {
    const product: Product = {
      id: 'prod-5',
      name: 'Normal Item',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 50,
      rating: 4.5,
      inStock: true,
    }

    const context = {
      balance: 500,
      dailySpent: 475,
      dailyLimit: 500,
      recentTransactions: [],
    }

    const decision = await agent.evaluate(product, context)

    expect(decision.action).toBe('reject')
    expect(decision.reason).toContain('daily')
  })

  it('should calculate product score', () => {
    const product: Product = {
      id: 'prod-6',
      name: 'Good Deal',
      category: 'Electronics',
      merchantId: 'store-1',
      price: 80,
      originalPrice: 100,
      rating: 4.5,
      inStock: true,
    }

    const score = agent.getProductScore(product)

    expect(score).toBeGreaterThan(50)
    expect(score).toBeLessThanOrEqual(100)
  })
})
