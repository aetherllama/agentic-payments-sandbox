import { BaseAgent, AgentDecision, AgentContext } from './BaseAgent'
import type { AgentConfig, Investment, InvestmentDecision, ApprovalRequest, DecisionNode } from '../types'

export class InvestmentAgent extends BaseAgent {
  private riskTolerance: number = 3
  private maxPositionSize: number = 0.2
  private requireApprovalForHighRisk: boolean = true

  constructor(config: AgentConfig) {
    super(config)
  }

  setRiskTolerance(level: number): void {
    this.riskTolerance = Math.max(1, Math.min(5, level))
  }

  setMaxPositionSize(size: number): void {
    this.maxPositionSize = Math.max(0.01, Math.min(1, size))
  }

  async evaluate(investment: Investment, context: AgentContext): Promise<AgentDecision> {
    this.setStatus('thinking')

    const analysis = this.analyzeInvestment(investment, context)
    const decisionTree = this.buildInvestmentDecisionTree(investment, analysis)

    this.addAction({
      type: 'evaluate',
      description: `Analyzing investment: ${investment.name} (${investment.type})`,
      data: { investment, analysis, context },
    })

    if (investment.riskLevel > this.riskTolerance) {
      if (this.requireApprovalForHighRisk) {
        return {
          action: 'request_approval',
          reason: `Risk level ${investment.riskLevel} exceeds tolerance of ${this.riskTolerance}. Human approval required.`,
          riskLevel: investment.riskLevel,
          decisionTree,
        }
      }
      return {
        action: 'reject',
        reason: `Risk level ${investment.riskLevel} exceeds maximum tolerance of ${this.riskTolerance}`,
        riskLevel: investment.riskLevel,
        decisionTree,
      }
    }

    const positionSize = analysis.suggestedAmount / context.balance
    if (positionSize > this.maxPositionSize) {
      return {
        action: 'request_approval',
        reason: `Position size (${(positionSize * 100).toFixed(1)}%) exceeds max of ${(this.maxPositionSize * 100).toFixed(1)}%`,
        riskLevel: 4,
        decisionTree,
      }
    }

    if (analysis.action === 'buy' && analysis.confidence >= 0.7) {
      const amount = analysis.suggestedAmount
      if (amount <= this.config.spendingLimits.autoApproveThreshold) {
        return {
          action: 'approve',
          reason: `High confidence (${(analysis.confidence * 100).toFixed(0)}%) buy signal. Amount within auto-approve.`,
          riskLevel: investment.riskLevel,
          decisionTree,
        }
      }
    }

    return {
      action: 'request_approval',
      reason: `${analysis.action.toUpperCase()} recommendation with ${(analysis.confidence * 100).toFixed(0)}% confidence.`,
      riskLevel: investment.riskLevel,
      decisionTree,
    }
  }

  private analyzeInvestment(
    investment: Investment,
    context: AgentContext
  ): {
    action: 'buy' | 'sell' | 'hold'
    confidence: number
    suggestedAmount: number
    reasoning: string[]
  } {
    const reasoning: string[] = []
    let buyScore = 0
    let sellScore = 0

    const priceChange = (investment.currentPrice - investment.previousPrice) / investment.previousPrice

    if (priceChange < -0.1) {
      buyScore += 2
      reasoning.push('Price dropped >10% - potential buying opportunity')
    } else if (priceChange > 0.2) {
      sellScore += 2
      reasoning.push('Price up >20% - consider taking profits')
    }

    if (investment.expectedReturn > investment.volatility) {
      buyScore += 1
      reasoning.push('Expected return exceeds volatility')
    }

    const riskAdjustedReturn = investment.expectedReturn / investment.riskLevel
    if (riskAdjustedReturn > 0.05) {
      buyScore += 1
      reasoning.push('Good risk-adjusted return')
    }

    if (investment.riskLevel <= this.riskTolerance) {
      buyScore += 0.5
      reasoning.push('Within risk tolerance')
    } else {
      sellScore += 1
      reasoning.push('Exceeds risk tolerance')
    }

    let action: 'buy' | 'sell' | 'hold'
    let confidence: number

    if (buyScore > sellScore + 1) {
      action = 'buy'
      confidence = Math.min(0.95, 0.5 + buyScore * 0.1)
    } else if (sellScore > buyScore + 1) {
      action = 'sell'
      confidence = Math.min(0.95, 0.5 + sellScore * 0.1)
    } else {
      action = 'hold'
      confidence = 0.6
    }

    const maxAmount = context.balance * this.maxPositionSize
    const suggestedAmount = Math.min(maxAmount, this.config.spendingLimits.perTransaction)

    return { action, confidence, suggestedAmount, reasoning }
  }

  private buildInvestmentDecisionTree(
    investment: Investment,
    analysis: { action: string; confidence: number; reasoning: string[] }
  ): DecisionNode {
    return {
      id: 'root',
      type: 'condition',
      label: 'Investment Analysis',
      isActive: true,
      children: [
        {
          id: 'risk_assessment',
          type: 'condition',
          label: `Risk Level: ${investment.riskLevel}/5`,
          result: investment.riskLevel <= this.riskTolerance ? 'pass' : 'pending',
          children: [
            {
              id: 'market_analysis',
              type: 'condition',
              label: 'Market Analysis',
              description: analysis.reasoning.join('; '),
              result: 'pass',
              children: [
                {
                  id: 'confidence_check',
                  type: 'condition',
                  label: `Confidence: ${(analysis.confidence * 100).toFixed(0)}%`,
                  result: analysis.confidence >= 0.7 ? 'pass' : 'pending',
                  children: [
                    {
                      id: 'recommendation',
                      type: 'outcome',
                      label: `Recommendation: ${analysis.action.toUpperCase()}`,
                      result: analysis.action === 'hold' ? 'pass' : 'pending',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
  }

  createApprovalRequest(investment: Investment, decision: AgentDecision): ApprovalRequest {
    const analysis = this.analyzeInvestment(investment, {
      balance: 1000,
      dailySpent: 0,
      dailyLimit: 500,
      recentTransactions: [],
    })

    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      type: 'investment',
      amount: analysis.suggestedAmount,
      description: `${analysis.action.toUpperCase()} ${investment.name}`,
      reasoning: decision.reason,
      riskLevel: decision.riskLevel,
      decisionTree: decision.decisionTree,
      createdAt: Date.now(),
    }
  }

  createInvestmentDecision(investment: Investment, context: AgentContext): InvestmentDecision {
    const analysis = this.analyzeInvestment(investment, context)

    return {
      investmentId: investment.id,
      action: analysis.action,
      amount: analysis.suggestedAmount,
      reasoning: analysis.reasoning.join(' '),
      riskScore: investment.riskLevel,
      requiresApproval: investment.riskLevel > this.riskTolerance ||
                        analysis.suggestedAmount > this.config.spendingLimits.autoApproveThreshold,
    }
  }
}
