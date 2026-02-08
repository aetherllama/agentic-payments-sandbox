import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, Button, Slider, Input, Badge } from '../common'
import type { AgentConfig, SpendingLimits } from '../../types'
import { GuardrailsConfig } from './GuardrailsConfig'
import { GuardrailSettings } from '../../types/guardrails'
import { formatCurrency } from '../../utils/formatCurrency'

interface ConfigPanelProps {
  agent: AgentConfig
  onUpdate: (updates: Partial<AgentConfig>) => void
  onClose?: () => void
}

export function ConfigPanel({ agent, onUpdate, onClose }: ConfigPanelProps) {
  const [limits, setLimits] = useState<SpendingLimits>(agent.spendingLimits)
  const [activeTab, setActiveTab] = useState<'spending' | 'guardrails' | 'advanced'>('spending')
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

  const tabs = [
    {
      id: 'spending', label: 'Spending', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'guardrails', label: 'Guardrails', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'advanced', label: 'Advanced', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
  ];

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

      <div className="flex border-b border-slate-100 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                ? 'text-primary-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-thin">
        {activeTab === 'spending' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <section>
              <h4 className="text-sm font-medium text-slate-700 mb-4">Daily Spending Limits</h4>
              <div className="space-y-6">
                <Slider
                  label="Daily Budget"
                  min={50}
                  max={2000}
                  step={50}
                  value={limits.daily}
                  onChange={(v) => handleLimitChange('daily', v)}
                  formatValue={(v) => formatCurrency(v)}
                />

                <Slider
                  label="Per Transaction Max"
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
          </motion.div>
        )}

        {activeTab === 'guardrails' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GuardrailsConfig
              settings={agent.guardrails}
              onUpdate={(updates) => onUpdate({ guardrails: { ...agent.guardrails, ...updates } })}
            />
          </motion.div>
        )}

        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <section>
              <h4 className="text-sm font-medium text-slate-700 mb-4">Risk Tolerance Settings</h4>
              <Slider
                label="Maximum Risk Level"
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
                    className={`h-2 rounded-full ${level <= agent.riskSettings.maxRiskLevel
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
                <span className="text-xs text-slate-400">Conservative</span>
                <span className="text-xs text-slate-400">Aggressive</span>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-medium text-slate-700 mb-4">Agent Operating Status</h4>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-800 block">Agent Active</span>
                  <span className="text-xs text-slate-500">Enable or disable all autonomous actions for this agent</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agent.enabled}
                    onChange={(e) => onUpdate({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
              </label>
            </section>
          </motion.div>
        )}
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
