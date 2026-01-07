import { useState, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'
import { useStore } from '@/store'
import {
  getIntegrationStatus,
  type IntegrationStatus,
  type StravaAthlete,
} from '@/services/firestore'

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID

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

  // Strava OAuth
  const connectStrava = useCallback(() => {
    if (!STRAVA_CLIENT_ID) {
      setError('Strava no está configurado')
      return
    }

    const redirectUri = `${window.location.origin}/strava/callback`
    const scope = 'read,activity:read_all,profile:read_all'

    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`

    window.location.href = authUrl
  }, [])

  const handleStravaCallback = useCallback(
    async (code: string) => {
      if (!user?.uid) return

      setLoading(true)
      setError(null)

      try {
        const stravaOAuthCallback = httpsCallable(functions, 'stravaOAuthCallback')
        const result = await stravaOAuthCallback({ code })
        const data = result.data as { success: boolean; athlete: StravaAthlete }

        if (data.success) {
          setStatus((prev) => ({
            ...prev,
            strava: {
              connected: true,
              athlete: data.athlete,
            },
          }))
        }

        return data
      } catch (err) {
        console.error('Error connecting Strava:', err)
        setError('Error al conectar con Strava')
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
      const disconnect = httpsCallable(functions, 'disconnectStrava')
      await disconnect({})

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

  // Hevy API Key
  const connectHevy = useCallback(
    async (apiKey: string) => {
      if (!user?.uid) return

      setLoading(true)
      setError(null)

      try {
        const saveKey = httpsCallable(functions, 'saveHevyApiKey')
        const result = await saveKey({ apiKey })
        const data = result.data as { success: boolean }

        if (data.success) {
          setStatus((prev) => ({
            ...prev,
            hevy: { connected: true },
          }))
        }

        return data
      } catch (err: any) {
        console.error('Error connecting Hevy:', err)
        if (err.code === 'functions/invalid-argument') {
          setError('API Key de Hevy inválida')
        } else {
          setError('Error al conectar con Hevy')
        }
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
      const disconnect = httpsCallable(functions, 'disconnectHevy')
      await disconnect({})

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
    handleStravaCallback,
    disconnectStrava,
    connectHevy,
    disconnectHevy,
  }
}
