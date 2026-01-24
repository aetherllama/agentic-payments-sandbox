import React from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, StatusBadge } from '../common'
import type { AgentConfig, AgentStatus } from '../../types'
import { formatCurrency } from '../../utils/formatCurrency'

interface AgentCardProps {
  agent: AgentConfig
  status: AgentStatus
  onClick?: () => void
  isActive?: boolean
}

const agentTypeIcons: Record<AgentConfig['type'], React.ReactNode> = {
  shopping: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  subscription: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  billpay: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  investment: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  negotiation: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  ),
}

const statusToDisplay: Record<AgentStatus, { status: 'idle' | 'active' | 'pending' | 'success' | 'error' | 'warning'; label: string }> = {
  idle: { status: 'idle', label: 'Idle' },
  thinking: { status: 'active', label: 'Thinking...' },
  executing: { status: 'active', label: 'Executing' },
  waiting_approval: { status: 'pending', label: 'Awaiting Approval' },
  paused: { status: 'warning', label: 'Paused' },
  completed: { status: 'success', label: 'Completed' },
  error: { status: 'error', label: 'Error' },
}

export function AgentCard({ agent, status, onClick, isActive = false }: AgentCardProps) {
  const statusDisplay = statusToDisplay[status] || statusToDisplay.idle

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant="hover"
        className={`cursor-pointer ${isActive ? 'ring-2 ring-primary-500' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              agent.enabled
                ? 'bg-primary-100 text-primary-600'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {agentTypeIcons[agent.type]}
          </div>
          <StatusBadge status={statusDisplay.status}>
            {statusDisplay.label}
          </StatusBadge>
        </div>

        <h3 className="font-semibold text-slate-900 mb-1">{agent.name}</h3>
        <p className="text-sm text-slate-500 capitalize mb-3">{agent.type} Agent</p>

        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Per Transaction</span>
            <span className="font-medium text-slate-700">
              {formatCurrency(agent.spendingLimits.perTransaction)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Auto-approve</span>
            <span className="font-medium text-slate-700">
              {formatCurrency(agent.spendingLimits.autoApproveThreshold)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Daily Limit</span>
            <span className="font-medium text-slate-700">
              {formatCurrency(agent.spendingLimits.daily)}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
