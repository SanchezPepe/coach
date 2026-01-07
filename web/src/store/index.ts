import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types (simplified for frontend, will import from @coach/types when available)
export interface Athlete {
  id: string
  name: string
  weightKg: number
  bodyFatPercentage?: number
  heightCm: number
  age: number
  sex: 'male' | 'female'
  restingHeartRate?: number
  maxHeartRate?: number
  goals: AthleteGoals
}

export interface AthleteGoals {
  primary: Goal
  secondary?: Goal
}

export interface Goal {
  type: 'endurance' | 'strength' | 'body_composition'
  // Additional fields depend on goal type
  [key: string]: unknown
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  start_date_local: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  suffer_score?: number
}

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodEntry {
  id: string
  foodId: string
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: string
}

interface AppState {
  // Auth
  user: { uid: string; email: string } | null
  isAuthenticated: boolean

  // Athlete
  athlete: Athlete | null
  isLoading: boolean

  // Theme
  theme: 'light' | 'dark'

  // Strava
  stravaActivities: StravaActivity[]
  stravaLoading: boolean

  // Nutrition
  todaysMacros: MacroTotals
  todaysFoodLog: FoodEntry[]

  // Actions
  setUser: (user: { uid: string; email: string } | null) => void
  setAthlete: (athlete: Athlete | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  setStravaActivities: (activities: StravaActivity[]) => void
  setStravaLoading: (loading: boolean) => void
  updateWeight: (weight: number) => void
  setTodaysMacros: (macros: MacroTotals) => void
  addFoodEntry: (entry: FoodEntry) => void
  removeFoodEntry: (id: string) => void
  logout: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      athlete: null,
      isLoading: false,
      theme: 'dark',
      stravaActivities: [],
      stravaLoading: false,
      todaysMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      todaysFoodLog: [],

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAthlete: (athlete) => set({ athlete }),

      setTheme: (theme) => set({ theme }),

      setStravaActivities: (activities) => set({ stravaActivities: activities }),

      setStravaLoading: (loading) => set({ stravaLoading: loading }),

      updateWeight: (weight) =>
        set((state) => ({
          athlete: state.athlete
            ? { ...state.athlete, weightKg: weight }
            : null,
        })),

      setTodaysMacros: (macros) => set({ todaysMacros: macros }),

      addFoodEntry: (entry) =>
        set((state) => {
          const newLog = [...state.todaysFoodLog, entry]
          const newMacros = newLog.reduce(
            (acc, e) => ({
              calories: acc.calories + e.calories,
              protein: acc.protein + e.protein,
              carbs: acc.carbs + e.carbs,
              fat: acc.fat + e.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          return { todaysFoodLog: newLog, todaysMacros: newMacros }
        }),

      removeFoodEntry: (id) =>
        set((state) => {
          const newLog = state.todaysFoodLog.filter((e) => e.id !== id)
          const newMacros = newLog.reduce(
            (acc, e) => ({
              calories: acc.calories + e.calories,
              protein: acc.protein + e.protein,
              carbs: acc.carbs + e.carbs,
              fat: acc.fat + e.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          return { todaysFoodLog: newLog, todaysMacros: newMacros }
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          athlete: null,
          stravaActivities: [],
          todaysFoodLog: [],
          todaysMacros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        }),
    }),
    {
      name: 'coach-storage',
      partialize: (state) => ({
        theme: state.theme,
        athlete: state.athlete,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
