import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createWalletSlice, WalletSlice } from './slices/walletSlice'
import { createAgentSlice, AgentSlice } from './slices/agentSlice'
import { createSimulationSlice, SimulationSlice } from './slices/simulationSlice'
import { createScenarioSlice, ScenarioSlice } from './slices/scenarioSlice'
import { createEducationSlice, EducationSlice } from './slices/educationSlice'
import type { StoreState } from '../types'

export type AppStore = StoreState &
  WalletSlice &
  AgentSlice &
  SimulationSlice &
  ScenarioSlice &
  EducationSlice

export const useStore = create<AppStore>()(
  devtools(
    (...a) => ({
      ...createWalletSlice(...a),
      ...createAgentSlice(...a),
      ...createSimulationSlice(...a),
      ...createScenarioSlice(...a),
      ...createEducationSlice(...a),
    }),
    { name: 'agentic-payments-store' }
  )
)

export const useWallet = () => useStore((state) => state.wallet)
export const useAgent = () => useStore((state) => state.agent)
export const useSimulation = () => useStore((state) => state.simulation)
export const useScenario = () => useStore((state) => state.scenario)
export const useEducation = () => useStore((state) => state.education)

export * from './slices/walletSlice'
export * from './slices/agentSlice'
export * from './slices/simulationSlice'
export * from './slices/scenarioSlice'
export * from './slices/educationSlice'
