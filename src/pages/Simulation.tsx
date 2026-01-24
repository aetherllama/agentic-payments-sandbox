import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SimulationLayout } from '../components/layout'
import { Card, Button, Badge, Modal, ModalFooter } from '../components/common'
import { WalletDisplay, TransactionList } from '../components/wallet'
import { TimeControls, EventLog } from '../components/simulation'
import { AgentCard, ConfigPanel, DecisionTree, RiskBar } from '../components/agent'
import { ConceptCard } from '../components/education'
import { useStore } from '../store'
import { SimulationEngine } from '../engine'
import { getScenarioById } from '../data/scenarios'
import { getConceptById } from '../data/concepts'
import { createDefaultAgentConfig } from '../store/slices/agentSlice'
import type { ApprovalRequest, SimulationSpeed } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

export function Simulation() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const engineRef = useRef<SimulationEngine | null>(null)

  const {
    loadScenario,
    scenario: scenarioState,
    agent: agentState,
    simulation: simulationState,
    addAgent,
    updateAgentConfig,
    setAgentStatus,
    completeObjective,
    learnConcept,
  } = useStore()

  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null)

  const scenario = scenarioId ? getScenarioById(scenarioId) : null

  useEffect(() => {
    if (!scenario) {
      navigate('/')
      return
    }

    loadScenario(scenario)

    const agentConfig = createDefaultAgentConfig(scenario.type, `${scenario.name} Agent`)
    if (scenario.initialConfig) {
      Object.assign(agentConfig, scenario.initialConfig)
    }
    addAgent(agentConfig)

    engineRef.current = new SimulationEngine({
      scenario,
      onApprovalRequired: (request) => {
        setApprovalRequest(request)
        completeObjective('obj-3')
      },
      onSimulationComplete: () => {
        scenario.concepts.forEach((conceptId) => {
          learnConcept(conceptId)
        })
      },
    })

    return () => {
      engineRef.current?.stop()
      engineRef.current = null
    }
  }, [scenarioId])

  const handleStart = useCallback(() => {
    engineRef.current?.start()
    completeObjective('obj-1')
    completeObjective('obj-2')
  }, [completeObjective])

  const handlePause = useCallback(() => {
    engineRef.current?.pause()
  }, [])

  const handleResume = useCallback(() => {
    engineRef.current?.resume()
  }, [])

  const handleStop = useCallback(() => {
    engineRef.current?.stop()
  }, [])

  const handleSpeedChange = useCallback((speed: SimulationSpeed) => {
    engineRef.current?.setSpeed(speed)
  }, [])

  const handleApprove = useCallback(() => {
    if (approvalRequest) {
      engineRef.current?.approveRequest(approvalRequest.id)
      setApprovalRequest(null)
      completeObjective('obj-4')
    }
  }, [approvalRequest, completeObjective])

  const handleReject = useCallback(() => {
    if (approvalRequest) {
      engineRef.current?.rejectRequest(approvalRequest.id)
      setApprovalRequest(null)
      completeObjective('obj-5')
    }
  }, [approvalRequest, completeObjective])

  const handleBack = useCallback(() => {
    engineRef.current?.stop()
    navigate('/')
  }, [navigate])

  const activeAgent = agentState.agents[0]
  const activeStatus = activeAgent ? agentState.agentStatuses[activeAgent.id] : 'idle'

  if (!scenario) {
    return null
  }

  return (
    <SimulationLayout
      sidebar={
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Agent Configuration</h3>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-primary-600 text-sm font-medium"
            >
              {showConfig ? 'Hide' : 'Edit'}
            </button>
          </div>

          {activeAgent && (
            <>
              <AgentCard
                agent={activeAgent}
                status={activeStatus}
                isActive
              />

              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <ConfigPanel
                      agent={activeAgent}
                      onUpdate={(updates) => updateAgentConfig(activeAgent.id, updates)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Objectives</h4>
            <div className="space-y-2">
              {scenarioState.currentObjectives.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-start gap-2 text-sm ${
                    obj.isCompleted ? 'text-success-600' : 'text-slate-600'
                  }`}
                >
                  <span className="mt-0.5">
                    {obj.isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      </svg>
                    )}
                  </span>
                  <span className={obj.isOptional ? 'italic' : ''}>
                    {obj.description}
                    {obj.isOptional && ' (Optional)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Concepts</h4>
            <div className="space-y-2">
              {scenario.concepts.map((conceptId) => {
                const concept = getConceptById(conceptId)
                if (!concept) return null
                return (
                  <button
                    key={conceptId}
                    onClick={() => setExpandedConcept(
                      expandedConcept === conceptId ? null : conceptId
                    )}
                    className="w-full text-left"
                  >
                    <Badge variant="primary" size="sm">
                      {concept.name}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{scenario.name}</h1>
              <p className="text-sm text-slate-500">{scenario.description}</p>
            </div>
          </div>
          <Badge variant={simulationState.isRunning ? 'success' : 'neutral'}>
            {simulationState.isRunning
              ? simulationState.isPaused
                ? 'Paused'
                : 'Running'
              : 'Ready'}
          </Badge>
        </div>

        <TimeControls
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onSpeedChange={handleSpeedChange}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <WalletDisplay />
          <TransactionList maxItems={5} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <EventLog maxItems={10} />
          <DecisionTree tree={approvalRequest?.decisionTree || null} />
        </div>

        {expandedConcept && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {(() => {
              const concept = getConceptById(expandedConcept)
              if (!concept) return null
              return (
                <ConceptCard
                  concept={concept}
                  isExpanded
                  onToggleExpand={() => setExpandedConcept(null)}
                />
              )
            })()}
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={!!approvalRequest}
        onClose={() => {}}
        title="Approval Required"
        size="lg"
      >
        {approvalRequest && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(approvalRequest.amount)}
                </p>
              </div>
              <RiskBar level={approvalRequest.riskLevel} label="Risk Level" />
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
              <p className="text-slate-600">{approvalRequest.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Agent Reasoning</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {approvalRequest.reasoning}
              </p>
            </div>

            {approvalRequest.decisionTree && (
              <DecisionTree tree={approvalRequest.decisionTree} title="Decision Process" />
            )}

            <ModalFooter>
              <Button variant="danger" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="success" onClick={handleApprove}>
                Approve
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </SimulationLayout>
  )
}
