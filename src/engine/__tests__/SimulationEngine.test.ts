import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../../store'
import { createDefaultAgentConfig } from '../../store/slices/agentSlice'
import { SimulationEngine } from '../SimulationEngine'
import type { Scenario } from '../../types'

function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: 'safr-runtime-test',
    name: 'SAFR Runtime Test',
    description: 'Exercises SAFR guardrails through a live SimulationEngine run',
    type: 'shopping',
    difficulty: 'beginner',
    estimatedDuration: '2 min',
    objectives: [],
    initialBalance: 1000,
    initialConfig: {},
    concepts: [],
    products: [],
    ...overrides,
  }
}

describe('SimulationEngine — SAFR guardrails enforced at runtime', () => {
  beforeEach(() => {
    useStore.getState().resetAgents()
    useStore.getState().resetWallet(1000)
    useStore.getState().clearActionHistory()
  })

  it('blocks a restricted-category purchase before any transaction is recorded', () => {
    const agentConfig = createDefaultAgentConfig('shopping', 'Test Agent')
    useStore.getState().addAgent(agentConfig)

    const engine = new SimulationEngine({ scenario: buildScenario() })
    engine.initialize()

    // Accessing the private handler directly drives the real production code path
    // (GuardrailValidator.validateMandate) without depending on the rAF-based clock.
    ;(engine as any).evaluateProductPurchase({
      id: 'p1',
      name: 'Suspicious Bet',
      category: 'Gambling',
      merchantId: 'casino-x',
      price: 10,
    })

    const { wallet, agent } = useStore.getState()
    expect(wallet.transactions).toHaveLength(0)
    const lastAction = agent.actionHistory[agent.actionHistory.length - 1]
    expect(lastAction.description).toContain('Rejected by Guardrail')
  })

  it('routes an over-threshold purchase to human-in-the-loop approval instead of auto-executing', () => {
    const agentConfig = createDefaultAgentConfig('shopping', 'Test Agent')
    useStore.getState().addAgent(agentConfig)

    let approvalRequest: { id: string; reasoning: string } | null = null
    const engine = new SimulationEngine({
      scenario: buildScenario(),
      onApprovalRequired: (request) => {
        approvalRequest = request
      },
    })
    engine.initialize()

    // Seed a prior transaction with this merchant so the "new merchant" mandate
    // doesn't mask the confirmation-threshold mandate under test.
    useStore.getState().addTransaction({
      amount: 5,
      type: 'debit',
      status: 'completed',
      agentId: agentConfig.id,
      description: 'prior purchase',
      merchantId: 'FairPrice',
    })

    ;(engine as any).evaluateProductPurchase({
      id: 'p2',
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      merchantId: 'FairPrice',
      price: 129,
    })

    expect(approvalRequest).not.toBeNull()
    expect(approvalRequest!.reasoning).toContain('exceeds autonomous mandate threshold')

    const { wallet } = useStore.getState()
    // Still only the seeded transaction — the guardrailed purchase must not auto-execute.
    expect(wallet.transactions).toHaveLength(1)

    engine.approveRequest(approvalRequest!.id)

    const afterApproval = useStore.getState().wallet
    expect(afterApproval.transactions).toHaveLength(2)
  })

  it('auto-executes a purchase that clears every SAFR mandate', () => {
    const agentConfig = createDefaultAgentConfig('shopping', 'Test Agent')
    // A brand-new merchant with no transaction history would otherwise trip the
    // new-merchant and cooldown mandates first; disable just those two so this
    // test isolates the "everything passes" path.
    agentConfig.guardrails.requireVerificationForNewMerchants.value = false
    agentConfig.guardrails.transactionCooldownSeconds.value = 0
    useStore.getState().addAgent(agentConfig)

    const engine = new SimulationEngine({ scenario: buildScenario() })
    engine.initialize()

    ;(engine as any).evaluateProductPurchase({
      id: 'p3',
      name: 'Kaya Spread',
      category: 'Groceries',
      merchantId: 'FairPrice',
      price: 6.8,
    })

    const { wallet } = useStore.getState()
    expect(wallet.transactions).toHaveLength(1)
    expect(wallet.transactions[0].status).toBe('completed')
    expect(wallet.transactions[0].amount).toBe(6.8)
  })
})
