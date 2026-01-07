import { getStravaTokens, type StravaTokens } from './firestore'

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date_local: string
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  total_elevation_gain: number // meters
  average_speed: number // m/s
  max_speed: number // m/s
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  suffer_score?: number
  average_cadence?: number
  has_heartrate: boolean
}

export interface StravaAthleteStats {
  recent_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  ytd_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
  all_run_totals: {
    count: number
    distance: number
    moving_time: number
    elapsed_time: number
    elevation_gain: number
  }
}

async function refreshTokenIfNeeded(
  _userId: string,
  tokens: StravaTokens
): Promise<string> {
  // Check if token is expired (with 5 min buffer)
  const now = Math.floor(Date.now() / 1000)
  if (tokens.expires_at > now + 300) {
    return tokens.access_token
  }

  // Token needs refresh - but we don't have client credentials in frontend
  // For now, just return the current token and let the API call fail if expired
  // The user will need to update their tokens manually
  console.warn('Strava token may be expired. Please update tokens if API calls fail.')
  return tokens.access_token
}

export async function getStravaActivities(
  userId: string,
  page = 1,
  perPage = 30
): Promise<StravaActivity[]> {
  const tokens = await getStravaTokens(userId)
  if (!tokens) {
    throw new Error('Strava not connected')
  }

  const accessToken = await refreshTokenIfNeeded(userId, tokens)

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Strava token expired. Please reconnect.')
    }
    throw new Error('Failed to fetch Strava activities')
  }

  return response.json()
}

export async function getStravaActivity(
  userId: string,
  activityId: number
): Promise<StravaActivity> {
  const tokens = await getStravaTokens(userId)
  if (!tokens) {
    throw new Error('Strava not connected')
  }

  const accessToken = await refreshTokenIfNeeded(userId, tokens)

  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Strava activity')
  }

  return response.json()
}

export async function getStravaAthleteStats(
  userId: string,
  athleteId: number
): Promise<StravaAthleteStats> {
  const tokens = await getStravaTokens(userId)
  if (!tokens) {
    throw new Error('Strava not connected')
  }

  const accessToken = await refreshTokenIfNeeded(userId, tokens)

  const response = await fetch(
    `${STRAVA_API_BASE}/athletes/${athleteId}/stats`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch Strava stats')
  }

  return response.json()
}
