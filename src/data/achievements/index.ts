import type { Achievement } from '../../types'

export const achievements: Achievement[] = [
  {
    id: 'first-transaction',
    name: 'First Transaction',
    description: 'Complete your first agent-initiated transaction',
    icon: 'star',
    requirement: {
      type: 'transaction_count',
      value: 1,
    },
  },
  {
    id: 'ten-transactions',
    name: 'Getting Started',
    description: 'Complete 10 agent transactions',
    icon: 'zap',
    requirement: {
      type: 'transaction_count',
      value: 10,
    },
  },
  {
    id: 'fifty-transactions',
    name: 'Power User',
    description: 'Complete 50 agent transactions',
    icon: 'award',
    requirement: {
      type: 'transaction_count',
      value: 50,
    },
  },
  {
    id: 'first-approval',
    name: 'In Control',
    description: 'Approve or reject your first human-in-the-loop request',
    icon: 'check-circle',
    requirement: {
      type: 'custom',
      value: 'first_approval',
    },
  },
  {
    id: 'shopping-complete',
    name: 'Smart Shopper',
    description: 'Complete the Shopping Agent scenario',
    icon: 'shopping-cart',
    requirement: {
      type: 'scenario_complete',
      value: 'shopping-basics',
    },
  },
  {
    id: 'subscription-complete',
    name: 'Subscription Savvy',
    description: 'Complete the Subscription Manager scenario',
    icon: 'refresh-cw',
    requirement: {
      type: 'scenario_complete',
      value: 'subscription-manager',
    },
  },
  {
    id: 'billpay-complete',
    name: 'Bill Master',
    description: 'Complete the Bill Pay scenario',
    icon: 'file-text',
    requirement: {
      type: 'scenario_complete',
      value: 'bill-pay',
    },
  },
  {
    id: 'investment-complete',
    name: 'Risk Manager',
    description: 'Complete the Investment Agent scenario',
    icon: 'trending-up',
    requirement: {
      type: 'scenario_complete',
      value: 'investment-basics',
    },
  },
  {
    id: 'negotiation-complete',
    name: 'Deal Maker',
    description: 'Complete the Multi-Agent Negotiation scenario',
    icon: 'users',
    requirement: {
      type: 'scenario_complete',
      value: 'multi-agent-negotiation',
    },
  },
  {
    id: 'all-scenarios',
    name: 'Agentic Expert',
    description: 'Complete all scenarios',
    icon: 'crown',
    requirement: {
      type: 'custom',
      value: 'all_scenarios',
    },
  },
  {
    id: 'first-savings',
    name: 'Penny Pincher',
    description: 'Save money through an agent optimization',
    icon: 'piggy-bank',
    requirement: {
      type: 'savings',
      value: 1,
    },
  },
  {
    id: 'hundred-savings',
    name: 'Budget Hero',
    description: 'Save $100 through agent optimizations',
    icon: 'dollar-sign',
    requirement: {
      type: 'savings',
      value: 100,
    },
  },
  {
    id: 'concept-learner',
    name: 'Quick Learner',
    description: 'Learn your first agentic payment concept',
    icon: 'book-open',
    requirement: {
      type: 'concept_learned',
      value: 1,
    },
  },
  {
    id: 'concept-master',
    name: 'Concept Master',
    description: 'Learn all agentic payment concepts',
    icon: 'graduation-cap',
    requirement: {
      type: 'custom',
      value: 'all_concepts',
    },
  },
  {
    id: 'risk-avoider',
    name: 'Risk Avoider',
    description: 'Reject a high-risk transaction',
    icon: 'shield',
    requirement: {
      type: 'custom',
      value: 'reject_high_risk',
    },
  },
  {
    id: 'sandbox-explorer',
    name: 'Sandbox Explorer',
    description: 'Use Sandbox mode to experiment freely',
    icon: 'box',
    requirement: {
      type: 'custom',
      value: 'use_sandbox',
    },
  },
]

export const getAchievementById = (id: string): Achievement | undefined =>
  achievements.find((a) => a.id === id)

export const checkAchievementUnlock = (
  achievement: Achievement,
  state: {
    transactionCount: number
    savings: number
    completedScenarios: string[]
    learnedConcepts: string[]
    customFlags: Set<string>
  }
): boolean => {
  const { requirement } = achievement

  switch (requirement.type) {
    case 'transaction_count':
      return state.transactionCount >= (requirement.value as number)
    case 'savings':
      return state.savings >= (requirement.value as number)
    case 'scenario_complete':
      return state.completedScenarios.includes(requirement.value as string)
    case 'concept_learned':
      return state.learnedConcepts.length >= (requirement.value as number)
    case 'custom':
      return state.customFlags.has(requirement.value as string)
    default:
      return false
  }
}
