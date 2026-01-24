import { motion } from 'framer-motion'
import { useSimulation } from '../../store'
import { Button, Tooltip } from '../common'
import type { SimulationSpeed } from '../../types'

interface TimeControlsProps {
  onStart?: () => void
  onPause?: () => void
  onResume?: () => void
  onStop?: () => void
  onSpeedChange?: (speed: SimulationSpeed) => void
}

const speeds: SimulationSpeed[] = [1, 2, 5, 10]

export function TimeControls({
  onStart,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
}: TimeControlsProps) {
  const simulation = useSimulation()
  const { isRunning, isPaused, speed } = simulation

  const handlePlayPause = () => {
    if (!isRunning) {
      onStart?.()
    } else if (isPaused) {
      onResume?.()
    } else {
      onPause?.()
    }
  }

  const handleSpeedChange = (newSpeed: SimulationSpeed) => {
    onSpeedChange?.(newSpeed)
  }

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const elapsedTime = simulation.currentTime - simulation.startTime

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Tooltip content={!isRunning ? 'Start' : isPaused ? 'Resume' : 'Pause'}>
          <Button
            variant={isRunning && !isPaused ? 'secondary' : 'primary'}
            size="sm"
            onClick={handlePlayPause}
            className="w-10 h-10 p-0"
          >
            {!isRunning || isPaused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Stop">
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            disabled={!isRunning}
            className="w-10 h-10 p-0"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </Button>
        </Tooltip>
      </div>

      <div className="h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-1">
        {speeds.map((s) => (
          <motion.button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              speed === s
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {s}x
          </motion.button>
        ))}
      </div>

      <div className="h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isRunning && !isPaused
              ? 'bg-success-500 animate-pulse'
              : isRunning && isPaused
              ? 'bg-warning-500'
              : 'bg-slate-300'
          }`}
        />
        <span className="text-sm text-slate-600">
          {!isRunning ? 'Stopped' : isPaused ? 'Paused' : 'Running'}
        </span>
      </div>

      <div className="flex-1" />

      <div className="text-right">
        <p className="text-xs text-slate-500">Elapsed Time</p>
        <p className="text-sm font-mono font-medium text-slate-900">
          {formatTime(elapsedTime > 0 ? elapsedTime : 0)}
        </p>
      </div>
    </div>
  )
}
