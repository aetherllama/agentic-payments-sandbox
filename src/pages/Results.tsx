import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppShell } from '../components/layout'
import { Card, Button, Badge, Progress } from '../components/common'
import { AchievementBadge } from '../components/education'
import { useStore } from '../store'
import { getScenarioById } from '../data/scenarios'
import { getConceptById } from '../data/concepts'
import { formatCurrency } from '../utils/formatCurrency'

export function Results() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const navigate = useNavigate()
  const { wallet, scenario: scenarioState, education } = useStore()

  const scenario = scenarioId ? getScenarioById(scenarioId) : null
  const isCompleted = scenario
    ? scenarioState.completedScenarioIds.includes(scenario.id)
    : false

  if (!scenario) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900">Scenario not found</h2>
          <Button variant="primary" onClick={() => navigate('/')} className="mt-4">
            Back to Scenarios
          </Button>
        </div>
      </AppShell>
    )
  }

  const completedObjectives = scenarioState.currentObjectives.filter((o) => o.isCompleted)
  const totalObjectives = scenarioState.currentObjectives.filter((o) => !o.isOptional)
  const optionalCompleted = scenarioState.currentObjectives.filter(
    (o) => o.isOptional && o.isCompleted
  )

  const learnedConcepts = scenario.concepts.filter((id) =>
    education.learnedConceptIds.includes(id)
  )

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
              isCompleted ? 'bg-success-100' : 'bg-warning-100'
            }`}
          >
            {isCompleted ? (
              <svg
                className="w-10 h-10 text-success-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-warning-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isCompleted ? 'Scenario Complete!' : 'Scenario In Progress'}
          </h1>
          <p className="text-lg text-slate-600">{scenario.name}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">
                  {completedObjectives.length}/{totalObjectives.length}
                </p>
                <p className="text-sm text-slate-500">Objectives</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">
                  {learnedConcepts.length}
                </p>
                <p className="text-sm text-slate-500">Concepts Learned</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(wallet.balance)}
                </p>
                <p className="text-sm text-slate-500">Final Balance</p>
              </div>
            </div>

            <div className="space-y-3">
              {scenarioState.currentObjectives.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    obj.isCompleted ? 'bg-success-50' : 'bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      obj.isCompleted
                        ? 'bg-success-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {obj.isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="4" strokeWidth={2} />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`flex-1 ${
                      obj.isCompleted ? 'text-success-700' : 'text-slate-600'
                    } ${obj.isOptional ? 'italic' : ''}`}
                  >
                    {obj.description}
                    {obj.isOptional && (
                      <Badge variant="neutral" size="sm" className="ml-2">
                        Optional
                      </Badge>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Concepts Learned</h3>
            <div className="space-y-3">
              {scenario.concepts.map((conceptId) => {
                const concept = getConceptById(conceptId)
                const isLearned = education.learnedConceptIds.includes(conceptId)

                if (!concept) return null

                return (
                  <div
                    key={conceptId}
                    className={`p-4 rounded-lg border ${
                      isLearned
                        ? 'border-success-200 bg-success-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900">{concept.name}</h4>
                      {isLearned && (
                        <Badge variant="success" size="sm">
                          Learned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{concept.description}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 justify-center"
        >
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Scenarios
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/simulation/${scenarioId}`)}
          >
            {isCompleted ? 'Play Again' : 'Continue'}
          </Button>
        </motion.div>
      </div>
    </AppShell>
  )
}
