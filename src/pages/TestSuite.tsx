import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '../components/layout'
import { Card, CardHeader, Button, Badge, Input } from '../components/common'
import { GuardrailsConfig } from '../components/agent/GuardrailsConfig'
import { GuardrailValidator, type ValidationResult } from '../engine/GuardrailValidator'
import { DEFAULT_SG_MANDATES } from '../types/guardrails'
import { createDefaultAgentConfig } from '../store/slices/agentSlice'
import { SAFR_TEST_CASES, buildTestHistory, type SafrOutcome } from '../data/safrTestCases'
import type { SingaporePaymentMethod } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

function deriveOutcome(result: ValidationResult): SafrOutcome {
  if (result.allowed) return 'allow'
  return result.requiresApproval ? 'approval' : 'block'
}

const outcomeBadge: Record<SafrOutcome, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  allow: { variant: 'success', label: 'Allowed' },
  approval: { variant: 'warning', label: 'HITL Approval' },
  block: { variant: 'danger', label: 'Blocked' },
}

interface CaseResult {
  outcome: SafrOutcome
  passed: boolean
  detail: ValidationResult
}

const paymentMethods: SingaporePaymentMethod[] = ['PayNow', 'NETS', 'GrabPay', 'DBS PayLah!']

export function TestSuite() {
  const [testAgent, setTestAgent] = useState(() =>
    createDefaultAgentConfig('shopping', 'SAFR Test Agent')
  )
  const [results, setResults] = useState<Record<string, CaseResult>>({})

  const [customAmount, setCustomAmount] = useState('40')
  const [customMerchant, setCustomMerchant] = useState('Custom Merchant')
  const [customCategory, setCustomCategory] = useState('Electronics')
  const [customIsNew, setCustomIsNew] = useState(false)
  const [customPaymentMethod, setCustomPaymentMethod] = useState<SingaporePaymentMethod>('PayNow')
  const [customResult, setCustomResult] = useState<ValidationResult | null>(null)

  const runCase = useCallback(
    (caseId: string) => {
      const testCase = SAFR_TEST_CASES.find((c) => c.id === caseId)
      if (!testCase) return

      const history = buildTestHistory(testCase.priorTransactions)
      const detail = GuardrailValidator.validateMandate(
        testAgent,
        testCase.transaction,
        history,
        testCase.isNewMerchant
      )
      const outcome = deriveOutcome(detail)

      setResults((prev) => ({
        ...prev,
        [caseId]: { outcome, passed: outcome === testCase.expected, detail },
      }))
    },
    [testAgent]
  )

  const runAll = useCallback(() => {
    const next: Record<string, CaseResult> = {}
    for (const testCase of SAFR_TEST_CASES) {
      const history = buildTestHistory(testCase.priorTransactions)
      const detail = GuardrailValidator.validateMandate(
        testAgent,
        testCase.transaction,
        history,
        testCase.isNewMerchant
      )
      const outcome = deriveOutcome(detail)
      next[testCase.id] = { outcome, passed: outcome === testCase.expected, detail }
    }
    setResults(next)
  }, [testAgent])

  const runCustom = useCallback(() => {
    const amount = Number(customAmount)
    if (!Number.isFinite(amount) || amount <= 0) return

    const detail = GuardrailValidator.validateMandate(
      testAgent,
      {
        amount,
        merchantName: customMerchant || 'Custom Merchant',
        category: customCategory || 'Electronics',
        paymentMethod: customPaymentMethod,
      },
      [],
      customIsNew
    )
    setCustomResult(detail)
  }, [testAgent, customAmount, customMerchant, customCategory, customIsNew, customPaymentMethod])

  const resetToDefault = useCallback(() => {
    setTestAgent((prev) => ({ ...prev, guardrails: { ...DEFAULT_SG_MANDATES } }))
    setResults({})
  }, [])

  const summary = useMemo(() => {
    const run = Object.values(results)
    const passed = run.filter((r) => r.passed).length
    return { run: run.length, total: SAFR_TEST_CASES.length, passed }
  }, [results])

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">SAFR Test Suite</h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Run a batch of transactions straight through <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">GuardrailValidator.validateMandate</code> for
            a scratch agent configuration &mdash; the same runtime path every SAFR-governed transaction takes, without
            needing a live simulation. Tune the mandates on the left, then re-run to see how outcomes change.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader
                title="Test Agent Mandates"
                subtitle="Scratch config, not saved to any agent"
                action={
                  <Button variant="secondary" size="sm" onClick={resetToDefault}>
                    Reset
                  </Button>
                }
              />
              <GuardrailsConfig
                settings={testAgent.guardrails}
                onUpdate={(updates) =>
                  setTestAgent((prev) => ({ ...prev, guardrails: { ...prev.guardrails, ...updates } }))
                }
              />
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Preset Test Cases"
                subtitle={
                  summary.run > 0
                    ? `${summary.passed}/${summary.run} passed against expected outcome`
                    : `${SAFR_TEST_CASES.length} cases covering every SAFR mandate`
                }
                action={
                  <Button variant="primary" size="sm" onClick={runAll}>
                    Run All
                  </Button>
                }
              />

              <div className="space-y-2">
                {SAFR_TEST_CASES.map((testCase) => {
                  const result = results[testCase.id]
                  return (
                    <motion.div
                      key={testCase.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{testCase.label}</span>
                            <Badge variant="neutral" size="sm">{testCase.mandate}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatCurrency(testCase.transaction.amount)} &middot; {testCase.transaction.merchantName} &middot; {testCase.transaction.category}
                            {testCase.isNewMerchant ? ' · new merchant' : ''}
                          </p>
                          {result && (
                            <p className="text-xs text-slate-500 mt-1 italic">
                              {result.detail.reason || 'Passed every mandate check.'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {result && (
                            <>
                              <Badge variant={outcomeBadge[result.outcome].variant} size="sm">
                                {outcomeBadge[result.outcome].label}
                              </Badge>
                              <Badge variant={result.passed ? 'success' : 'danger'} size="sm">
                                {result.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => runCase(testCase.id)}>
                            Run
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            <Card>
              <CardHeader title="Custom Transaction" subtitle="Build your own SAFR test case on the fly" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Amount"
                  type="number"
                  min="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <Input
                  label="Merchant"
                  value={customMerchant}
                  onChange={(e) => setCustomMerchant(e.target.value)}
                />
                <Input
                  label="Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={customPaymentMethod}
                    onChange={(e) => setCustomPaymentMethod(e.target.value as SingaporePaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={customIsNew}
                  onChange={(e) => setCustomIsNew(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Treat as a previously-unseen merchant
              </label>

              <div className="mt-4 flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={runCustom}>
                  Run Custom Test
                </Button>
                {customResult && (
                  <>
                    <Badge variant={outcomeBadge[deriveOutcome(customResult)].variant}>
                      {outcomeBadge[deriveOutcome(customResult)].label}
                    </Badge>
                    {customResult.reason && (
                      <span className="text-xs text-slate-500">{customResult.reason}</span>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
