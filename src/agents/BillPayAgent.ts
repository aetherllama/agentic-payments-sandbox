import { BaseAgent, AgentDecision, AgentContext } from './BaseAgent'
import type { AgentConfig, Bill, ApprovalRequest, DecisionNode } from '../types'

export class BillPayAgent extends BaseAgent {
  private priorityOrder: Bill['priority'][] = ['essential', 'important', 'optional']
  private autoPayEssential: boolean = true

  constructor(config: AgentConfig) {
    super(config)
  }

  setAutoPayEssential(value: boolean): void {
    this.autoPayEssential = value
  }

  async evaluate(bill: Bill, context: AgentContext): Promise<AgentDecision> {
    this.setStatus('thinking')

    const decisionTree = this.buildBillDecisionTree(bill, context)

    this.addAction({
      type: 'evaluate',
      description: `Evaluating bill: ${bill.name} - $${bill.amount} (${bill.priority})`,
      data: { bill, context },
    })

    if (bill.isPaid) {
      return {
        action: 'reject',
        reason: 'Bill is already paid',
        riskLevel: 0,
        decisionTree,
      }
    }

    if (context.balance < bill.amount) {
      return {
        action: 'reject',
        reason: `Insufficient balance. Need $${bill.amount}, have $${context.balance}`,
        riskLevel: 5,
        decisionTree,
      }
    }

    const daysUntilDue = Math.ceil((bill.dueDate - Date.now()) / (1000 * 60 * 60 * 24))

    if (bill.priority === 'essential') {
      if (this.autoPayEssential) {
        return {
          action: 'approve',
          reason: `Essential bill auto-approved. Due in ${daysUntilDue} days.`,
          riskLevel: 1,
          decisionTree,
        }
      }
      return {
        action: 'request_approval',
        reason: `Essential bill due in ${daysUntilDue} days. Amount: $${bill.amount}`,
        riskLevel: 2,
        decisionTree,
      }
    }

    if (bill.priority === 'important') {
      if (daysUntilDue <= 3) {
        return {
          action: 'request_approval',
          reason: `Important bill due soon (${daysUntilDue} days). Amount: $${bill.amount}`,
          riskLevel: 3,
          decisionTree,
        }
      }
      return {
        action: 'request_approval',
        reason: `Important bill due in ${daysUntilDue} days. Amount: $${bill.amount}`,
        riskLevel: 2,
        decisionTree,
      }
    }

    const remainingAfterBill = context.balance - bill.amount
    const remainingPercentage = (remainingAfterBill / context.balance) * 100

    if (remainingPercentage < 20) {
      return {
        action: 'request_approval',
        reason: `Optional bill. Paying would leave only ${remainingPercentage.toFixed(1)}% of balance.`,
        riskLevel: 4,
        decisionTree,
      }
    }

    return {
      action: 'request_approval',
      reason: `Optional bill due in ${daysUntilDue} days. Amount: $${bill.amount}`,
      riskLevel: 3,
      decisionTree,
    }
  }

  private buildBillDecisionTree(bill: Bill, context: AgentContext): DecisionNode {
    const daysUntilDue = Math.ceil((bill.dueDate - Date.now()) / (1000 * 60 * 60 * 24))
    const hasFunds = context.balance >= bill.amount

    return {
      id: 'root',
      type: 'condition',
      label: 'Bill Payment Decision',
      isActive: true,
      children: [
        {
          id: 'paid_check',
          type: 'condition',
          label: 'Already Paid?',
          result: !bill.isPaid ? 'pass' : 'fail',
          children: !bill.isPaid
            ? [
                {
                  id: 'funds_check',
                  type: 'condition',
                  label: `Sufficient Funds? ($${context.balance})`,
                  result: hasFunds ? 'pass' : 'fail',
                  children: hasFunds
                    ? [
                        {
                          id: 'priority_check',
                          type: 'condition',
                          label: `Priority: ${bill.priority}`,
                          result: 'pass',
                          children: [
                            {
                              id: 'due_date_check',
                              type: 'condition',
                              label: `Due in ${daysUntilDue} days`,
                              result: daysUntilDue <= 3 ? 'pending' : 'pass',
                              children: [
                                {
                                  id: 'outcome',
                                  type: 'outcome',
                                  label:
                                    bill.priority === 'essential' && this.autoPayEssential
                                      ? 'Auto-Pay'
                                      : 'Request Approval',
                                  result:
                                    bill.priority === 'essential' && this.autoPayEssential
                                      ? 'pass'
                                      : 'pending',
                                },
                              ],
                            },
                          ],
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

  createApprovalRequest(bill: Bill, decision: AgentDecision): ApprovalRequest {
    return {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      type: 'transaction',
      amount: bill.amount,
      description: `Pay Bill: ${bill.name}`,
      reasoning: decision.reason,
      riskLevel: decision.riskLevel,
      decisionTree: decision.decisionTree,
      createdAt: Date.now(),
    }
  }

  scheduleBills(bills: Bill[]): Bill[] {
    return [...bills].sort((a, b) => {
      const priorityA = this.priorityOrder.indexOf(a.priority)
      const priorityB = this.priorityOrder.indexOf(b.priority)

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      return a.dueDate - b.dueDate
    })
  }

  getTotalDue(bills: Bill[]): number {
    return bills.filter((b) => !b.isPaid).reduce((total, b) => total + b.amount, 0)
  }

  getUpcomingBills(bills: Bill[], daysAhead: number = 7): Bill[] {
    const futureDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000
    return bills.filter((b) => !b.isPaid && b.dueDate <= futureDate)
  }
}
