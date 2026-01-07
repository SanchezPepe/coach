import { useState, useEffect, useCallback } from 'react'
import { useStore, type Athlete } from '@/store'
import {
  getAthleteProfile,
  saveAthleteProfile,
  updateAthleteWeight,
  updateAthleteGoals,
  logBodyComposition,
  getBodyCompositionHistory,
  type BodyCompositionEntry,
} from '@/services/firestore'

export function useAthlete() {
  const { user, athlete, setAthlete } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bodyCompHistory, setBodyCompHistory] = useState<BodyCompositionEntry[]>([])

  // Load athlete profile when user changes
  useEffect(() => {
    if (user?.uid) {
      loadProfile()
    }
  }, [user?.uid])

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const profile = await getAthleteProfile(user.uid)
      if (profile) {
        setAthlete(profile)
      }
    } catch (err) {
      setError('Error al cargar el perfil')
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.uid, setAthlete])

  const saveProfile = useCallback(
    async (profile: Athlete) => {
      if (!user?.uid) return

      setLoading(true)
      setError(null)

      try {
        await saveAthleteProfile(user.uid, profile)
        setAthlete(profile)
      } catch (err) {
        setError('Error al guardar el perfil')
        console.error('Error saving profile:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user?.uid, setAthlete]
  )

  const updateWeight = useCallback(
    async (weightKg: number) => {
      if (!user?.uid || !athlete) return

      setError(null)

      try {
        await updateAthleteWeight(user.uid, weightKg)
        setAthlete({ ...athlete, weightKg })
      } catch (err) {
        setError('Error al actualizar el peso')
        console.error('Error updating weight:', err)
        throw err
      }
    },
    [user?.uid, athlete, setAthlete]
  )

  const updateGoals = useCallback(
    async (goals: Athlete['goals']) => {
      if (!user?.uid || !athlete) return

      setError(null)

      try {
        await updateAthleteGoals(user.uid, goals)
        setAthlete({ ...athlete, goals })
      } catch (err) {
        setError('Error al actualizar los objetivos')
        console.error('Error updating goals:', err)
        throw err
      }
    },
    [user?.uid, athlete, setAthlete]
  )

  const logBodyComp = useCallback(
    async (entry: Omit<BodyCompositionEntry, 'id'>) => {
      if (!user?.uid) return

      setError(null)

      try {
        await logBodyComposition(user.uid, entry)

        // Update local athlete state
        if (athlete) {
          setAthlete({
            ...athlete,
            weightKg: entry.weightKg,
            ...(entry.bodyFatPercentage && {
              bodyFatPercentage: entry.bodyFatPercentage,
            }),
          })
        }

        // Reload history
        await loadBodyCompHistory()
      } catch (err) {
        setError('Error al registrar composicion corporal')
        console.error('Error logging body composition:', err)
        throw err
      }
    },
    [user?.uid, athlete, setAthlete]
  )

  const loadBodyCompHistory = useCallback(async () => {
    if (!user?.uid) return

    try {
      const history = await getBodyCompositionHistory(user.uid)
      setBodyCompHistory(history)
    } catch (err) {
      console.error('Error loading body composition history:', err)
    }
  }, [user?.uid])

  return {
    athlete,
    loading,
    error,
    bodyCompHistory,
    loadProfile,
    saveProfile,
    updateWeight,
    updateGoals,
    logBodyComp,
    loadBodyCompHistory,
  }
}
