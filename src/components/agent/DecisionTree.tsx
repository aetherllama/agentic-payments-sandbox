import { motion } from 'framer-motion'
import { Card, CardHeader } from '../common'
import type { DecisionNode } from '../../types'

interface DecisionNodeProps {
  node: DecisionNode
  depth?: number
  isLast?: boolean
}

function DecisionNodeComponent({ node, depth = 0, isLast = false }: DecisionNodeProps) {
  const resultColors = {
    pass: 'bg-success-100 border-success-300 text-success-700',
    fail: 'bg-danger-100 border-danger-300 text-danger-700',
    pending: 'bg-warning-100 border-warning-300 text-warning-700',
  }

  const typeIcons = {
    condition: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    action: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    outcome: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" style={{ marginLeft: -16 }} />
      )}

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.1 }}
        className={`relative flex items-start gap-3 py-2 ${depth > 0 ? 'ml-6' : ''}`}
      >
        {depth > 0 && (
          <div className="absolute left-0 top-4 w-4 h-px bg-slate-200" style={{ marginLeft: -16 }} />
        )}

        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            node.result
              ? resultColors[node.result]
              : node.isActive
              ? 'bg-primary-100 text-primary-600 animate-pulse'
              : 'bg-slate-100 text-slate-500'
          } border`}
        >
          {typeIcons[node.type]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700">{node.label}</p>
          {node.description && (
            <p className="text-xs text-slate-500 mt-0.5">{node.description}</p>
          )}
        </div>

        {node.result && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              node.result === 'pass'
                ? 'bg-success-100 text-success-600'
                : node.result === 'fail'
                ? 'bg-danger-100 text-danger-600'
                : 'bg-warning-100 text-warning-600'
            }`}
          >
            {node.result === 'pass' ? 'Yes' : node.result === 'fail' ? 'No' : 'Pending'}
          </span>
        )}
      </motion.div>

      {node.children && node.children.length > 0 && (
        <div className="relative">
          {node.children.map((child, index) => (
            <DecisionNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DecisionTreeProps {
  tree: DecisionNode | null
  title?: string
}

export function DecisionTree({ tree, title = 'Decision Process' }: DecisionTreeProps) {
  if (!tree) {
    return (
      <Card>
        <CardHeader title={title} />
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-500">No decision in progress</p>
          <p className="text-xs text-slate-400 mt-1">
            Decision tree will appear when the agent evaluates an action
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title={title} />
      <div className="overflow-x-auto">
        <DecisionNodeComponent node={tree} />
      </div>
    </Card>
  )
}
