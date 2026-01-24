import type {
  AgentConfig,
  AgentStatus,
  AgentAction,
  Transaction,
  ApprovalRequest,
  DecisionNode,
  SpendingLimits,
} from '../types'

export interface AgentDecision {
  action: 'approve' | 'reject' | 'request_approval'
  reason: string
  riskLevel: number
  decisionTree: DecisionNode
}

export interface AgentContext {
  balance: number
  dailySpent: number
  dailyLimit: number
  recentTransactions: Transaction[]
}

export abstract class BaseAgent {
  protected config: AgentConfig
  protected status: AgentStatus = 'idle'
  protected actionHistory: AgentAction[] = []

  constructor(config: AgentConfig) {
    this.config = config
  }

  getId(): string {
    return this.config.id
  }

  getName(): string {
    return this.config.name
  }

  getType(): string {
    return this.config.type
  }

  getStatus(): AgentStatus {
    return this.status
  }

  setStatus(status: AgentStatus): void {
    this.status = status
  }

  getConfig(): AgentConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  updateSpendingLimits(limits: Partial<SpendingLimits>): void {
    this.config.spendingLimits = {
      ...this.config.spendingLimits,
      ...limits,
    }
  }

  canAutoApprove(amount: number): boolean {
    return amount <= this.config.spendingLimits.autoApproveThreshold
  }

  isWithinPerTransactionLimit(amount: number): boolean {
    return amount <= this.config.spendingLimits.perTransaction
  }

  isWithinDailyLimit(amount: number, currentDailySpent: number): boolean {
    return currentDailySpent + amount <= this.config.spendingLimits.daily
  }

  calculateRiskLevel(amount: number): number {
    const ratio = amount / this.config.spendingLimits.perTransaction
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    if (ratio < 1) return 4
    return 5
  }

  isCategoryAllowed(category: string): boolean {
    if (this.config.allowedCategories.length === 0) return true
    return this.config.allowedCategories.includes(category)
  }

  isMerchantBlocked(merchantId: string): boolean {
    return this.config.blockedMerchants.includes(merchantId)
  }

  addAction(action: Omit<AgentAction, 'id' | 'timestamp' | 'agentId'>): AgentAction {
    const newAction: AgentAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      timestamp: Date.now(),
    }
    this.actionHistory.push(newAction)
    return newAction
  }

  getActionHistory(): AgentAction[] {
    return [...this.actionHistory]
  }

  clearActionHistory(): void {
    this.actionHistory = []
  }

  protected buildBaseDecisionTree(label: string): DecisionNode {
    return {
      id: 'root',
      type: 'condition',
      label,
      isActive: true,
      children: [],
    }
  }

  abstract evaluate(item: unknown, context: AgentContext): Promise<AgentDecision>

  abstract createApprovalRequest(
    item: unknown,
    decision: AgentDecision
  ): ApprovalRequest

  reset(): void {
    this.status = 'idle'
    this.actionHistory = []
  }
}
