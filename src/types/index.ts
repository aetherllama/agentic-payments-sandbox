// ============================================================================
// Core Types
// ============================================================================

export type AgentType = 'shopping' | 'subscription' | 'billpay' | 'investment' | 'negotiation'

// Singapore-specific payment methods
export type SingaporePaymentMethod = 'PayNow' | 'NETS' | 'GrabPay' | 'DBS PayLah!'
export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'waiting_approval' | 'paused' | 'completed' | 'error'
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'reserved'
export type SimulationSpeed = 1 | 2 | 5 | 10
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// ============================================================================
// Wallet & Transactions
// ============================================================================

export interface Transaction {
  id: string
  timestamp: number
  amount: number
  type: 'debit' | 'credit'
  status: TransactionStatus
  merchantId?: string
  merchantName?: string
  category?: string
  agentId: string
  description: string
  reasoning?: string
  reservationId?: string
}

export interface Reservation {
  id: string
  amount: number
  agentId: string
  expiresAt: number
  reason: string
  merchantId?: string
}

export interface WalletState {
  balance: number
  reservedAmount: number
  reservations: Reservation[]
  transactions: Transaction[]
  dailySpent: number
  dailyLimit: number
}

// ============================================================================
// Agent Configuration
// ============================================================================

export interface SpendingLimits {
  perTransaction: number
  daily: number
  autoApproveThreshold: number
}

export interface RiskSettings {
  maxRiskLevel: number
  requireApprovalAbove: number
}

export interface AgentConfig {
  id: string
  name: string
  type: AgentType
  enabled: boolean
  spendingLimits: SpendingLimits
  riskSettings: RiskSettings
  allowedCategories: string[]
  blockedMerchants: string[]
  customRules: AgentRule[]
}

export interface AgentRule {
  id: string
  condition: string
  action: 'approve' | 'reject' | 'request_approval'
  priority: number
}

export interface AgentAction {
  id: string
  agentId: string
  timestamp: number
  type: 'search' | 'evaluate' | 'decide' | 'execute' | 'wait' | 'complete'
  description: string
  data?: Record<string, unknown>
}

export interface AgentState {
  agents: AgentConfig[]
  activeAgentId: string | null
  agentStatuses: Record<string, AgentStatus>
  actionHistory: AgentAction[]
}

// ============================================================================
// Decision Tree
// ============================================================================

export interface DecisionNode {
  id: string
  type: 'condition' | 'action' | 'outcome'
  label: string
  description?: string
  children?: DecisionNode[]
  isActive?: boolean
  result?: 'pass' | 'fail' | 'pending'
}

// ============================================================================
// Simulation
// ============================================================================

export interface SimulationEvent {
  id: string
  scheduledTime: number
  type: 'agent_action' | 'merchant_offer' | 'bill_due' | 'market_change' | 'user_trigger'
  priority: number
  payload: Record<string, unknown>
  processed: boolean
}

export interface SimulationState {
  isRunning: boolean
  isPaused: boolean
  speed: SimulationSpeed
  currentTime: number
  startTime: number
  eventQueue: SimulationEvent[]
  processedEvents: SimulationEvent[]
}

// ============================================================================
// Scenarios
// ============================================================================

export interface ScenarioObjective {
  id: string
  description: string
  isCompleted: boolean
  isOptional: boolean
  conceptId?: string
}

export interface Scenario {
  id: string
  name: string
  description: string
  type: AgentType
  difficulty: Difficulty
  estimatedDuration: string
  objectives: ScenarioObjective[]
  initialBalance: number
  initialConfig: Partial<AgentConfig>
  concepts: string[]
  merchants?: Merchant[]
  products?: Product[]
  bills?: Bill[]
  subscriptions?: Subscription[]
}

export interface ScenarioState {
  availableScenarios: Scenario[]
  activeScenario: Scenario | null
  completedScenarioIds: string[]
  currentObjectives: ScenarioObjective[]
  scenarioStartTime: number | null
}

// ============================================================================
// Education
// ============================================================================

export interface Concept {
  id: string
  name: string
  category: string
  description: string
  detailedExplanation: string
  examples: string[]
  relatedConcepts: string[]
  icon?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
  requirement: {
    type: 'scenario_complete' | 'concept_learned' | 'transaction_count' | 'savings' | 'custom'
    value: string | number
  }
}

export interface EducationState {
  learnedConceptIds: string[]
  unlockedAchievements: Achievement[]
  totalTransactions: number
  totalSavings: number
  hintsEnabled: boolean
  currentHint: string | null
}

// ============================================================================
// Merchants & Products (Shopping Scenario)
// ============================================================================

export interface Merchant {
  id: string
  name: string
  category: string
  trustScore: number
  averagePrice: number
  deliveryTime: string
  icon?: string
}

export interface Product {
  id: string
  name: string
  category: string
  merchantId: string
  price: number
  originalPrice?: number
  rating: number
  inStock: boolean
  priority?: number
}

// ============================================================================
// Bills & Subscriptions
// ============================================================================

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: number
  category: string
  priority: 'essential' | 'important' | 'optional'
  isPaid: boolean
  isRecurring: boolean
  recurringInterval?: 'weekly' | 'monthly' | 'yearly'
}

export interface Subscription {
  id: string
  name: string
  monthlyAmount: number
  category: string
  value: number
  usageScore: number
  alternatives?: SubscriptionAlternative[]
  isActive: boolean
  renewalDate: number
}

export interface SubscriptionAlternative {
  id: string
  name: string
  monthlyAmount: number
  features: string[]
  savings: number
}

// ============================================================================
// Investment (Investment Scenario)
// ============================================================================

export interface Investment {
  id: string
  name: string
  type: 'stock' | 'bond' | 'etf' | 'crypto'
  currentPrice: number
  previousPrice: number
  riskLevel: number
  expectedReturn: number
  volatility: number
}

export interface InvestmentDecision {
  investmentId: string
  action: 'buy' | 'sell' | 'hold'
  amount: number
  reasoning: string
  riskScore: number
  requiresApproval: boolean
}

// ============================================================================
// Multi-Agent (Negotiation Scenario)
// ============================================================================

export interface NegotiationOffer {
  id: string
  fromAgentId: string
  toAgentId: string
  productId: string
  offeredPrice: number
  status: 'pending' | 'accepted' | 'rejected' | 'countered'
  counterOffer?: number
  reasoning: string
}

export interface TrustRelationship {
  agentId: string
  targetAgentId: string
  trustScore: number
  transactionHistory: number
  successRate: number
}

// ============================================================================
// Approval Flow
// ============================================================================

export interface ApprovalRequest {
  id: string
  agentId: string
  type: 'transaction' | 'investment' | 'subscription_change' | 'negotiation'
  amount: number
  description: string
  reasoning: string
  riskLevel: number
  decisionTree: DecisionNode
  createdAt: number
  expiresAt?: number
  merchantName?: string
  productName?: string
}

// ============================================================================
// Store Types
// ============================================================================

export interface StoreState {
  wallet: WalletState
  agent: AgentState
  simulation: SimulationState
  scenario: ScenarioState
  education: EducationState
}
