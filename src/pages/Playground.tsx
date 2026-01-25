import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SimulationLayout } from '../components/layout'
import { Card, Button, Badge, Input, Slider, Modal, ModalFooter } from '../components/common'
import { WalletDisplay, TransactionList, BalanceChart } from '../components/wallet'
import { TimeControls, EventLog } from '../components/simulation'
import { AgentCard, ConfigPanel, DecisionTree, RiskMeter } from '../components/agent'
import { ProgressTracker } from '../components/education'
import { useStore } from '../store'
import { createDefaultAgentConfig } from '../store/slices/agentSlice'
import type { AgentType, ApprovalRequest, SimulationSpeed, Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

const agentTypes: { type: AgentType; label: string; description: string }[] = [
  { type: 'shopping', label: 'Shopping Agent', description: 'Finds and purchases products' },
  { type: 'subscription', label: 'Subscription Manager', description: 'Optimizes recurring payments' },
  { type: 'billpay', label: 'Bill Pay Agent', description: 'Manages bill payments' },
  { type: 'investment', label: 'Investment Agent', description: 'Makes investment decisions' },
  { type: 'negotiation', label: 'Negotiation Agent', description: 'Negotiates with other agents' },
]

export function Playground() {
  const navigate = useNavigate()
  const {
    wallet,
    agent: agentState,
    simulation: simulationState,
    addAgent,
    updateAgentConfig,
    removeAgent,
    setActiveAgent,
    addTransaction,
    setBalance,
    resetWallet,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    setSpeed,
    advanceTime,
    unlockAchievement,
  } = useStore()

  const [showAddAgent, setShowAddAgent] = useState(false)
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('shopping')
  const [agentName, setAgentName] = useState('')
  const [showConfigId, setShowConfigId] = useState<string | null>(null)
  const [simulationInterval, setSimulationInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    unlockAchievement({
      id: 'playground-explorer',
      name: 'Playground Explorer',
      description: 'Use Playground mode to experiment freely',
      icon: 'box',
      requirement: { type: 'custom', value: 'use_playground' },
    })
  }, [unlockAchievement])

  const handleAddAgent = useCallback(() => {
    if (!agentName.trim()) return

    const config = createDefaultAgentConfig(selectedAgentType, agentName)
    addAgent(config)
    setAgentName('')
    setShowAddAgent(false)
  }, [agentName, selectedAgentType, addAgent])

  const handleStart = useCallback(() => {
    startSimulation()

    const interval = setInterval(() => {
      advanceTime(1000)

      if (Math.random() < 0.1) {
        const amount = Math.floor(Math.random() * 50) + 5
        if (wallet.balance >= amount) {
          addTransaction({
            amount,
            type: 'debit',
            status: 'completed',
            agentId: agentState.activeAgentId || 'playground',
            description: `Playground transaction #${Date.now()}`,
          })
        }
      }
    }, 1000)

    setSimulationInterval(interval)
  }, [startSimulation, advanceTime, addTransaction, wallet.balance, agentState.activeAgentId])

  const handlePause = useCallback(() => {
    pauseSimulation()
  }, [pauseSimulation])

  const handleResume = useCallback(() => {
    resumeSimulation()
  }, [resumeSimulation])

  const handleStop = useCallback(() => {
    stopSimulation()
    if (simulationInterval) {
      clearInterval(simulationInterval)
      setSimulationInterval(null)
    }
  }, [stopSimulation, simulationInterval])

  const handleSpeedChange = useCallback((speed: SimulationSpeed) => {
    setSpeed(speed)
  }, [setSpeed])

  const handleResetWallet = useCallback(() => {
    resetWallet(1000)
  }, [resetWallet])

  const selectedAgent = showConfigId
    ? agentState.agents.find((a) => a.id === showConfigId)
    : null

  return (
    <SimulationLayout
      sidebar={
        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Agents</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddAgent(true)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add
              </Button>
            </div>

            {agentState.agents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No agents configured</p>
                <p className="text-xs mt-1">Add an agent to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agentState.agents.map((agent) => (
                  <div key={agent.id} className="relative">
                    <AgentCard
                      agent={agent}
                      status={agentState.agentStatuses[agent.id] || 'idle'}
                      isActive={agentState.activeAgentId === agent.id}
                      onClick={() => {
                        setActiveAgent(agent.id)
                        setShowConfigId(agent.id)
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAgent(agent.id)
                      }}
                      className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-danger-500 hover:bg-danger-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <ProgressTracker />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Playground</h1>
              <p className="text-sm text-slate-500">
                Explore agentic payments freely
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleResetWallet}>
              Reset Wallet
            </Button>
            <Badge variant={simulationState.isRunning ? 'success' : 'neutral'}>
              {simulationState.isRunning
                ? simulationState.isPaused
                  ? 'Paused'
                  : 'Running'
                : 'Ready'}
            </Badge>
          </div>
        </div>

        <TimeControls
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onSpeedChange={handleSpeedChange}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <WalletDisplay />
          <div className="lg:col-span-2">
            <BalanceChart />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionList />
          <EventLog />
        </div>
      </div>

      <Modal
        isOpen={showAddAgent}
        onClose={() => setShowAddAgent(false)}
        title="Add New Agent"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Agent Name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="My Shopping Agent"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Agent Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {agentTypes.map(({ type, label, description }) => (
                <button
                  key={type}
                  onClick={() => setSelectedAgentType(type)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedAgentType === type
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{label}</p>
                  <p className="text-sm text-slate-500">{description}</p>
                </button>
              ))}
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAddAgent(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddAgent}
              disabled={!agentName.trim()}
            >
              Add Agent
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedAgent}
        onClose={() => setShowConfigId(null)}
        title="Agent Configuration"
        size="lg"
      >
        {selectedAgent && (
          <ConfigPanel
            agent={selectedAgent}
            onUpdate={(updates) => updateAgentConfig(selectedAgent.id, updates)}
            onClose={() => setShowConfigId(null)}
          />
        )}
      </Modal>
    </SimulationLayout>
  )
}
