import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import {
  getIntegrationStatus,
  saveStravaTokens,
  saveHevyApiKey,
  clearStravaTokens,
  clearHevyApiKey,
  type IntegrationStatus,
} from '@/services/firestore'

export function useIntegrations() {
  const { user } = useStore()
  const [status, setStatus] = useState<IntegrationStatus>({
    strava: { connected: false },
    hevy: { connected: false },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load integration status on mount
  useEffect(() => {
    if (user?.uid) {
      loadStatus()
    }
  }, [user?.uid])

  const loadStatus = useCallback(async () => {
    if (!user?.uid) return

    try {
      const integrationStatus = await getIntegrationStatus(user.uid)
      setStatus(integrationStatus)
    } catch (err) {
      console.error('Error loading integration status:', err)
    }
  }, [user?.uid])

  // Save Strava tokens directly (for personal use with existing tokens)
  const connectStrava = useCallback(
    async (accessToken: string, refreshToken: string) => {
      if (!user?.uid) return

      setLoading(true)
      setError(null)

      try {
        // Calculate expires_at (assume 6 hours from now, will refresh if needed)
        const expiresAt = Math.floor(Date.now() / 1000) + 21600

        await saveStravaTokens(user.uid, {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        })

        setStatus((prev) => ({
          ...prev,
          strava: { connected: true },
        }))

        return { success: true }
      } catch (err) {
        console.error('Error saving Strava tokens:', err)
        setError('Error al guardar tokens de Strava')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user?.uid]
  )

  const disconnectStrava = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      await clearStravaTokens(user.uid)
      setStatus((prev) => ({
        ...prev,
        strava: { connected: false },
      }))
    } catch (err) {
      console.error('Error disconnecting Strava:', err)
      setError('Error al desconectar Strava')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Save Hevy API Key directly
  const connectHevy = useCallback(
    async (apiKey: string) => {
      if (!user?.uid) return

      setLoading(true)
      setError(null)

      try {
        await saveHevyApiKey(user.uid, apiKey)
        setStatus((prev) => ({
          ...prev,
          hevy: { connected: true },
        }))
        return { success: true }
      } catch (err) {
        console.error('Error saving Hevy API key:', err)
        setError('Error al guardar API Key de Hevy')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user?.uid]
  )

  const disconnectHevy = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      await clearHevyApiKey(user.uid)
      setStatus((prev) => ({
        ...prev,
        hevy: { connected: false },
      }))
    } catch (err) {
      console.error('Error disconnecting Hevy:', err)
      setError('Error al desconectar Hevy')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  return {
    status,
    loading,
    error,
    loadStatus,
    connectStrava,
    disconnectStrava,
    connectHevy,
    disconnectHevy,
  }
}
