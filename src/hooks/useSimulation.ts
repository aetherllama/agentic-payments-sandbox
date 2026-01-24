import { useCallback, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { SimulationEngine, SimulationEngineConfig } from '../engine'
import type { Scenario, SimulationSpeed, ApprovalRequest } from '../types'

interface UseSimulationOptions {
  scenario: Scenario
  onApprovalRequired?: (request: ApprovalRequest) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useSimulation(options: UseSimulationOptions) {
  const engineRef = useRef<SimulationEngine | null>(null)
  const { simulation, startSimulation, pauseSimulation, resumeSimulation, stopSimulation, setSpeed } = useStore()

  useEffect(() => {
    const config: SimulationEngineConfig = {
      scenario: options.scenario,
      onApprovalRequired: options.onApprovalRequired,
      onSimulationComplete: options.onComplete,
      onError: options.onError,
    }

    engineRef.current = new SimulationEngine(config)

    return () => {
      engineRef.current?.stop()
      engineRef.current = null
    }
  }, [options.scenario])

  const start = useCallback(() => {
    engineRef.current?.start()
  }, [])

  const pause = useCallback(() => {
    engineRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    engineRef.current?.resume()
  }, [])

  const stop = useCallback(() => {
    engineRef.current?.stop()
  }, [])

  const changeSpeed = useCallback((speed: SimulationSpeed) => {
    engineRef.current?.setSpeed(speed)
  }, [])

  const approve = useCallback((requestId: string) => {
    engineRef.current?.approveRequest(requestId)
  }, [])

  const reject = useCallback((requestId: string) => {
    engineRef.current?.rejectRequest(requestId)
  }, [])

  const getStats = useCallback(() => {
    return engineRef.current?.getStats()
  }, [])

  return {
    ...simulation,
    start,
    pause,
    resume,
    stop,
    changeSpeed,
    approve,
    reject,
    getStats,
    engine: engineRef.current,
  }
}
