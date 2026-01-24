import { StateCreator } from 'zustand'
import type { AgentState, AgentConfig, AgentStatus, AgentAction, StoreState } from '../../types'

export interface AgentSlice {
  agent: AgentState
  addAgent: (config: AgentConfig) => void
  updateAgentConfig: (id: string, updates: Partial<AgentConfig>) => void
  removeAgent: (id: string) => void
  setActiveAgent: (id: string | null) => void
  setAgentStatus: (id: string, status: AgentStatus) => void
  addAgentAction: (action: Omit<AgentAction, 'id' | 'timestamp'>) => void
  clearActionHistory: () => void
  resetAgents: () => void
}

const defaultSpendingLimits = {
  perTransaction: 100,
  daily: 500,
  autoApproveThreshold: 25,
}

const defaultRiskSettings = {
  maxRiskLevel: 5,
  requireApprovalAbove: 3,
}

const initialAgentState: AgentState = {
  agents: [],
  activeAgentId: null,
  agentStatuses: {},
  actionHistory: [],
}

export const createAgentSlice: StateCreator<StoreState & AgentSlice, [], [], AgentSlice> = (set) => ({
  agent: { ...initialAgentState },

  addAgent: (config) => {
    set((state) => ({
      agent: {
        ...state.agent,
        agents: [...state.agent.agents, config],
        agentStatuses: {
          ...state.agent.agentStatuses,
          [config.id]: 'idle',
        },
      },
    }))
  },

  updateAgentConfig: (id, updates) => {
    set((state) => ({
      agent: {
        ...state.agent,
        agents: state.agent.agents.map((agent) =>
          agent.id === id ? { ...agent, ...updates } : agent
        ),
      },
    }))
  },

  removeAgent: (id) => {
    set((state) => {
      const { [id]: _, ...restStatuses } = state.agent.agentStatuses
      return {
        agent: {
          ...state.agent,
          agents: state.agent.agents.filter((a) => a.id !== id),
          agentStatuses: restStatuses,
          activeAgentId: state.agent.activeAgentId === id ? null : state.agent.activeAgentId,
        },
      }
    })
  },

  setActiveAgent: (id) => {
    set((state) => ({
      agent: { ...state.agent, activeAgentId: id },
    }))
  },

  setAgentStatus: (id, status) => {
    set((state) => ({
      agent: {
        ...state.agent,
        agentStatuses: {
          ...state.agent.agentStatuses,
          [id]: status,
        },
      },
    }))
  },

  addAgentAction: (action) => {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newAction: AgentAction = {
      ...action,
      id,
      timestamp: Date.now(),
    }

    set((state) => ({
      agent: {
        ...state.agent,
        actionHistory: [...state.agent.actionHistory, newAction],
      },
    }))
  },

  clearActionHistory: () => {
    set((state) => ({
      agent: { ...state.agent, actionHistory: [] },
    }))
  },

  resetAgents: () => {
    set({ agent: { ...initialAgentState } })
  },
})

export const createDefaultAgentConfig = (type: AgentConfig['type'], name: string): AgentConfig => ({
  id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name,
  type,
  enabled: true,
  spendingLimits: { ...defaultSpendingLimits },
  riskSettings: { ...defaultRiskSettings },
  allowedCategories: [],
  blockedMerchants: [],
  customRules: [],
})
