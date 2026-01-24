import type { Concept } from '../../types'

export const concepts: Concept[] = [
  {
    id: 'spending-limits',
    name: 'Spending Limits',
    category: 'Authorization',
    description: 'Maximum amounts an agent can spend per transaction or day.',
    detailedExplanation:
      'Spending limits are fundamental controls that prevent AI agents from making purchases beyond predetermined thresholds. They include per-transaction limits (maximum for a single purchase) and daily limits (cumulative spending cap). These limits protect against runaway spending and unauthorized large transactions.',
    examples: [
      'Per-transaction limit of $100 prevents agent from buying items over $100',
      'Daily limit of $500 caps total spending regardless of individual transaction sizes',
      'Combined limits: $50 per transaction, $200 daily',
    ],
    relatedConcepts: ['auto-approval', 'human-in-the-loop'],
    icon: 'shield',
  },
  {
    id: 'auto-approval',
    name: 'Auto-Approval Threshold',
    category: 'Authorization',
    description: 'Transactions below this amount are approved automatically without human review.',
    detailedExplanation:
      'Auto-approval thresholds enable agents to act autonomously for low-risk, routine transactions. This balances efficiency (no human bottleneck for small purchases) with control (larger transactions require oversight). The threshold should be set based on risk tolerance and typical transaction patterns.',
    examples: [
      'Coffee under $10: auto-approved',
      'Office supplies under $25: auto-approved',
      'Software subscription over $100: requires approval',
    ],
    relatedConcepts: ['spending-limits', 'human-in-the-loop', 'risk-assessment'],
    icon: 'check-circle',
  },
  {
    id: 'human-in-the-loop',
    name: 'Human-in-the-Loop',
    category: 'Authorization',
    description: 'Requiring human approval for certain decisions before an agent can proceed.',
    detailedExplanation:
      'Human-in-the-loop (HITL) is a critical safety mechanism where high-stakes or unusual transactions pause for human review. The agent presents its reasoning and recommended action, but the final decision rests with a human. This prevents costly mistakes while still leveraging AI efficiency for routine tasks.',
    examples: [
      'Large purchases requiring manager approval',
      'First-time vendor payments needing verification',
      'Transactions flagged as potentially fraudulent',
    ],
    relatedConcepts: ['auto-approval', 'risk-assessment', 'decision-transparency'],
    icon: 'user-check',
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    category: 'Decision Making',
    description: 'Evaluating the potential negative outcomes of a financial decision.',
    detailedExplanation:
      'Risk assessment involves analyzing multiple factors to determine how risky a transaction is. Factors include: transaction amount relative to limits, merchant reputation, category restrictions, historical patterns, and timing. Higher risk scores trigger additional scrutiny or require human approval.',
    examples: [
      'Low risk: Regular grocery purchase from known store',
      'Medium risk: New vendor, moderate amount',
      'High risk: Large transaction, unknown merchant, unusual timing',
    ],
    relatedConcepts: ['human-in-the-loop', 'trust-scoring', 'fraud-detection'],
    icon: 'alert-triangle',
  },
  {
    id: 'decision-transparency',
    name: 'Decision Transparency',
    category: 'Decision Making',
    description: 'Agents explaining their reasoning process for each financial decision.',
    detailedExplanation:
      'Transparent decision-making means the agent can explain why it made or recommended a particular choice. This includes showing the decision tree, listing factors considered, and explaining how different inputs influenced the outcome. Transparency builds trust and enables effective oversight.',
    examples: [
      'Showing which rules were evaluated',
      'Explaining why a purchase was approved or flagged',
      'Displaying confidence levels for recommendations',
    ],
    relatedConcepts: ['human-in-the-loop', 'audit-trail'],
    icon: 'eye',
  },
  {
    id: 'reservation-system',
    name: 'Fund Reservation',
    category: 'Transactions',
    description: 'Temporarily holding funds to ensure availability before completing a transaction.',
    detailedExplanation:
      'Fund reservation (also called authorization hold) temporarily earmarks money for a pending transaction. This prevents overdrafts when multiple agents or processes might access the same funds. Reserved amounts reduce available balance until the transaction completes or the hold expires.',
    examples: [
      'Hotel pre-authorization for incidentals',
      'Gas station hold before final pump amount',
      'Multi-step purchase processes',
    ],
    relatedConcepts: ['spending-limits', 'transaction-lifecycle'],
    icon: 'lock',
  },
  {
    id: 'recurring-payments',
    name: 'Recurring Payments',
    category: 'Subscriptions',
    description: 'Automated periodic payments that repeat on a schedule.',
    detailedExplanation:
      'Recurring payments are automated transactions that happen at regular intervals. AI agents managing subscriptions should track: payment schedules, usage patterns, available alternatives, and renewal dates. Proactive management can identify cost-saving opportunities and prevent unwanted renewals.',
    examples: [
      'Monthly SaaS subscriptions',
      'Annual insurance premiums',
      'Weekly service charges',
    ],
    relatedConcepts: ['subscription-optimization', 'cost-analysis'],
    icon: 'refresh-cw',
  },
  {
    id: 'subscription-optimization',
    name: 'Subscription Optimization',
    category: 'Subscriptions',
    description: 'Analyzing usage patterns to recommend cost-effective subscription changes.',
    detailedExplanation:
      'Subscription optimization involves comparing usage against cost to identify inefficiencies. Agents analyze metrics like login frequency, feature utilization, and comparable alternatives. They can recommend downgrades, plan changes, or cancellations to reduce costs while maintaining needed functionality.',
    examples: [
      'Downgrade underused premium tier',
      'Cancel dormant subscriptions',
      'Switch to annual billing for savings',
    ],
    relatedConcepts: ['recurring-payments', 'cost-analysis', 'usage-tracking'],
    icon: 'trending-down',
  },
  {
    id: 'bill-prioritization',
    name: 'Bill Prioritization',
    category: 'Bill Pay',
    description: 'Ordering bill payments based on importance, due dates, and consequences.',
    detailedExplanation:
      'When funds are limited, agents must prioritize which bills to pay first. Priority factors include: essential vs. optional services, late payment penalties, impact on credit, and due date urgency. Agents should communicate prioritization logic and flag any bills that cannot be covered.',
    examples: [
      'Rent/mortgage first (housing essential)',
      'Utilities second (service cutoff risk)',
      'Subscriptions last (can be paused)',
    ],
    relatedConcepts: ['recurring-payments', 'cash-flow-management'],
    icon: 'list-ordered',
  },
  {
    id: 'investment-risk-controls',
    name: 'Investment Risk Controls',
    category: 'Investment',
    description: 'Safeguards limiting exposure and volatility in automated investment decisions.',
    detailedExplanation:
      'Investment agents need strict controls given the potential for significant losses. Controls include: maximum position sizes, asset class restrictions, volatility limits, and mandatory human approval for high-risk trades. These prevent excessive concentration and protect against market swings.',
    examples: [
      'Max 5% of portfolio in single stock',
      'No cryptocurrency without approval',
      'Required rebalancing when allocation drifts',
    ],
    relatedConcepts: ['risk-assessment', 'human-in-the-loop', 'portfolio-management'],
    icon: 'trending-up',
  },
  {
    id: 'multi-agent-trust',
    name: 'Multi-Agent Trust',
    category: 'Multi-Agent',
    description: 'How agents establish and maintain trust when transacting with other agents.',
    detailedExplanation:
      'When multiple AI agents interact for transactions, trust must be established programmatically. Trust scoring considers: transaction history, reputation systems, verification credentials, and past performance. Trust levels determine transaction limits and approval requirements between agents.',
    examples: [
      'New agent partner: low trust, small limits',
      'Established partner: higher trust, larger limits',
      'Verified marketplace agent: immediate trust',
    ],
    relatedConcepts: ['risk-assessment', 'negotiation-protocols'],
    icon: 'users',
  },
  {
    id: 'negotiation-protocols',
    name: 'Negotiation Protocols',
    category: 'Multi-Agent',
    description: 'Standardized methods for agents to negotiate prices and terms.',
    detailedExplanation:
      'Agent-to-agent negotiation follows defined protocols for proposing, countering, and accepting offers. Key elements include: initial offer strategies, acceptable ranges, escalation rules, and timeout handling. Good protocols maximize value while preventing deadlocks.',
    examples: [
      'Starting offer at 20% below ask',
      'Maximum 3 counter-offers before walking away',
      'Accept if within 5% of target price',
    ],
    relatedConcepts: ['multi-agent-trust', 'transaction-optimization'],
    icon: 'message-square',
  },
]

export const getConceptById = (id: string): Concept | undefined =>
  concepts.find((c) => c.id === id)

export const getConceptsByCategory = (category: string): Concept[] =>
  concepts.filter((c) => c.category === category)

export const getAllCategories = (): string[] =>
  [...new Set(concepts.map((c) => c.category))]
