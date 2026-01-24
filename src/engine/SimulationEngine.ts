import { TimeController } from './TimeController'
import { EventQueue } from './EventQueue'
import type { SimulationEvent, SimulationSpeed, Scenario, ApprovalRequest } from '../types'
import { useStore } from '../store'

export interface SimulationEngineConfig {
  scenario: Scenario
  onEventProcessed?: (event: SimulationEvent) => void
  onApprovalRequired?: (request: ApprovalRequest) => void
  onSimulationComplete?: () => void
  onError?: (error: Error) => void
}

export class SimulationEngine {
  private timeController: TimeController
  private eventQueue: EventQueue
  private config: SimulationEngineConfig
  private isInitialized: boolean = false
  private approvalPending: ApprovalRequest | null = null

  constructor(config: SimulationEngineConfig) {
    this.config = config
    this.eventQueue = new EventQueue()
    this.timeController = new TimeController({
      speed: 1,
      onTick: this.handleTick.bind(this),
      tickInterval: 100,
    })
  }

  initialize(): void {
    if (this.isInitialized) return

    const store = useStore.getState()
    const { scenario } = this.config

    store.resetWallet(scenario.initialBalance)
    store.clearActionHistory()
    store.loadScenario(scenario)
    store.startSimulation()

    this.scheduleInitialEvents()
    this.isInitialized = true
  }

  private scheduleInitialEvents(): void {
    const { scenario } = this.config
    const baseTime = Date.now()

    if (scenario.type === 'shopping' && scenario.products) {
      scenario.products.forEach((product, index) => {
        this.eventQueue.addEvent({
          scheduledTime: baseTime + (index + 1) * 5000,
          type: 'agent_action',
          priority: 5,
          payload: {
            action: 'evaluate_product',
            productId: product.id,
            product,
          },
        })
      })
    }

    if (scenario.type === 'billpay' && scenario.bills) {
      scenario.bills.forEach((bill) => {
        this.eventQueue.addEvent({
          scheduledTime: bill.dueDate,
          type: 'bill_due',
          priority: 10,
          payload: { billId: bill.id, bill },
        })
      })
    }

    if (scenario.type === 'subscription' && scenario.subscriptions) {
      scenario.subscriptions.forEach((sub) => {
        this.eventQueue.addEvent({
          scheduledTime: sub.renewalDate,
          type: 'agent_action',
          priority: 7,
          payload: {
            action: 'review_subscription',
            subscriptionId: sub.id,
            subscription: sub,
          },
        })
      })
    }
  }

  start(): void {
    if (!this.isInitialized) {
      this.initialize()
    }
    this.timeController.start()
    useStore.getState().startSimulation()
  }

  pause(): void {
    this.timeController.pause()
    useStore.getState().pauseSimulation()
  }

  resume(): void {
    if (this.approvalPending) return
    this.timeController.resume()
    useStore.getState().resumeSimulation()
  }

  stop(): void {
    this.timeController.stop()
    useStore.getState().stopSimulation()
  }

  setSpeed(speed: SimulationSpeed): void {
    this.timeController.setSpeed(speed)
    useStore.getState().setSpeed(speed)
  }

  getSpeed(): SimulationSpeed {
    return this.timeController.getSpeed()
  }

  private handleTick(deltaTime: number, currentTime: number): void {
    if (this.approvalPending) return

    const store = useStore.getState()
    store.advanceTime(deltaTime)

    const event = this.eventQueue.getNextEvent(currentTime)
    if (event) {
      this.processEvent(event)
    }

    this.checkObjectives()
  }

  private processEvent(event: SimulationEvent): void {
    const store = useStore.getState()

    this.eventQueue.processEvent(event.id)
    store.processEvent(event.id)

    switch (event.type) {
      case 'agent_action':
        this.handleAgentAction(event)
        break
      case 'bill_due':
        this.handleBillDue(event)
        break
      case 'market_change':
        this.handleMarketChange(event)
        break
      case 'merchant_offer':
        this.handleMerchantOffer(event)
        break
    }

    this.config.onEventProcessed?.(event)
  }

