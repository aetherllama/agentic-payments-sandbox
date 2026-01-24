import type { SimulationSpeed } from '../types'

export interface TimeControllerConfig {
  speed: SimulationSpeed
  onTick: (deltaTime: number, currentTime: number) => void
  tickInterval?: number
}

export class TimeController {
  private speed: SimulationSpeed = 1
  private isRunning: boolean = false
  private isPaused: boolean = false
  private currentTime: number = 0
  private startTime: number = 0
  private lastTickTime: number = 0
  private animationFrameId: number | null = null
  private onTick: (deltaTime: number, currentTime: number) => void
  private tickInterval: number

  constructor(config: TimeControllerConfig) {
    this.speed = config.speed
    this.onTick = config.onTick
    this.tickInterval = config.tickInterval || 100
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.isPaused = false
    this.startTime = Date.now()
    this.currentTime = this.startTime
    this.lastTickTime = this.startTime
    this.tick()
  }

  pause(): void {
    this.isPaused = true
  }

  resume(): void {
    if (!this.isRunning) return
    this.isPaused = false
    this.lastTickTime = Date.now()
    this.tick()
  }

  stop(): void {
    this.isRunning = false
    this.isPaused = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  setSpeed(speed: SimulationSpeed): void {
    this.speed = speed
  }

  getSpeed(): SimulationSpeed {
    return this.speed
  }

  getCurrentTime(): number {
    return this.currentTime
  }

  getElapsedTime(): number {
    return this.currentTime - this.startTime
  }

  isActive(): boolean {
    return this.isRunning && !this.isPaused
  }

  private tick = (): void => {
    if (!this.isRunning || this.isPaused) return

    const now = Date.now()
    const realDelta = now - this.lastTickTime

    if (realDelta >= this.tickInterval) {
      const simulatedDelta = realDelta * this.speed
      this.currentTime += simulatedDelta
      this.lastTickTime = now
      this.onTick(simulatedDelta, this.currentTime)
    }

    this.animationFrameId = requestAnimationFrame(this.tick)
  }

  reset(): void {
    this.stop()
    this.currentTime = 0
    this.startTime = 0
    this.lastTickTime = 0
  }
}
