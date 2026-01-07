import { useState, useEffect, useCallback } from 'react'
import { useStore, type FoodEntry, type MacroTotals } from '@/store'
import {
  saveFoodEntry,
  removeFoodEntry as removeEntry,
  getNutritionDay,
  getNutritionHistory,
  type NutritionDayLog,
} from '@/services/firestore'

export function useNutrition() {
  const { user, todaysMacros, todaysFoodLog, setTodaysMacros, addFoodEntry, removeFoodEntry } =
    useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<NutritionDayLog[]>([])

  // Load today's nutrition when user changes
  useEffect(() => {
    if (user?.uid) {
      loadTodaysNutrition()
    }
  }, [user?.uid])

  const loadTodaysNutrition = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const dayLog = await getNutritionDay(user.uid)
      if (dayLog) {
        // Update store with loaded data
        setTodaysMacros(dayLog.totals)
        // Clear and re-add entries to sync store
        dayLog.entries.forEach((entry) => {
          addFoodEntry(entry)
        })
      }
    } catch (err) {
      setError('Error al cargar nutricion del dia')
      console.error('Error loading nutrition:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, setTodaysMacros, addFoodEntry])

  const logFood = useCallback(
    async (entry: Omit<FoodEntry, 'id'>) => {
      if (!user?.uid) return

      setError(null)

      const fullEntry: FoodEntry = {
        ...entry,
        id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      try {
        // Optimistic update
        addFoodEntry(fullEntry)

        // Save to Firestore
        await saveFoodEntry(user.uid, fullEntry)
      } catch (err) {
        // Rollback on error
        removeFoodEntry(fullEntry.id)
        setError('Error al registrar alimento')
        console.error('Error logging food:', err)
        throw err
      }
    },
    [user?.uid, addFoodEntry, removeFoodEntry]
  )

  const deleteFood = useCallback(
    async (entryId: string) => {
      if (!user?.uid) return

      setError(null)

      // Find entry for potential rollback
      const entry = todaysFoodLog.find((e) => e.id === entryId)

      try {
        // Optimistic update
        removeFoodEntry(entryId)

        // Remove from Firestore
        await removeEntry(user.uid, entryId)
      } catch (err) {
        // Rollback on error
        if (entry) {
          addFoodEntry(entry)
        }
        setError('Error al eliminar alimento')
        console.error('Error deleting food:', err)
        throw err
      }
    },
    [user?.uid, todaysFoodLog, addFoodEntry, removeFoodEntry]
  )

  const loadHistory = useCallback(
    async (days = 7) => {
      if (!user?.uid) return

      setLoading(true)

      try {
        const nutritionHistory = await getNutritionHistory(user.uid, days)
        setHistory(nutritionHistory)
      } catch (err) {
        console.error('Error loading nutrition history:', err)
      } finally {
        setLoading(false)
      }
    },
    [user?.uid]
  )

  // Calculate macro targets based on athlete profile
  const getMacroTargets = useCallback(
    (athlete: { weightKg: number; goals?: { primary?: { type: string } } } | null): MacroTotals => {
      if (!athlete) {
        return { calories: 2000, protein: 100, carbs: 250, fat: 70 }
      }

      const { weightKg, goals } = athlete
      const goalType = goals?.primary?.type || 'maintenance'

      // Base calculations
      let proteinPerKg = 1.6
      let carbsPerKg = 4
      let calories = weightKg * 30 // Base TDEE estimate

      switch (goalType) {
        case 'endurance':
          proteinPerKg = 1.6
          carbsPerKg = 5
          break
        case 'strength':
          proteinPerKg = 2.0
          carbsPerKg = 4
          calories = weightKg * 32
          break
        case 'body_composition':
          proteinPerKg = 2.2
          carbsPerKg = 2.5
          calories = weightKg * 26 // Deficit
          break
        default:
          proteinPerKg = 1.8
          carbsPerKg = 3.5
      }

      const protein = Math.round(weightKg * proteinPerKg)
      const carbs = Math.round(weightKg * carbsPerKg)
      const fat = Math.round((calories - protein * 4 - carbs * 4) / 9)

      return {
        calories: Math.round(calories),
        protein,
        carbs,
        fat: Math.max(fat, Math.round(weightKg * 0.8)), // Minimum fat
      }
    },
    []
  )

  return {
    todaysMacros,
    todaysFoodLog,
    loading,
    error,
    history,
    loadTodaysNutrition,
    logFood,
    deleteFood,
    loadHistory,
    getMacroTargets,
  }
}
