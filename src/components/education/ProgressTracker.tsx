import { motion } from 'framer-motion'
import { Card, CardHeader, Progress, CircularProgress, Badge } from '../common'
import { useEducation, useScenario } from '../../store'
import { concepts } from '../../data/concepts'

export function ProgressTracker() {
  const education = useEducation()
  const scenario = useScenario()

  const conceptProgress = Math.round(
    (education.learnedConceptIds.length / concepts.length) * 100
  )

  const scenarioProgress = Math.round(
    (scenario.completedScenarioIds.length / scenario.availableScenarios.length) * 100
  ) || 0

  return (
    <Card>
      <CardHeader
        title="Your Progress"
        action={
          <Badge variant="primary">
            {education.unlockedAchievements.length} achievements
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <CircularProgress
            value={conceptProgress}
            size={80}
            strokeWidth={6}
            variant="default"
          />
          <p className="text-sm font-medium text-slate-700 mt-3">
            Concepts Learned
          </p>
          <p className="text-xs text-slate-500">
            {education.learnedConceptIds.length} / {concepts.length}
          </p>
        </div>

        <div className="text-center">
          <CircularProgress
            value={scenarioProgress}
            size={80}
            strokeWidth={6}
            variant="success"
          />
          <p className="text-sm font-medium text-slate-700 mt-3">
            Scenarios Complete
          </p>
          <p className="text-xs text-slate-500">
            {scenario.completedScenarioIds.length} /{' '}
            {scenario.availableScenarios.length || 5}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Total Transactions</span>
            <span className="font-medium text-slate-900">
              {education.totalTransactions}
            </span>
          </div>
          <Progress
            value={education.totalTransactions}
            max={50}
            size="sm"
            variant="default"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Total Savings</span>
            <span className="font-medium text-success-600">
              ${education.totalSavings.toFixed(2)}
            </span>
          </div>
          <Progress
            value={education.totalSavings}
            max={100}
            size="sm"
            variant="success"
          />
        </div>
      </div>
    </Card>
  )
}

export function CompactProgressTracker() {
  const education = useEducation()
  const scenario = useScenario()

  const conceptProgress = Math.round(
    (education.learnedConceptIds.length / concepts.length) * 100
  )

  return (
    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
      <CircularProgress value={conceptProgress} size={40} strokeWidth={4} />
      <div>
        <p className="text-sm font-medium text-slate-700">
          {education.learnedConceptIds.length} concepts learned
        </p>
        <p className="text-xs text-slate-500">
          {scenario.completedScenarioIds.length} scenarios completed
        </p>
      </div>
      <div className="ml-auto">
        <Badge variant="primary">{education.unlockedAchievements.length}</Badge>
      </div>
    </div>
  )
}
