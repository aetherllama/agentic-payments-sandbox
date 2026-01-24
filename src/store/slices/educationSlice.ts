import { StateCreator } from 'zustand'
import type { EducationState, Achievement, StoreState } from '../../types'

export interface EducationSlice {
  education: EducationState
  learnConcept: (conceptId: string) => void
  unlockAchievement: (achievement: Achievement) => void
  incrementTransactions: () => void
  addSavings: (amount: number) => void
  toggleHints: () => void
  setHint: (hint: string | null) => void
  hasLearnedConcept: (conceptId: string) => boolean
  hasAchievement: (achievementId: string) => boolean
  resetEducation: () => void
}

const STORAGE_KEY = 'agentic-payments-education'

const loadFromStorage = (): Partial<EducationState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load education state from storage', e)
  }
  return {}
}

const saveToStorage = (state: EducationState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      learnedConceptIds: state.learnedConceptIds,
      unlockedAchievements: state.unlockedAchievements,
      totalTransactions: state.totalTransactions,
      totalSavings: state.totalSavings,
    }))
  } catch (e) {
    console.error('Failed to save education state to storage', e)
  }
}

const storedState = loadFromStorage()

const initialEducationState: EducationState = {
  learnedConceptIds: storedState.learnedConceptIds || [],
  unlockedAchievements: storedState.unlockedAchievements || [],
  totalTransactions: storedState.totalTransactions || 0,
  totalSavings: storedState.totalSavings || 0,
  hintsEnabled: true,
  currentHint: null,
}

export const createEducationSlice: StateCreator<StoreState & EducationSlice, [], [], EducationSlice> = (set, get) => ({
  education: { ...initialEducationState },

  learnConcept: (conceptId) => {
    set((state) => {
      if (state.education.learnedConceptIds.includes(conceptId)) {
        return state
      }

      const newState = {
        education: {
          ...state.education,
          learnedConceptIds: [...state.education.learnedConceptIds, conceptId],
        },
      }
      saveToStorage(newState.education)
      return newState
    })
  },

  unlockAchievement: (achievement) => {
    set((state) => {
      if (state.education.unlockedAchievements.some((a) => a.id === achievement.id)) {
        return state
      }

      const unlockedAchievement = {
        ...achievement,
        unlockedAt: Date.now(),
      }

      const newState = {
        education: {
          ...state.education,
          unlockedAchievements: [...state.education.unlockedAchievements, unlockedAchievement],
        },
      }
      saveToStorage(newState.education)
      return newState
    })
  },

  incrementTransactions: () => {
    set((state) => {
      const newState = {
        education: {
          ...state.education,
          totalTransactions: state.education.totalTransactions + 1,
        },
      }
      saveToStorage(newState.education)
      return newState
    })
  },

  addSavings: (amount) => {
    set((state) => {
      const newState = {
        education: {
          ...state.education,
          totalSavings: state.education.totalSavings + amount,
        },
      }
      saveToStorage(newState.education)
      return newState
    })
  },

  toggleHints: () => {
    set((state) => ({
      education: {
        ...state.education,
        hintsEnabled: !state.education.hintsEnabled,
      },
    }))
  },

  setHint: (hint) => {
    set((state) => ({
      education: {
        ...state.education,
        currentHint: hint,
      },
    }))
  },

  hasLearnedConcept: (conceptId) => {
    return get().education.learnedConceptIds.includes(conceptId)
  },

  hasAchievement: (achievementId) => {
    return get().education.unlockedAchievements.some((a) => a.id === achievementId)
  },

  resetEducation: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({
      education: {
        learnedConceptIds: [],
        unlockedAchievements: [],
        totalTransactions: 0,
        totalSavings: 0,
        hintsEnabled: true,
        currentHint: null,
      },
    })
  },
})
