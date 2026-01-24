import { StateCreator } from 'zustand'
import type { SimulationState, SimulationEvent, SimulationSpeed, StoreState } from '../../types'

export interface SimulationSlice {
  simulation: SimulationState
  startSimulation: () => void
  pauseSimulation: () => void
  resumeSimulation: () => void
  stopSimulation: () => void
  setSpeed: (speed: SimulationSpeed) => void
  advanceTime: (ms: number) => void
  addEvent: (event: Omit<SimulationEvent, 'id' | 'processed'>) => void
  processEvent: (id: string) => void
  getNextEvent: () => SimulationEvent | null
  clearEvents: () => void
  resetSimulation: () => void
}

const initialSimulationState: SimulationState = {
  isRunning: false,
  isPaused: false,
  speed: 1,
  currentTime: 0,
  startTime: 0,
  eventQueue: [],
  processedEvents: [],
}

export const createSimulationSlice: StateCreator<StoreState & SimulationSlice, [], [], SimulationSlice> = (set, get) => ({
  simulation: { ...initialSimulationState },

  startSimulation: () => {
    const now = Date.now()
    set((state) => ({
      simulation: {
        ...state.simulation,
        isRunning: true,
        isPaused: false,
        startTime: now,
        currentTime: now,
      },
    }))
  },

  pauseSimulation: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        isPaused: true,
      },
    }))
  },

  resumeSimulation: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        isPaused: false,
      },
    }))
  },

  stopSimulation: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        isRunning: false,
        isPaused: false,
      },
    }))
  },

  setSpeed: (speed) => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        speed,
      },
    }))
  },

  advanceTime: (ms) => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        currentTime: state.simulation.currentTime + (ms * state.simulation.speed),
      },
    }))
  },

  addEvent: (event) => {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newEvent: SimulationEvent = {
      ...event,
      id,
      processed: false,
    }

    set((state) => {
      const queue = [...state.simulation.eventQueue, newEvent]
      queue.sort((a, b) => {
        if (a.scheduledTime !== b.scheduledTime) {
          return a.scheduledTime - b.scheduledTime
        }
        return b.priority - a.priority
      })

      return {
        simulation: {
          ...state.simulation,
          eventQueue: queue,
        },
      }
    })
  },

  processEvent: (id) => {
    set((state) => {
      const event = state.simulation.eventQueue.find((e) => e.id === id)
      if (!event) return state

      return {
        simulation: {
          ...state.simulation,
          eventQueue: state.simulation.eventQueue.filter((e) => e.id !== id),
          processedEvents: [...state.simulation.processedEvents, { ...event, processed: true }],
        },
      }
    })
  },

  getNextEvent: () => {
    const state = get()
    const { eventQueue, currentTime } = state.simulation

    const readyEvents = eventQueue.filter((e) => e.scheduledTime <= currentTime)
    if (readyEvents.length === 0) return null

    return readyEvents[0]
  },

  clearEvents: () => {
    set((state) => ({
      simulation: {
        ...state.simulation,
        eventQueue: [],
        processedEvents: [],
      },
    }))
  },

  resetSimulation: () => {
    set({ simulation: { ...initialSimulationState } })
  },
})
