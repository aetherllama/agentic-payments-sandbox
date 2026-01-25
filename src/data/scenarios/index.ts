import type { Scenario, Product, Merchant, Bill, Subscription } from '../../types'

const merchants: Merchant[] = [
  { id: 'tech-store', name: 'TechMart', category: 'Electronics', trustScore: 4.5, averagePrice: 150, deliveryTime: '2-3 days' },
  { id: 'grocery-plus', name: 'Grocery Plus', category: 'Groceries', trustScore: 4.8, averagePrice: 45, deliveryTime: '1 day' },
  { id: 'fashion-hub', name: 'Fashion Hub', category: 'Clothing', trustScore: 4.2, averagePrice: 65, deliveryTime: '3-5 days' },
  { id: 'home-essentials', name: 'Home Essentials', category: 'Home', trustScore: 4.6, averagePrice: 80, deliveryTime: '2-4 days' },
  { id: 'book-world', name: 'Book World', category: 'Books', trustScore: 4.9, averagePrice: 20, deliveryTime: '1-2 days' },
]

const shoppingProducts: Product[] = [
  { id: 'prod-1', name: 'Wireless Mouse', category: 'Electronics', merchantId: 'tech-store', price: 29.99, rating: 4.5, inStock: true, priority: 3 },
  { id: 'prod-2', name: 'USB-C Hub', category: 'Electronics', merchantId: 'tech-store', price: 45.99, rating: 4.3, inStock: true, priority: 2 },
  { id: 'prod-3', name: 'Mechanical Keyboard', category: 'Electronics', merchantId: 'tech-store', price: 89.99, rating: 4.7, inStock: true, priority: 1 },
  { id: 'prod-4', name: 'Monitor Stand', category: 'Electronics', merchantId: 'tech-store', price: 34.99, rating: 4.4, inStock: true, priority: 4 },
  { id: 'prod-5', name: 'Webcam HD', category: 'Electronics', merchantId: 'tech-store', price: 59.99, rating: 4.6, inStock: false, priority: 2 },
  { id: 'prod-6', name: 'Desk Lamp', category: 'Home', merchantId: 'home-essentials', price: 24.99, rating: 4.2, inStock: true, priority: 5 },
  { id: 'prod-7', name: 'Notebook Set', category: 'Office', merchantId: 'book-world', price: 12.99, rating: 4.8, inStock: true, priority: 6 },
  { id: 'prod-8', name: 'Premium Headphones', category: 'Electronics', merchantId: 'tech-store', price: 149.99, originalPrice: 199.99, rating: 4.9, inStock: true, priority: 1 },
]

const bills: Bill[] = [
  { id: 'bill-1', name: 'Electricity', amount: 120, dueDate: Date.now() + 45 * 1000, category: 'Utilities', priority: 'essential', isPaid: false, isRecurring: true, recurringInterval: 'monthly' },
  { id: 'bill-2', name: 'Internet', amount: 65, dueDate: Date.now() + 90 * 1000, category: 'Utilities', priority: 'essential', isPaid: false, isRecurring: true, recurringInterval: 'monthly' },
  { id: 'bill-3', name: 'Phone', amount: 45, dueDate: Date.now() + 135 * 1000, category: 'Utilities', priority: 'important', isPaid: false, isRecurring: true, recurringInterval: 'monthly' },
  { id: 'bill-4', name: 'Gym Membership', amount: 30, dueDate: Date.now() + 180 * 1000, category: 'Fitness', priority: 'optional', isPaid: false, isRecurring: true, recurringInterval: 'monthly' },
  { id: 'bill-5', name: 'Insurance', amount: 150, dueDate: Date.now() + 30 * 1000, category: 'Insurance', priority: 'essential', isPaid: false, isRecurring: true, recurringInterval: 'monthly' },
]

