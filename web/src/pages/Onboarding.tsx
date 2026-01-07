import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore, type Athlete } from '@/store'
import { saveAthleteProfile } from '@/services/firestore'

type Step = 'basics' | 'physical' | 'goals' | 'complete'

const goalOptions = [
  {
    type: 'endurance',
    title: 'Rendimiento en Carrera',
    description: 'Mejorar tiempos en 5K, 10K, 21K o maraton',
    icon: '🏃',
  },
  {
    type: 'strength',
    title: 'Fuerza e Hipertrofia',
    description: 'Ganar musculo y aumentar fuerza',
    icon: '💪',
  },
  {
    type: 'body_composition',
    title: 'Composicion Corporal',
    description: 'Perder grasa o recomposicion corporal',
    icon: '⚖️',
  },
]

export function Onboarding() {
  const navigate = useNavigate()
  const { user, setAthlete } = useStore()
  const [step, setStep] = useState<Step>('basics')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [restingHR, setRestingHR] = useState('')
  const [maxHR, setMaxHR] = useState('')
  const [goalType, setGoalType] = useState<'endurance' | 'strength' | 'body_composition'>('endurance')

  const handleNext = () => {
    if (step === 'basics') setStep('physical')
    else if (step === 'physical') setStep('goals')
    else if (step === 'goals') handleComplete()
  }

  const handleBack = () => {
    if (step === 'physical') setStep('basics')
    else if (step === 'goals') setStep('physical')
  }

  const handleComplete = async () => {
    if (!user?.uid) return

    setLoading(true)
    setError('')

    try {
      const profile: Athlete = {
        id: `athlete_${Date.now()}`,
        name,
        age: parseInt(age),
        sex,
        weightKg: parseFloat(weightKg),
        heightCm: parseFloat(heightCm),
        maxHeartRate: maxHR ? parseInt(maxHR) : Math.round(220 - parseInt(age)),
        goals: {
          primary: {
            type: goalType,
          },
        },
      }

      // Only add optional fields if they have values
      if (restingHR) {
        profile.restingHeartRate = parseInt(restingHR)
      }

      await saveAthleteProfile(user.uid, profile)
      setAthlete(profile)
      setStep('complete')

      // Redirect after a short delay
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError('Error al guardar el perfil')
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const isBasicsValid = name.length >= 2 && age && parseInt(age) > 0
  const isPhysicalValid = weightKg && heightCm && parseFloat(weightKg) > 0 && parseFloat(heightCm) > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
            <Activity className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Configuracion Inicial</h1>
          <p className="text-muted-foreground mt-1">
            Paso {step === 'basics' ? 1 : step === 'physical' ? 2 : step === 'goals' ? 3 : 4} de 4
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {['basics', 'physical', 'goals', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                ['basics', 'physical', 'goals', 'complete'].indexOf(step) >= i
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 'basics' && (
          <Card>
            <CardHeader>
              <CardTitle>Informacion Basica</CardTitle>
              <CardDescription>Cuentanos sobre ti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Edad</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={sex === 'male' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setSex('male')}
                  >
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    variant={sex === 'female' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setSex('female')}
                  >
                    Femenino
                  </Button>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={handleNext}
                disabled={!isBasicsValid}
              >
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'physical' && (
          <Card>
            <CardHeader>
              <CardTitle>Datos Fisicos</CardTitle>
              <CardDescription>Tu composicion actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Peso (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Altura (cm)</label>
                  <Input
                    type="number"
                    placeholder="175"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">FC Reposo (opcional)</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={restingHR}
                    onChange={(e) => setRestingHR(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">FC Maxima (opcional)</label>
                  <Input
                    type="number"
                    placeholder={age ? String(220 - parseInt(age)) : '190'}
                    value={maxHR}
                    onChange={(e) => setMaxHR(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Si no conoces tu FC maxima, usaremos la formula 220 - edad
              </p>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Atras
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  disabled={!isPhysicalValid}
                >
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'goals' && (
          <Card>
            <CardHeader>
              <CardTitle>Tu Objetivo Principal</CardTitle>
              <CardDescription>Que quieres lograr?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goalOptions.map((goal) => (
                <button
                  key={goal.type}
                  type="button"
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    goalType === goal.type
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setGoalType(goal.type as typeof goalType)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Atras
                </Button>
                <Button className="flex-1" onClick={handleNext} disabled={loading}>
                  {loading ? 'Guardando...' : 'Completar'}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Perfil Creado!</h2>
              <p className="text-muted-foreground mt-2">
                Redirigiendo al dashboard...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
