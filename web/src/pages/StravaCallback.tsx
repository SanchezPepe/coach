import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useIntegrations } from '@/hooks/useIntegrations'

export function StravaCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleStravaCallback } = useIntegrations()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setErrorMessage('Autorizacion denegada por el usuario')
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMessage('No se recibio codigo de autorizacion')
      return
    }

    // Exchange code for tokens
    handleStravaCallback(code)
      .then(() => {
        setStatus('success')
        // Redirect after success
        setTimeout(() => navigate('/profile'), 2000)
      })
      .catch((err) => {
        setStatus('error')
        setErrorMessage(err.message || 'Error al conectar con Strava')
      })
  }, [searchParams, handleStravaCallback, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          {status === 'loading' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold">Conectando con Strava</h2>
              <p className="text-muted-foreground mt-2">
                Por favor espera mientras completamos la conexion...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Strava Conectado!</h2>
              <p className="text-muted-foreground mt-2">
                Tu cuenta de Strava ha sido vinculada exitosamente.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Redirigiendo al perfil...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">Error de Conexion</h2>
              <p className="text-muted-foreground mt-2">{errorMessage}</p>
              <Button className="mt-4" onClick={() => navigate('/profile')}>
                Volver al Perfil
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
