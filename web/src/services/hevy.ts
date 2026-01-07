import { getHevyApiKey } from './firestore'

const HEVY_API_BASE = 'https://api.hevyapp.com/v1'

export interface HevySet {
  type: 'normal' | 'warmup' | 'dropset' | 'failure'
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
  rpe?: number
}

export interface HevyExercise {
  exercise_template_id: string
  title: string
  notes?: string
  sets: HevySet[]
}

export interface HevyWorkout {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  exercises: HevyExercise[]
}

export interface HevyExerciseTemplate {
  id: string
  title: string
  type: string
  primary_muscle_group: string
  secondary_muscle_groups: string[]
  equipment: string
}

export interface HevyRoutine {
  id: string
  title: string
  folder_id?: number
  exercises: {
    exercise_template_id: string
    superset_id?: number
    rest_seconds?: number
    notes?: string
    sets: HevySet[]
  }[]
}

export async function getHevyWorkouts(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<{ workouts: HevyWorkout[]; page: number; page_count: number }> {
  const apiKey = await getHevyApiKey(userId)
  if (!apiKey) {
    throw new Error('Hevy not connected')
  }

  const response = await fetch(
    `${HEVY_API_BASE}/workouts?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'api-key': apiKey,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Hevy API key. Please reconnect.')
    }
    throw new Error('Failed to fetch Hevy workouts')
  }

  return response.json()
}

export async function getHevyWorkout(
  userId: string,
  workoutId: string
): Promise<HevyWorkout> {
  const apiKey = await getHevyApiKey(userId)
  if (!apiKey) {
    throw new Error('Hevy not connected')
  }

  const response = await fetch(
    `${HEVY_API_BASE}/workouts/${workoutId}`,
    {
      headers: {
        'api-key': apiKey,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Hevy workout')
  }

  return response.json()
}

export async function getHevyRoutines(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<{ routines: HevyRoutine[]; page: number; page_count: number }> {
  const apiKey = await getHevyApiKey(userId)
  if (!apiKey) {
    throw new Error('Hevy not connected')
  }

  const response = await fetch(
    `${HEVY_API_BASE}/routines?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'api-key': apiKey,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Hevy routines')
  }

  return response.json()
}

export async function getHevyExerciseTemplates(
  userId: string,
  page = 1,
  pageSize = 100
): Promise<{ exercise_templates: HevyExerciseTemplate[]; page: number; page_count: number }> {
  const apiKey = await getHevyApiKey(userId)
  if (!apiKey) {
    throw new Error('Hevy not connected')
  }

  const response = await fetch(
    `${HEVY_API_BASE}/exercise_templates?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'api-key': apiKey,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Hevy exercise templates')
  }

  return response.json()
}

// Helper to calculate workout stats
export function calculateWorkoutStats(workout: HevyWorkout) {
  let totalSets = 0
  let totalVolume = 0 // kg
  let exerciseCount = workout.exercises.length

  for (const exercise of workout.exercises) {
    for (const set of exercise.sets) {
      if (set.type !== 'warmup') {
        totalSets++
        if (set.weight_kg && set.reps) {
          totalVolume += set.weight_kg * set.reps
        }
      }
    }
  }

  const duration = new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()
  const durationMinutes = Math.round(duration / 60000)

  return {
    totalSets,
    totalVolume: Math.round(totalVolume),
    exerciseCount,
    durationMinutes,
  }
}
