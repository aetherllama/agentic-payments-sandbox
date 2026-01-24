import { BaseAgent, AgentDecision, AgentContext } from './BaseAgent'
import type { AgentConfig, Subscription, ApprovalRequest, DecisionNode } from '../types'

export class SubscriptionAgent extends BaseAgent {
  private usageThreshold: number = 0.3
  private savingsThreshold: number = 5

  constructor(config: AgentConfig) {
    super(config)
  }

  setUsageThreshold(threshold: number): void {
    this.usageThreshold = threshold
  }

  setSavingsThreshold(threshold: number): void {
    this.savingsThreshold = threshold
  }

  async evaluate(subscription: Subscription, context: AgentContext): Promise<AgentDecision> {
    this.setStatus('thinking')

    const decisionTree = this.buildSubscriptionDecisionTree(subscription)

    this.addAction({
      type: 'evaluate',
      description: `Reviewing subscription: ${subscription.name} ($${subscription.monthlyAmount}/month)`,
      data: { subscription, context },
    })

    if (!subscription.isActive) {
      return {
        action: 'reject',
        reason: 'Subscription is not active',
        riskLevel: 0,
        decisionTree,
      }
    }

    const hasLowUsage = subscription.usageScore < this.usageThreshold
    const hasBetterAlternative = subscription.alternatives?.some(
      (alt) => alt.savings >= this.savingsThreshold
    )

    if (hasLowUsage && hasBetterAlternative) {
      const bestAlternative = subscription.alternatives!.reduce((best, alt) =>
        alt.savings > best.savings ? alt : best
      )

      return {
        action: 'request_approval',
        reason: `Low usage (${Math.round(subscription.usageScore * 100)}%) detected. Consider switching to ${bestAlternative.name} to save $${bestAlternative.savings}/month.`,
        riskLevel: 2,
        decisionTree: this.addAlternativeToTree(decisionTree, bestAlternative),
      }
    }

    if (hasLowUsage) {
      return {
        action: 'request_approval',
        reason: `Low usage detected (${Math.round(subscription.usageScore * 100)}%). Consider canceling to save $${subscription.monthlyAmount}/month.`,
        riskLevel: 3,
        decisionTree,
      }
    }

    if (subscription.usageScore >= 0.8) {
      return {
        action: 'approve',
        reason: `High usage (${Math.round(subscription.usageScore * 100)}%). Subscription provides good value.`,
        riskLevel: 1,
        decisionTree,
      }
    }

    return {
      action: 'approve',
      reason: `Moderate usage (${Math.round(subscription.usageScore * 100)}%). Subscription maintained.`,
      riskLevel: 2,
      decisionTree,
    }
  }

  private buildSubscriptionDecisionTree(subscription: Subscription): DecisionNode {
    const hasLowUsage = subscription.usageScore < this.usageThreshold
    const hasBetterAlternative = subscription.alternatives?.some(
      (alt) => alt.savings >= this.savingsThreshold
    )

    return {
      id: 'root',
      type: 'condition',
      label: 'Subscription Review',
      isActive: true,
      children: [
        {
          id: 'active_check',
          type: 'condition',
          label: 'Is Active?',
          result: subscription.isActive ? 'pass' : 'fail',
          children: subscription.isActive
            ? [
                {
                  id: 'usage_check',
                  type: 'condition',
                  label: `Usage > ${this.usageThreshold * 100}%?`,
                  description: `Current: ${Math.round(subscription.usageScore * 100)}%`,
                  result: !hasLowUsage ? 'pass' : 'fail',
                  children: hasLowUsage
                    ? [
                        {
                          id: 'alternative_check',
                          type: 'condition',
                          label: 'Better alternative?',
                          result: hasBetterAlternative ? 'pass' : 'fail',
                          children: [
                            {
                              id: 'outcome',
                              type: 'outcome',
                              label: hasBetterAlternative ? 'Suggest Switch' : 'Consider Cancel',
                              result: 'pending',
                            },
                          ],
                        },
                      ]
                    : [
                        {
                          id: 'value_check',
                          type: 'outcome',
                          label: 'Good Value',
                          result: 'pass',
                        },
                      ],
                },
              ]
            : [],
        },
      ],
    }
  }

  private addAlternativeToTree(tree: DecisionNode, alternative: any): DecisionNode {
    return {
      ...tree,
      children: [
        ...(tree.children || []),
        {
          id: 'alternative_suggestion',
          type: 'action',
          label: `Switch to ${alternative.name}`,
          description: `Save $${alternative.savings}/month`,
          result: 'pending',
        },
      ],
    }
  }

  createApprovalRequest(subscription: Subscription, decision: AgentDecision): ApprovalRequest {
    const bestAlternative = subscription.alternatives?.reduce(
      (best, alt) => (alt.savings > (best?.savings || 0) ? alt : best),
      subscription.alternatives[0]
    )

    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      type: 'subscription_change',
      amount: bestAlternative?.savings || subscription.monthlyAmount,
      description: bestAlternative
        ? `Switch from ${subscription.name} to ${bestAlternative.name}`
        : `Cancel ${subscription.name}`,
      reasoning: decision.reason,
      riskLevel: decision.riskLevel,
      decisionTree: decision.decisionTree,
      createdAt: Date.now(),
    }
  }

  calculatePotentialSavings(subscriptions: Subscription[]): number {
    return subscriptions.reduce((total, sub) => {
      if (sub.usageScore < this.usageThreshold) {
        const bestAlt = sub.alternatives?.reduce(
          (best, alt) => (alt.savings > (best?.savings || 0) ? alt : best),
          sub.alternatives[0]
        )
        return total + (bestAlt?.savings || sub.monthlyAmount)
      }
      return total
    }, 0)
  }
}
