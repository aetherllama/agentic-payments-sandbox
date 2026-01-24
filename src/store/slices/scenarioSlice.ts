import { StateCreator } from 'zustand'
import type { ScenarioState, Scenario, ScenarioObjective, StoreState } from '../../types'

export interface ScenarioSlice {
  scenario: ScenarioState
  loadScenario: (scenario: Scenario) => void
  completeObjective: (id: string) => void
  markScenarioComplete: () => void
  setAvailableScenarios: (scenarios: Scenario[]) => void
  resetScenario: () => void
  getCompletionPercentage: () => number
}

const initialScenarioState: ScenarioState = {
  availableScenarios: [],
  activeScenario: null,
  completedScenarioIds: [],
  currentObjectives: [],
  scenarioStartTime: null,
}

export const createScenarioSlice: StateCreator<StoreState & ScenarioSlice, [], [], ScenarioSlice> = (set, get) => ({
  scenario: { ...initialScenarioState },

  loadScenario: (scenario) => {
    set((state) => ({
      scenario: {
        ...state.scenario,
        activeScenario: scenario,
        currentObjectives: scenario.objectives.map((obj) => ({ ...obj, isCompleted: false })),
        scenarioStartTime: Date.now(),
      },
    }))
  },

  completeObjective: (id) => {
    set((state) => ({
      scenario: {
        ...state.scenario,
        currentObjectives: state.scenario.currentObjectives.map((obj) =>
          obj.id === id ? { ...obj, isCompleted: true } : obj
        ),
      },
    }))
  },

  markScenarioComplete: () => {
    const state = get()
    if (!state.scenario.activeScenario) return

    set((state) => ({
      scenario: {
        ...state.scenario,
        completedScenarioIds: [
          ...state.scenario.completedScenarioIds,
          state.scenario.activeScenario!.id,
        ],
      },
    }))
  },

  setAvailableScenarios: (scenarios) => {
    set((state) => ({
      scenario: {
        ...state.scenario,
        availableScenarios: scenarios,
      },
    }))
  },

  resetScenario: () => {
    set((state) => ({
      scenario: {
        ...state.scenario,
        activeScenario: null,
        currentObjectives: [],
        scenarioStartTime: null,
      },
    }))
  },

  getCompletionPercentage: () => {
    const state = get()
    const { currentObjectives } = state.scenario

    const requiredObjectives = currentObjectives.filter((obj) => !obj.isOptional)
    if (requiredObjectives.length === 0) return 100

    const completed = requiredObjectives.filter((obj) => obj.isCompleted).length
    return Math.round((completed / requiredObjectives.length) * 100)
  },
})
