import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Athlete, FoodEntry, MacroTotals } from '@/store'

// ============ ATHLETE PROFILE ============

export async function getAthleteProfile(userId: string): Promise<Athlete | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists() && userDoc.data().profile) {
    return userDoc.data().profile as Athlete
  }
  return null
}

export async function saveAthleteProfile(userId: string, profile: Athlete): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function updateAthleteWeight(userId: string, weightKg: number): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    'profile.weightKg': weightKg,
    updatedAt: serverTimestamp(),
  })
}

export async function updateAthleteGoals(
  userId: string,
  goals: Athlete['goals']
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    'profile.goals': goals,
    updatedAt: serverTimestamp(),
  })
}

// ============ BODY COMPOSITION ============

export interface BodyCompositionEntry {
  id?: string
  weightKg: number
  bodyFatPercentage?: number
  leanMassKg?: number
  fatMassKg?: number
  date: Date
}

export async function logBodyComposition(
  userId: string,
  entry: Omit<BodyCompositionEntry, 'id'>
): Promise<string> {
  const leanMassKg = entry.bodyFatPercentage
    ? entry.weightKg * (1 - entry.bodyFatPercentage / 100)
    : undefined
  const fatMassKg = entry.bodyFatPercentage
    ? entry.weightKg * (entry.bodyFatPercentage / 100)
    : undefined

  const docRef = await addDoc(
    collection(db, 'users', userId, 'bodyComposition'),
    {
      ...entry,
      leanMassKg,
      fatMassKg,
      date: Timestamp.fromDate(entry.date),
      createdAt: serverTimestamp(),
    }
  )

  // Also update the main profile
  await updateDoc(doc(db, 'users', userId), {
    'profile.weightKg': entry.weightKg,
    ...(entry.bodyFatPercentage && {
      'profile.bodyFatPercentage': entry.bodyFatPercentage,
    }),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getBodyCompositionHistory(
  userId: string,
  limitCount = 30
): Promise<BodyCompositionEntry[]> {
  const q = query(
    collection(db, 'users', userId, 'bodyComposition'),
    orderBy('date', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
  })) as BodyCompositionEntry[]
}

// ============ NUTRITION LOG ============

export interface NutritionDayLog {
  date: string // YYYY-MM-DD
  entries: FoodEntry[]
  totals: MacroTotals
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function saveFoodEntry(
  userId: string,
  entry: FoodEntry,
  date: Date = new Date()
): Promise<void> {
  const dateStr = getDateString(date)
  const dayRef = doc(db, 'users', userId, 'nutritionLogs', dateStr)

  const dayDoc = await getDoc(dayRef)

  if (dayDoc.exists()) {
    const data = dayDoc.data()
    const entries = [...(data.entries || []), entry]
    const totals = calculateTotals(entries)

    await updateDoc(dayRef, {
      entries,
      totals,
      updatedAt: serverTimestamp(),
    })
  } else {
    const entries = [entry]
    const totals = calculateTotals(entries)

    await setDoc(dayRef, {
      date: dateStr,
      entries,
      totals,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function removeFoodEntry(
  userId: string,
  entryId: string,
  date: Date = new Date()
): Promise<void> {
  const dateStr = getDateString(date)
  const dayRef = doc(db, 'users', userId, 'nutritionLogs', dateStr)

  const dayDoc = await getDoc(dayRef)

  if (dayDoc.exists()) {
    const data = dayDoc.data()
    const entries = (data.entries || []).filter(
      (e: FoodEntry) => e.id !== entryId
    )
    const totals = calculateTotals(entries)

    await updateDoc(dayRef, {
      entries,
      totals,
      updatedAt: serverTimestamp(),
    })
  }
}

export async function getNutritionDay(
  userId: string,
  date: Date = new Date()
): Promise<NutritionDayLog | null> {
  const dateStr = getDateString(date)
  const dayDoc = await getDoc(doc(db, 'users', userId, 'nutritionLogs', dateStr))

  if (dayDoc.exists()) {
    const data = dayDoc.data()
    return {
      date: data.date,
      entries: data.entries || [],
      totals: data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    }
  }

  return null
}

export async function getNutritionHistory(
  userId: string,
  days = 7
): Promise<NutritionDayLog[]> {
  const logs: NutritionDayLog[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const log = await getNutritionDay(userId, date)
    if (log) {
      logs.push(log)
    }
  }

  return logs
}

function calculateTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

// ============ USER SETTINGS ============

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  units: 'metric' | 'imperial'
  notifications: boolean
  language: 'es' | 'en'
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists() && userDoc.data().settings) {
    return userDoc.data().settings as UserSettings
  }
  return null
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

// ============ INTEGRATIONS ============

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

export async function saveStravaTokens(
  userId: string,
  tokens: StravaTokens
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      stravaTokens: tokens,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function getStravaTokens(userId: string): Promise<StravaTokens | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists() && userDoc.data().stravaTokens) {
    return userDoc.data().stravaTokens as StravaTokens
  }
  return null
}

export async function saveHevyApiKey(userId: string, apiKey: string): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      hevyApiKey: apiKey,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function getHevyApiKey(userId: string): Promise<string | null> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists() && userDoc.data().hevyApiKey) {
    return userDoc.data().hevyApiKey as string
  }
  return null
}

// ============ INITIALIZATION ============

export async function initializeUserDocument(
  userId: string,
  email: string
): Promise<void> {
  const userDoc = await getDoc(doc(db, 'users', userId))

  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', userId), {
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        theme: 'dark',
        units: 'metric',
        notifications: true,
        language: 'es',
      },
    })
  }
}