const subscriptions: Subscription[] = [
  { id: 'sub-1', name: 'Premium Streaming', monthlyAmount: 15.99, category: 'Entertainment', value: 8, usageScore: 0.85, isActive: true, renewalDate: Date.now() + 120 * 1000 },
  { id: 'sub-2', name: 'Music Service', monthlyAmount: 9.99, category: 'Entertainment', value: 7, usageScore: 0.2, isActive: true, renewalDate: Date.now() + 45 * 1000, alternatives: [
    { id: 'alt-1', name: 'Free Tier with Ads', monthlyAmount: 0, features: ['Ad-supported', 'Shuffle only'], savings: 9.99 },
    { id: 'alt-2', name: 'Family Plan Split', monthlyAmount: 3, features: ['Full features', 'Share with 5'], savings: 6.99 },
  ]},
  { id: 'sub-3', name: 'Cloud Storage', monthlyAmount: 2.99, category: 'Productivity', value: 9, usageScore: 0.95, isActive: true, renewalDate: Date.now() + 180 * 1000 },
  { id: 'sub-4', name: 'News Premium', monthlyAmount: 12.99, category: 'News', value: 4, usageScore: 0.15, isActive: true, renewalDate: Date.now() + 75 * 1000, alternatives: [
    { id: 'alt-3', name: 'Free Articles', monthlyAmount: 0, features: ['5 articles/month', 'No premium'], savings: 12.99 },
  ]},
  { id: 'sub-5', name: 'Fitness App', monthlyAmount: 7.99, category: 'Fitness', value: 6, usageScore: 0.4, isActive: true, renewalDate: Date.now() + 150 * 1000 },
]

