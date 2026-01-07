import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import {
  getHevyWorkouts,
  calculateWorkoutStats,
  type HevyWorkout,
} from '@/services/hevy'

export function useHevy() {
  const user = useStore((state) => state.user)
  const [workouts, setWorkouts] = useState<HevyWorkout[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkouts = useCallback(async (page = 1, pageSize = 10) => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const data = await getHevyWorkouts(user.uid, page, pageSize)
      setWorkouts(data.workouts)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching workouts'
      setError(message)
      setWorkouts([])
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid) {
      fetchWorkouts()
    }
  }, [user?.uid, fetchWorkouts])

  const weeklyStats = calculateWeeklyStats(workouts)

  return {
    workouts,
    weeklyStats,
    loading,
    error,
    refresh: fetchWorkouts,
    calculateWorkoutStats,
  }
}

function calculateWeeklyStats(workouts: HevyWorkout[]) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const weekWorkouts = workouts.filter(
    (w) => new Date(w.start_time) >= oneWeekAgo
  )

  let totalSets = 0
  let totalVolume = 0
  let totalDuration = 0

  for (const workout of weekWorkouts) {
    const stats = calculateWorkoutStats(workout)
    totalSets += stats.totalSets
    totalVolume += stats.totalVolume
    totalDuration += stats.durationMinutes
  }

  return {
    workoutCount: weekWorkouts.length,
    totalSets,
    totalVolume: Math.round(totalVolume),
    totalDuration, // minutes
  }
}
