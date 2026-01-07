import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

// Strava API Functions
export const getStravaActivities = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const userId = context.auth.uid
  const perPage = data.perPage || 30

  try {
    // Get user's Strava tokens
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData?.stravaTokens) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Strava not connected'
      )
    }

    const { access_token, refresh_token, expires_at } = userData.stravaTokens

    // Check if token needs refresh
    let currentToken = access_token
    if (Date.now() / 1000 > expires_at) {
      currentToken = await refreshStravaToken(userId, refresh_token)
    }

    // Fetch activities from Strava
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch Strava activities'
      )
    }

    const activities = await response.json()

    // Cache activities in Firestore
    const batch = db.batch()
    for (const activity of activities) {
      const activityRef = db
        .collection('stravaCache')
        .doc(userId)
        .collection('activities')
        .doc(activity.id.toString())
      batch.set(activityRef, activity, { merge: true })
    }
    await batch.commit()

    return activities
  } catch (error) {
    console.error('Error fetching Strava activities:', error)
    throw new functions.https.HttpsError('internal', 'Failed to fetch activities')
  }
})

async function refreshStravaToken(userId: string, refreshToken: string): Promise<string> {
  const clientId = functions.config().strava?.client_id
  const clientSecret = functions.config().strava?.client_secret

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token')
  }

  const tokens = await response.json()

  // Update tokens in Firestore
  await db.collection('users').doc(userId).update({
    stravaTokens: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    },
  })

  return tokens.access_token
}

// Hevy API Functions
export const getHevyWorkouts = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const userId = context.auth.uid
  const page = data.page || 1
  const pageSize = data.pageSize || 10

  try {
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData?.hevyApiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Hevy not connected'
      )
    }

    const response = await fetch(
      `https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'api-key': userData.hevyApiKey,
        },
      }
    )

    if (!response.ok) {
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch Hevy workouts'
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Hevy workouts:', error)
    throw new functions.https.HttpsError('internal', 'Failed to fetch workouts')
  }
})

// OpenNutrition API Functions
export const searchFoods = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const query = data.query
  const page = data.page || 1
  const pageSize = data.pageSize || 10

  if (!query) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Query is required'
    )
  }

  try {
    // This would call the OpenNutrition API
    // For now, return a placeholder
    return {
      results: [],
      page,
      pageSize,
      total: 0,
    }
  } catch (error) {
    console.error('Error searching foods:', error)
    throw new functions.https.HttpsError('internal', 'Failed to search foods')
  }
})

// Save athlete profile
export const saveAthleteProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const userId = context.auth.uid
  const profile = data.profile

  try {
    await db.collection('users').doc(userId).set(
      {
        profile,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return { success: true }
  } catch (error) {
    console.error('Error saving profile:', error)
    throw new functions.https.HttpsError('internal', 'Failed to save profile')
  }
})

// Log body composition
export const logBodyComposition = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const userId = context.auth.uid
  const { weightKg, bodyFatPercentage } = data

  try {
    const leanMassKg = weightKg * (1 - bodyFatPercentage / 100)
    const fatMassKg = weightKg * (bodyFatPercentage / 100)

    const entry = {
      weightKg,
      bodyFatPercentage,
      leanMassKg,
      fatMassKg,
      date: admin.firestore.FieldValue.serverTimestamp(),
    }

    await db
      .collection('users')
      .doc(userId)
      .collection('bodyComposition')
      .add(entry)

    // Also update the main profile
    await db.collection('users').doc(userId).update({
      'profile.weightKg': weightKg,
      'profile.bodyFatPercentage': bodyFatPercentage,
    })

    return { success: true, entry }
  } catch (error) {
    console.error('Error logging body composition:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to log body composition'
    )
  }
})