export const scenarios: Scenario[] = [
  {
    id: 'shopping-basics',
    name: 'Shopping Agent',
    description: 'Learn how AI agents make purchase decisions with spending limits and auto-approval thresholds.',
    type: 'shopping',
    difficulty: 'beginner',
    estimatedDuration: '2-4 min',
    initialBalance: 500,
    objectives: [
      { id: 'obj-1', description: 'Configure agent spending limits', isCompleted: false, isOptional: false, conceptId: 'spending-limits' },
      { id: 'obj-2', description: 'Set an auto-approval threshold', isCompleted: false, isOptional: false, conceptId: 'auto-approval' },
      { id: 'obj-3', description: 'Approve or reject a purchase request', isCompleted: false, isOptional: false, conceptId: 'human-in-the-loop' },
      { id: 'obj-4', description: 'Complete 3 successful transactions', isCompleted: false, isOptional: false },
      { id: 'obj-5', description: 'Block a high-risk transaction', isCompleted: false, isOptional: true, conceptId: 'risk-assessment' },
    ],
    concepts: ['spending-limits', 'auto-approval', 'human-in-the-loop', 'risk-assessment'],
    initialConfig: {
      spendingLimits: { perTransaction: 100, daily: 300, autoApproveThreshold: 25 },
      riskSettings: { maxRiskLevel: 4, requireApprovalAbove: 3 },
    },
    merchants,
    products: shoppingProducts,
  },
  {
    id: 'subscription-manager',
    name: 'Subscription Manager',
    description: 'Optimize recurring payments by analyzing usage patterns and finding cost-saving opportunities.',
    type: 'subscription',
    difficulty: 'intermediate',
    estimatedDuration: '2-4 min',
    initialBalance: 200,
    objectives: [
      { id: 'obj-1', description: 'Review all active subscriptions', isCompleted: false, isOptional: false, conceptId: 'recurring-payments' },
      { id: 'obj-2', description: 'Identify low-usage subscriptions', isCompleted: false, isOptional: false, conceptId: 'subscription-optimization' },
      { id: 'obj-3', description: 'Accept a cost-saving recommendation', isCompleted: false, isOptional: false },
      { id: 'obj-4', description: 'Save at least $10/month', isCompleted: false, isOptional: false },
      { id: 'obj-5', description: 'Cancel an unused subscription', isCompleted: false, isOptional: true },
    ],
    concepts: ['recurring-payments', 'subscription-optimization', 'decision-transparency'],
    initialConfig: {
      spendingLimits: { perTransaction: 50, daily: 100, autoApproveThreshold: 15 },
      riskSettings: { maxRiskLevel: 3, requireApprovalAbove: 2 },
    },
    subscriptions,
  },
  {
    id: 'bill-pay',
    name: 'Bill Pay Automation',
    description: 'Set up intelligent bill payment with priority scheduling and constraint management.',
    type: 'billpay',
    difficulty: 'intermediate',
    estimatedDuration: '2-4 min',
    initialBalance: 400,
    objectives: [
      { id: 'obj-1', description: 'Review upcoming bills', isCompleted: false, isOptional: false, conceptId: 'bill-prioritization' },
      { id: 'obj-2', description: 'Set payment priorities', isCompleted: false, isOptional: false },
      { id: 'obj-3', description: 'Auto-pay an essential bill', isCompleted: false, isOptional: false },
      { id: 'obj-4', description: 'Defer a non-essential bill', isCompleted: false, isOptional: false },
      { id: 'obj-5', description: 'Pay all bills on time', isCompleted: false, isOptional: true },
    ],
    concepts: ['bill-prioritization', 'reservation-system', 'decision-transparency'],
    initialConfig: {
      spendingLimits: { perTransaction: 200, daily: 500, autoApproveThreshold: 50 },
      riskSettings: { maxRiskLevel: 3, requireApprovalAbove: 2 },
    },
    bills,
  },
  {
    id: 'investment-basics',
    name: 'Investment Agent',
    description: 'Explore risk controls and human oversight for automated investment decisions.',
    type: 'investment',
    difficulty: 'advanced',
    estimatedDuration: '2-4 min',
    initialBalance: 10000,
    objectives: [
      { id: 'obj-1', description: 'Set risk tolerance level', isCompleted: false, isOptional: false, conceptId: 'investment-risk-controls' },
      { id: 'obj-2', description: 'Review an investment recommendation', isCompleted: false, isOptional: false, conceptId: 'decision-transparency' },
      { id: 'obj-3', description: 'Approve a low-risk trade', isCompleted: false, isOptional: false, conceptId: 'human-in-the-loop' },
      { id: 'obj-4', description: 'Reject a high-risk trade', isCompleted: false, isOptional: false, conceptId: 'risk-assessment' },
      { id: 'obj-5', description: 'Maintain positive returns', isCompleted: false, isOptional: true },
    ],
    concepts: ['investment-risk-controls', 'human-in-the-loop', 'risk-assessment', 'decision-transparency'],
    initialConfig: {
      spendingLimits: { perTransaction: 1000, daily: 2000, autoApproveThreshold: 100 },
      riskSettings: { maxRiskLevel: 3, requireApprovalAbove: 2 },
    },
  },
  {
    id: 'multi-agent-negotiation',
    name: 'Multi-Agent Negotiation',
    description: 'Watch AI agents negotiate with each other and learn about agent-to-agent trust.',
    type: 'negotiation',
    difficulty: 'advanced',
    estimatedDuration: '2-4 min',
    initialBalance: 1000,
    objectives: [
      { id: 'obj-1', description: 'Observe agent negotiation', isCompleted: false, isOptional: false, conceptId: 'negotiation-protocols' },
      { id: 'obj-2', description: 'Set trust parameters', isCompleted: false, isOptional: false, conceptId: 'multi-agent-trust' },
      { id: 'obj-3', description: 'Complete a multi-agent transaction', isCompleted: false, isOptional: false },
      { id: 'obj-4', description: 'Intervene in a negotiation', isCompleted: false, isOptional: false, conceptId: 'human-in-the-loop' },
      { id: 'obj-5', description: 'Build trust with 3 agents', isCompleted: false, isOptional: true },
    ],
    concepts: ['multi-agent-trust', 'negotiation-protocols', 'human-in-the-loop'],
    initialConfig: {
      spendingLimits: { perTransaction: 200, daily: 500, autoApproveThreshold: 50 },
      riskSettings: { maxRiskLevel: 4, requireApprovalAbove: 3 },
    },
  },
]

export const getScenarioById = (id: string): Scenario | undefined =>
  scenarios.find((s) => s.id === id)

export const getScenariosByDifficulty = (difficulty: Scenario['difficulty']): Scenario[] =>
  scenarios.filter((s) => s.difficulty === difficulty)
