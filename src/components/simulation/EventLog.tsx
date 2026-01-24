import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgent } from '../../store'
import { Card, CardHeader, Badge } from '../common'
import type { AgentAction } from '../../types'

function ActionIcon({ type }: { type: AgentAction['type'] }) {
  const icons: Record<AgentAction['type'], React.ReactNode> = {
    search: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    evaluate: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    decide: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    execute: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    wait: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    complete: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  }

  return icons[type] || icons.evaluate
}

function ActionItem({ action }: { action: AgentAction }) {
  const typeColors: Record<AgentAction['type'], string> = {
    search: 'bg-blue-100 text-blue-600',
    evaluate: 'bg-purple-100 text-purple-600',
    decide: 'bg-orange-100 text-orange-600',
    execute: 'bg-green-100 text-green-600',
    wait: 'bg-yellow-100 text-yellow-600',
    complete: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-start gap-3 py-2"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[action.type]}`}
      >
        <ActionIcon type={action.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 line-clamp-2">{action.description}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(action.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  )
}

interface EventLogProps {
  maxItems?: number
}

export function EventLog({ maxItems = 20 }: EventLogProps) {
  const agent = useAgent()
  const actions = agent.actionHistory.slice(-maxItems).reverse()

  return (
    <Card>
      <CardHeader
        title="Agent Activity"
        subtitle="Real-time decision log"
        action={
          <Badge variant="neutral">
            {agent.actionHistory.length} events
          </Badge>
        }
      />

      {actions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-500">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Start the simulation to see agent decisions
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {actions.map((action) => (
              <ActionItem key={action.id} action={action} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  )
}