  private handleAgentAction(event: SimulationEvent): void {
    const store = useStore.getState()
    const { payload } = event
    const action = payload.action as string

    store.addAgentAction({
      agentId: 'main',
      type: 'evaluate',
      description: `Evaluating action: ${action}`,
      data: payload,
    })

    if (action === 'evaluate_product' && payload.product) {
      this.evaluateProductPurchase(payload.product as any)
    } else if (action === 'review_subscription' && payload.subscription) {
      this.reviewSubscription(payload.subscription as any)
    }
  }

  private evaluateProductPurchase(product: any): void {
    const store = useStore.getState()
    const { wallet, agent } = store
    const activeAgent = agent.agents[0]

    if (!activeAgent) return

    const { spendingLimits } = activeAgent
    const price = product.price

    store.addAgentAction({
      agentId: activeAgent.id,
      type: 'decide',
      description: `Checking if $${price} purchase is within limits`,
      data: { price, limits: spendingLimits },
    })

    if (price > spendingLimits.perTransaction) {
      store.addAgentAction({
        agentId: activeAgent.id,
        type: 'complete',
        description: `Rejected: Price $${price} exceeds per-transaction limit of $${spendingLimits.perTransaction}`,
      })
      return
    }

    if (wallet.dailySpent + price > spendingLimits.daily) {
      store.addAgentAction({
        agentId: activeAgent.id,
        type: 'complete',
        description: `Rejected: Would exceed daily limit of $${spendingLimits.daily}`,
      })
      return
    }

    if (price <= spendingLimits.autoApproveThreshold) {
      this.executePurchase(product, activeAgent.id)
    } else {
      this.requestApproval({
        id: `approval_${Date.now()}`,
        agentId: activeAgent.id,
        type: 'transaction',
        amount: price,
        description: `Purchase: ${product.name}`,
        reasoning: `The item costs $${price}, which exceeds the auto-approval threshold of $${spendingLimits.autoApproveThreshold}. Manual approval required.`,
        riskLevel: this.calculateRiskLevel(price, spendingLimits.perTransaction),
        decisionTree: this.buildDecisionTree(product, activeAgent),
        createdAt: Date.now(),
        merchantName: product.merchantId,
        productName: product.name,
      })
    }
  }

  private reviewSubscription(subscription: any): void {
    const store = useStore.getState()

    store.addAgentAction({
      agentId: 'main',
      type: 'evaluate',
      description: `Reviewing subscription: ${subscription.name}`,
      data: subscription,
    })

    if (subscription.usageScore < 0.3 && subscription.alternatives?.length > 0) {
      const bestAlternative = subscription.alternatives[0]

      this.requestApproval({
        id: `approval_${Date.now()}`,
        agentId: 'main',
        type: 'subscription_change',
        amount: bestAlternative.savings,
        description: `Switch from ${subscription.name} to ${bestAlternative.name}`,
        reasoning: `Low usage score (${Math.round(subscription.usageScore * 100)}%). Alternative saves $${bestAlternative.savings}/month.`,
        riskLevel: 2,
        decisionTree: {
          id: 'root',
          type: 'condition',
          label: 'Review Subscription',
          children: [],
        },
        createdAt: Date.now(),
      })
    }
  }

  private executePurchase(product: any, agentId: string): void {
    const store = useStore.getState()

    store.addTransaction({
      amount: product.price,
      type: 'debit',
      status: 'completed',
      agentId,
      description: `Purchased: ${product.name}`,
      merchantId: product.merchantId,
      merchantName: product.merchantId,
      category: product.category,
    })

    store.addAgentAction({
      agentId,
      type: 'execute',
      description: `Completed purchase of ${product.name} for $${product.price}`,
    })

    store.incrementTransactions()
  }

  private handleBillDue(event: SimulationEvent): void {
    const store = useStore.getState()
    const bill = event.payload.bill as any

    store.addAgentAction({
      agentId: 'main',
      type: 'evaluate',
      description: `Bill due: ${bill.name} - $${bill.amount}`,
      data: bill,
    })

    if (bill.priority === 'essential') {
      store.addTransaction({
        amount: bill.amount,
        type: 'debit',
        status: 'completed',
        agentId: 'main',
        description: `Paid bill: ${bill.name}`,
        category: bill.category,
      })
    } else {
      this.requestApproval({
        id: `approval_${Date.now()}`,
        agentId: 'main',
        type: 'transaction',
        amount: bill.amount,
        description: `Pay bill: ${bill.name}`,
        reasoning: `Non-essential bill. Current balance: $${store.wallet.balance}`,
        riskLevel: 3,
        decisionTree: {
          id: 'root',
          type: 'condition',
          label: 'Bill Payment',
          children: [],
        },
        createdAt: Date.now(),
      })
    }
  }

