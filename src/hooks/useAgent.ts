import { useMemo, useCallback } from 'react'
import { useStore } from '../store'
import { ShoppingAgent, SubscriptionAgent, BillPayAgent, InvestmentAgent } from '../agents'
import type { AgentConfig, AgentType } from '../types'

export function useAgent(agentId?: string) {
  const { agent, updateAgentConfig, setAgentStatus, addAgentAction } = useStore()

  const activeAgent = useMemo(() => {
    if (agentId) {
      return agent.agents.find((a) => a.id === agentId)
    }
    if (agent.activeAgentId) {
      return agent.agents.find((a) => a.id === agent.activeAgentId)
    }
    return agent.agents[0]
  }, [agent.agents, agent.activeAgentId, agentId])

  const agentStatus = useMemo(() => {
    if (!activeAgent) return 'idle'
    return agent.agentStatuses[activeAgent.id] || 'idle'
  }, [activeAgent, agent.agentStatuses])

  const agentInstance = useMemo(() => {
    if (!activeAgent) return null

    switch (activeAgent.type) {
      case 'shopping':
        return new ShoppingAgent(activeAgent)
      case 'subscription':
        return new SubscriptionAgent(activeAgent)
      case 'billpay':
        return new BillPayAgent(activeAgent)
      case 'investment':
        return new InvestmentAgent(activeAgent)
      default:
        return null
    }
  }, [activeAgent])

  const updateConfig = useCallback(
    (updates: Partial<AgentConfig>) => {
      if (activeAgent) {
        updateAgentConfig(activeAgent.id, updates)
      }
    },
    [activeAgent, updateAgentConfig]
  )

  const setStatus = useCallback(
    (status: AgentConfig['type']) => {
      if (activeAgent) {
        setAgentStatus(activeAgent.id, status as any)
      }
    },
    [activeAgent, setAgentStatus]
  )

  const logAction = useCallback(
    (type: 'search' | 'evaluate' | 'decide' | 'execute' | 'wait' | 'complete', description: string, data?: Record<string, unknown>) => {
      if (activeAgent) {
        addAgentAction({
          agentId: activeAgent.id,
          type,
          description,
          data,
        })
      }
    },
    [activeAgent, addAgentAction]
  )

  return {
    agent: activeAgent,
    status: agentStatus,
    instance: agentInstance,
    allAgents: agent.agents,
    actionHistory: agent.actionHistory,
    updateConfig,
    setStatus,
    logAction,
  }
}
