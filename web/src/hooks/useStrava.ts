import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import { getStravaActivities, type StravaActivity } from '@/services/strava'

export function useStrava() {
  const user = useStore((state) => state.user)
  const [activities, setActivities] = useState<StravaActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async (page = 1, perPage = 30) => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const data = await getStravaActivities(user.uid, page, perPage)
      setActivities(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching activities'
      setError(message)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid) {
      fetchActivities()
    }
  }, [user?.uid, fetchActivities])

  const recentRuns = activities.filter(
    (a) => a.type === 'Run' || a.sport_type === 'Run'
  )

  const weeklyStats = calculateWeeklyStats(activities)

  return {
    activities,
    recentRuns,
    weeklyStats,
    loading,
    error,
    refresh: fetchActivities,
  }
}

function calculateWeeklyStats(activities: StravaActivity[]) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const weekActivities = activities.filter(
    (a) => new Date(a.start_date_local) >= oneWeekAgo
  )

  const runs = weekActivities.filter(
    (a) => a.type === 'Run' || a.sport_type === 'Run'
  )

  return {
    totalDistance: runs.reduce((sum, a) => sum + a.distance, 0) / 1000, // km
    totalTime: runs.reduce((sum, a) => sum + a.moving_time, 0) / 60, // minutes
    totalElevation: runs.reduce((sum, a) => sum + a.total_elevation_gain, 0),
    runCount: runs.length,
    avgPace: runs.length > 0
      ? runs.reduce((sum, a) => sum + a.moving_time, 0) /
        runs.reduce((sum, a) => sum + a.distance, 0) * 1000 / 60
      : 0, // min/km
  }
}
