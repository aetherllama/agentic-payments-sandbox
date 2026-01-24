import { BaseAgent, AgentDecision, AgentContext } from './BaseAgent'
import type { AgentConfig, Product, ApprovalRequest, DecisionNode } from '../types'

export class ShoppingAgent extends BaseAgent {
  private preferredCategories: string[] = []
  private maxPriceMultiplier: number = 1.5

  constructor(config: AgentConfig) {
    super(config)
  }

  setPreferredCategories(categories: string[]): void {
    this.preferredCategories = categories
  }

  setMaxPriceMultiplier(multiplier: number): void {
    this.maxPriceMultiplier = multiplier
  }

  async evaluate(product: Product, context: AgentContext): Promise<AgentDecision> {
    this.setStatus('thinking')

    const decisionTree = this.buildProductDecisionTree(product, context)
    const checks = this.runChecks(product, context)

    this.addAction({
      type: 'evaluate',
      description: `Evaluating product: ${product.name} at $${product.price}`,
      data: { product, context },
    })

    if (!checks.inStock) {
      return {
        action: 'reject',
        reason: 'Product is out of stock',
        riskLevel: 0,
        decisionTree,
      }
    }

    if (!checks.withinBudget) {
      return {
        action: 'reject',
        reason: `Price $${product.price} exceeds per-transaction limit of $${this.config.spendingLimits.perTransaction}`,
        riskLevel: 5,
        decisionTree,
      }
    }

    if (!checks.withinDailyLimit) {
      return {
        action: 'reject',
        reason: `Purchase would exceed daily spending limit of $${this.config.spendingLimits.daily}`,
        riskLevel: 5,
        decisionTree,
      }
    }

    if (checks.merchantBlocked) {
      return {
        action: 'reject',
        reason: 'Merchant is blocked',
        riskLevel: 3,
        decisionTree,
      }
    }

    if (!checks.categoryAllowed) {
      return {
        action: 'request_approval',
        reason: `Category "${product.category}" requires approval`,
        riskLevel: 3,
        decisionTree,
      }
    }

    const riskLevel = this.calculateProductRisk(product, context)

    if (checks.canAutoApprove && riskLevel <= this.config.riskSettings.requireApprovalAbove) {
      return {
        action: 'approve',
        reason: `Auto-approved: Price $${product.price} is within auto-approval threshold`,
        riskLevel,
        decisionTree,
      }
    }

    return {
      action: 'request_approval',
      reason: `Price $${product.price} exceeds auto-approval threshold of $${this.config.spendingLimits.autoApproveThreshold}`,
      riskLevel,
      decisionTree,
    }
  }

  private runChecks(product: Product, context: AgentContext) {
    return {
      inStock: product.inStock,
      withinBudget: this.isWithinPerTransactionLimit(product.price),
      withinDailyLimit: this.isWithinDailyLimit(product.price, context.dailySpent),
      merchantBlocked: this.isMerchantBlocked(product.merchantId),
      categoryAllowed: this.isCategoryAllowed(product.category),
      canAutoApprove: this.canAutoApprove(product.price),
      sufficientBalance: context.balance >= product.price,
    }
  }

  private calculateProductRisk(product: Product, context: AgentContext): number {
    let risk = this.calculateRiskLevel(product.price)

    const balanceRatio = product.price / context.balance
    if (balanceRatio > 0.5) risk = Math.min(5, risk + 1)
    if (balanceRatio > 0.75) risk = Math.min(5, risk + 1)

    if (product.rating < 3) risk = Math.min(5, risk + 1)

    if (product.originalPrice && product.price > product.originalPrice * this.maxPriceMultiplier) {
      risk = Math.min(5, risk + 1)
    }

    return risk
  }

  private buildProductDecisionTree(product: Product, context: AgentContext): DecisionNode {
    const checks = this.runChecks(product, context)

    return {
      id: 'root',
      type: 'condition',
      label: 'Purchase Decision',
      isActive: true,
      children: [
        {
          id: 'stock_check',
          type: 'condition',
          label: 'In Stock?',
          result: checks.inStock ? 'pass' : 'fail',
          children: checks.inStock
            ? [
                {
                  id: 'budget_check',
                  type: 'condition',
                  label: `Under $${this.config.spendingLimits.perTransaction} limit?`,
                  result: checks.withinBudget ? 'pass' : 'fail',
                  children: checks.withinBudget
                    ? [
                        {
                          id: 'daily_limit_check',
                          type: 'condition',
                          label: `Within daily limit?`,
                          result: checks.withinDailyLimit ? 'pass' : 'fail',
                          children: checks.withinDailyLimit
                            ? [
                                {
                                  id: 'merchant_check',
                                  type: 'condition',
                                  label: 'Merchant allowed?',
                                  result: !checks.merchantBlocked ? 'pass' : 'fail',
                                  children: !checks.merchantBlocked
                                    ? [
                                        {
                                          id: 'auto_approve_check',
                                          type: 'condition',
                                          label: `Under $${this.config.spendingLimits.autoApproveThreshold} auto-approve?`,
                                          result: checks.canAutoApprove ? 'pass' : 'pending',
                                          children: [
                                            {
                                              id: 'outcome',
                                              type: 'outcome',
                                              label: checks.canAutoApprove
                                                ? 'Auto-Approve'
                                                : 'Request Approval',
                                              result: checks.canAutoApprove ? 'pass' : 'pending',
                                            },
                                          ],
                                        },
                                      ]
                                    : [],
                                },
                              ]
                            : [],
                        },
                      ]
                    : [],
                },
              ]
            : [],
        },
      ],
    }
  }

  createApprovalRequest(product: Product, decision: AgentDecision): ApprovalRequest {
    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      type: 'transaction',
      amount: product.price,
      description: `Purchase: ${product.name}`,
      reasoning: decision.reason,
      riskLevel: decision.riskLevel,
      decisionTree: decision.decisionTree,
      createdAt: Date.now(),
      merchantName: product.merchantId,
      productName: product.name,
    }
  }

  getProductScore(product: Product): number {
    let score = 50

    score += product.rating * 10

    if (this.preferredCategories.includes(product.category)) {
      score += 15
    }

    if (product.originalPrice && product.price < product.originalPrice) {
      const discount = (product.originalPrice - product.price) / product.originalPrice
      score += discount * 30
    }

    const priceRatio = product.price / this.config.spendingLimits.perTransaction
    score -= priceRatio * 20

    return Math.max(0, Math.min(100, score))
  }
}
