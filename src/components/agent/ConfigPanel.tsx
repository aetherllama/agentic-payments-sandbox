import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, Button, Slider, Input, Badge } from '../common'
import type { AgentConfig, SpendingLimits } from '../../types'
import { formatCurrency } from '../../utils/formatCurrency'

interface ConfigPanelProps {
  agent: AgentConfig
  onUpdate: (updates: Partial<AgentConfig>) => void
  onClose?: () => void
}

export function ConfigPanel({ agent, onUpdate, onClose }: ConfigPanelProps) {
  const [limits, setLimits] = useState<SpendingLimits>(agent.spendingLimits)
  const [hasChanges, setHasChanges] = useState(false)

  const handleLimitChange = (key: keyof SpendingLimits, value: number) => {
    setLimits((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate({ spendingLimits: limits })
    setHasChanges(false)
  }

  const handleReset = () => {
    setLimits(agent.spendingLimits)
    setHasChanges(false)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Agent Configuration"
        subtitle={agent.name}
        action={
          onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )
        }
      />

      <div className="flex-1 space-y-6 overflow-y-auto">
        <section>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Spending Limits</h4>

          <div className="space-y-6">
            <Slider
              label="Per Transaction Limit"
              min={10}
              max={500}
              step={10}
              value={limits.perTransaction}
              onChange={(v) => handleLimitChange('perTransaction', v)}
              formatValue={(v) => formatCurrency(v)}
            />

            <Slider
              label="Auto-Approve Threshold"
              min={5}
              max={limits.perTransaction}
              step={5}
              value={limits.autoApproveThreshold}
              onChange={(v) => handleLimitChange('autoApproveThreshold', v)}
              formatValue={(v) => formatCurrency(v)}
            />

            <Slider
              label="Daily Limit"
              min={50}
              max={2000}
              step={50}
              value={limits.daily}
              onChange={(v) => handleLimitChange('daily', v)}
              formatValue={(v) => formatCurrency(v)}
            />
          </div>
        </section>

        <section>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Risk Settings</h4>

          <Slider
            label="Max Risk Level"
            min={1}
            max={5}
            step={1}
            value={agent.riskSettings.maxRiskLevel}
            onChange={(v) =>
              onUpdate({
                riskSettings: { ...agent.riskSettings, maxRiskLevel: v },
              })
            }
            formatValue={(v) => `${v}/5`}
          />

          <div className="mt-4 grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-2 rounded-full ${
                  level <= agent.riskSettings.maxRiskLevel
                    ? level <= 2
                      ? 'bg-success-500'
                      : level <= 3
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-400">Low Risk</span>
            <span className="text-xs text-slate-400">High Risk</span>
          </div>
        </section>

        <section>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Allowed Categories</h4>
          <div className="flex flex-wrap gap-2">
            {['Electronics', 'Groceries', 'Entertainment', 'Travel', 'Utilities'].map(
              (category) => {
                const isAllowed =
                  agent.allowedCategories.length === 0 ||
                  agent.allowedCategories.includes(category)
                return (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const newCategories = isAllowed
                        ? agent.allowedCategories.filter((c) => c !== category)
                        : [...agent.allowedCategories, category]
                      onUpdate({ allowedCategories: newCategories })
                    }}
                  >
                    <Badge variant={isAllowed ? 'primary' : 'neutral'}>
                      {category}
                    </Badge>
                  </motion.button>
                )
              }
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Empty selection allows all categories
          </p>
        </section>

        <section>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Agent Status</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agent.enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-600">Agent Enabled</span>
          </label>
        </section>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 border-t border-slate-200 flex gap-2"
        >
          <Button variant="secondary" size="sm" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </motion.div>
      )}
    </Card>
  )
}