  private handleMarketChange(event: SimulationEvent): void {
    const store = useStore.getState()
    store.addAgentAction({
      agentId: 'main',
      type: 'evaluate',
      description: 'Analyzing market changes',
      data: event.payload,
    })
  }

  private handleMerchantOffer(event: SimulationEvent): void {
    const store = useStore.getState()
    store.addAgentAction({
      agentId: 'main',
      type: 'evaluate',
      description: 'Evaluating merchant offer',
      data: event.payload,
    })
  }

  private requestApproval(request: ApprovalRequest): void {
    this.approvalPending = request
    this.pause()

    const store = useStore.getState()
    store.setAgentStatus(request.agentId, 'waiting_approval')

    this.config.onApprovalRequired?.(request)
  }

  approveRequest(requestId: string): void {
    if (!this.approvalPending || this.approvalPending.id !== requestId) return

    const request = this.approvalPending
    const store = useStore.getState()

    store.addTransaction({
      amount: request.amount,
      type: 'debit',
      status: 'completed',
      agentId: request.agentId,
      description: request.description,
      reasoning: `Approved by user: ${request.reasoning}`,
    })

    store.setAgentStatus(request.agentId, 'executing')
    store.addAgentAction({
      agentId: request.agentId,
      type: 'execute',
      description: `User approved: ${request.description}`,
    })

    this.approvalPending = null
    this.resume()
  }

  rejectRequest(requestId: string): void {
    if (!this.approvalPending || this.approvalPending.id !== requestId) return

    const request = this.approvalPending
    const store = useStore.getState()

    store.setAgentStatus(request.agentId, 'idle')
    store.addAgentAction({
      agentId: request.agentId,
      type: 'complete',
      description: `User rejected: ${request.description}`,
    })

    this.approvalPending = null
    this.resume()
  }

  private calculateRiskLevel(amount: number, limit: number): number {
    const ratio = amount / limit
    if (ratio < 0.25) return 1
    if (ratio < 0.5) return 2
    if (ratio < 0.75) return 3
    if (ratio < 1) return 4
    return 5
  }

  private buildDecisionTree(product: any, agent: any): any {
    return {
      id: 'root',
      type: 'condition',
      label: 'Purchase Decision',
      isActive: true,
      children: [
        {
          id: 'price_check',
          type: 'condition',
          label: `Price: $${product.price}`,
          result: 'pass',
          children: [
            {
              id: 'limit_check',
              type: 'condition',
              label: `Under $${agent.spendingLimits.perTransaction} limit?`,
              result: product.price <= agent.spendingLimits.perTransaction ? 'pass' : 'fail',
            },
            {
              id: 'auto_approve',
              type: 'condition',
              label: `Under $${agent.spendingLimits.autoApproveThreshold} auto-approve?`,
              result: product.price <= agent.spendingLimits.autoApproveThreshold ? 'pass' : 'pending',
            },
          ],
        },
      ],
    }
  }

  private checkObjectives(): void {
    const store = useStore.getState()
    const { currentObjectives, activeScenario } = store.scenario

    if (!activeScenario) return

    const allRequired = currentObjectives.filter((o) => !o.isOptional)
    const completedRequired = allRequired.filter((o) => o.isCompleted)

    if (completedRequired.length === allRequired.length && allRequired.length > 0) {
      this.stop()
      store.markScenarioComplete()
      this.config.onSimulationComplete?.()
    }
  }

  getCurrentApprovalRequest(): ApprovalRequest | null {
    return this.approvalPending
  }

  addEvent(event: Omit<SimulationEvent, 'id' | 'processed'>): string {
    return this.eventQueue.addEvent(event)
  }

  getStats() {
    return {
      currentTime: this.timeController.getCurrentTime(),
      elapsedTime: this.timeController.getElapsedTime(),
      speed: this.timeController.getSpeed(),
      isActive: this.timeController.isActive(),
      events: this.eventQueue.getStats(),
    }
  }

  reset(): void {
    this.stop()
    this.eventQueue.reset()
    this.timeController.reset()
    this.approvalPending = null
    this.isInitialized = false
  }
}
