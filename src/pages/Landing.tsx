import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '../components/layout'
import { Card, Badge, Button } from '../components/common'
import { CompactProgressTracker } from '../components/education'
import { useStore } from '../store'
import { scenarios } from '../data/scenarios'
import type { Scenario, Difficulty } from '../types'

const difficultyColors: Record<Difficulty, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-success-100', text: 'text-success-700', label: 'Beginner' },
  intermediate: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Intermediate' },
  advanced: { bg: 'bg-danger-100', text: 'text-danger-700', label: 'Advanced' },
}

const typeIcons: Record<Scenario['type'], React.ReactNode> = {
  shopping: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  subscription: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  billpay: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  investment: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  negotiation: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
}

interface ScenarioCardProps {
  scenario: Scenario
  isCompleted: boolean
  onStart: () => void
}

function ScenarioCard({ scenario, isCompleted, onStart }: ScenarioCardProps) {
  const difficulty = difficultyColors[scenario.difficulty]

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card variant="hover" className="h-full flex flex-col" onClick={onStart}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            isCompleted ? 'bg-success-100 text-success-600' : 'bg-primary-100 text-primary-600'
          }`}>
            {isCompleted ? (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              typeIcons[scenario.type]
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={`${difficulty.bg} ${difficulty.text}`}>
              {difficulty.label}
            </Badge>
            {isCompleted && (
              <Badge variant="success">Completed</Badge>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {scenario.name}
        </h3>
        <p className="text-sm text-slate-600 mb-4 flex-1">
          {scenario.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scenario.estimatedDuration}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {scenario.concepts.length} concepts
            </span>
          </div>
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </motion.div>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const { setAvailableScenarios, scenario: scenarioState } = useStore()

  useEffect(() => {
    setAvailableScenarios(scenarios)
  }, [setAvailableScenarios])

  const handleStartScenario = (scenarioId: string) => {
    navigate(`/simulation/${scenarioId}`)
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900 mb-4"
          >
            Agentic Payments Sandbox
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Learn how AI agents make autonomous financial decisions through interactive
            simulations. Configure spending limits, set approval thresholds, and observe
            intelligent payment automation in action.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <CompactProgressTracker />
        </motion.div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Choose a Scenario</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/sandbox')}
              rightIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Open Sandbox
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ScenarioCard
                  scenario={scenario}
                  isCompleted={scenarioState.completedScenarioIds.includes(scenario.id)}
                  onStart={() => handleStartScenario(scenario.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            New to Agentic Payments?
          </h3>
          <p className="text-slate-600 mb-4 max-w-lg mx-auto">
            Start with the Shopping Agent scenario to learn the basics of spending limits,
            auto-approval thresholds, and human-in-the-loop oversight.
          </p>
          <Button
            variant="primary"
            onClick={() => handleStartScenario('shopping-basics')}
            rightIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Start Learning
          </Button>
        </motion.div>
      </div>
    </AppShell>
  )
}
