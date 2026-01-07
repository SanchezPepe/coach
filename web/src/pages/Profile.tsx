import { useState, useEffect } from 'react'
import {
  User,
  Target,
  Heart,
  Scale,
  Ruler,
  Activity,
  Dumbbell,
  Edit2,
  Save,
  X,
  XCircle,
  CheckCircle,
  Apple,
  Loader2,
  Key,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAthlete } from '@/hooks/useAthlete'
import { useIntegrations } from '@/hooks/useIntegrations'

const goalOptions = [
  {
    type: 'endurance',
    title: 'Rendimiento en Carrera',
    description: 'Mejorar tiempos en 5K, 10K, 21K o maraton',
    icon: Activity,
    color: 'running',
  },
  {
    type: 'strength',
    title: 'Fuerza e Hipertrofia',
    description: 'Ganar musculo y aumentar fuerza',
    icon: Dumbbell,
    color: 'strength',
  },
  {
    type: 'body_composition',
    title: 'Composicion Corporal',
    description: 'Perder grasa o recomposicion corporal',
    icon: Apple,
    color: 'nutrition',
  },
]

export function Profile() {
  const { athlete, updateWeight, updateGoals, saveProfile, loading } = useAthlete()
  const {
    status: integrationStatus,
    loading: integrationLoading,
    error: integrationError,
    connectStrava,
    disconnectStrava,
    connectHevy,
    disconnectHevy,
  } = useIntegrations()
  const [activeTab, setActiveTab] = useState('profile')

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedAge, setEditedAge] = useState('')
  const [editedSex, setEditedSex] = useState<'male' | 'female'>('male')

  // Edit physical stats state
  const [isEditingWeight, setIsEditingWeight] = useState(false)
  const [editedWeight, setEditedWeight] = useState('')
  const [isEditingHeight, setIsEditingHeight] = useState(false)
  const [editedHeight, setEditedHeight] = useState('')
  const [isEditingHR, setIsEditingHR] = useState(false)
  const [editedMaxHR, setEditedMaxHR] = useState('')

  // Edit goals state
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState('')

  // Hevy API key state
  const [showHevyInput, setShowHevyInput] = useState(false)
  const [hevyApiKey, setHevyApiKey] = useState('')

  // Strava tokens state (for manual input)
  const [showStravaInput, setShowStravaInput] = useState(false)
  const [stravaAccessToken, setStravaAccessToken] = useState('')
  const [stravaRefreshToken, setStravaRefreshToken] = useState('')

  // Initialize edit values when athlete changes
  useEffect(() => {
    if (athlete) {
      setEditedName(athlete.name || '')
      setEditedAge(athlete.age?.toString() || '')
      setEditedSex(athlete.sex || 'male')
      setEditedWeight(athlete.weightKg?.toString() || '')
      setEditedHeight(athlete.heightCm?.toString() || '')
      setEditedMaxHR(athlete.maxHeartRate?.toString() || '')
      setSelectedGoal(athlete.goals?.primary?.type || 'endurance')
    }
  }, [athlete])

  const handleSaveProfile = async () => {
    if (!athlete) return
    await saveProfile({
      ...athlete,
      name: editedName,
      age: parseInt(editedAge),
      sex: editedSex,
    })
    setIsEditingProfile(false)
  }

  const handleSaveWeight = async () => {
    const weight = parseFloat(editedWeight)
    if (!isNaN(weight) && weight > 0) {
      await updateWeight(weight)
      setIsEditingWeight(false)
    }
  }

  const handleSaveHeight = async () => {
    if (!athlete) return
    const height = parseFloat(editedHeight)
    if (!isNaN(height) && height > 0) {
      await saveProfile({ ...athlete, heightCm: height })
      setIsEditingHeight(false)
    }
  }

  const handleSaveMaxHR = async () => {
    if (!athlete) return
    const maxHR = parseInt(editedMaxHR)
    if (!isNaN(maxHR) && maxHR > 0) {
      await saveProfile({ ...athlete, maxHeartRate: maxHR })
      setIsEditingHR(false)
    }
  }

  const handleSaveGoal = async () => {
    await updateGoals({
      primary: {
        type: selectedGoal as 'endurance' | 'strength' | 'body_composition',
      },
    })
    setIsEditingGoal(false)
  }

  const handleConnectHevy = async () => {
    if (!hevyApiKey.trim()) return
    try {
      await connectHevy(hevyApiKey)
      setShowHevyInput(false)
      setHevyApiKey('')
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleConnectStrava = async () => {
    if (!stravaAccessToken.trim() || !stravaRefreshToken.trim()) return
    try {
      await connectStrava(stravaAccessToken, stravaRefreshToken)
      setShowStravaInput(false)
      setStravaAccessToken('')
      setStravaRefreshToken('')
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const currentGoal = goalOptions.find(g => g.type === athlete?.goals?.primary?.type) || goalOptions[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">
          Tu informacion y configuracion
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Datos Personales</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  {isEditingProfile ? (
                    <div className="space-y-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Nombre"
                        className="w-48"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editedAge}
                          onChange={(e) => setEditedAge(e.target.value)}
                          placeholder="Edad"
                          className="w-20"
                        />
                        <Button
                          variant={editedSex === 'male' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditedSex('male')}
                        >
                          M
                        </Button>
                        <Button
                          variant={editedSex === 'female' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditedSex('female')}
                        >
                          F
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <CardTitle>{athlete?.name || 'Usuario'}</CardTitle>
                      <CardDescription>
                        {athlete?.age ? `${athlete.age} anos` : ''} •{' '}
                        {athlete?.sex === 'male' ? 'Masculino' : 'Femenino'}
                      </CardDescription>
                    </div>
                  )}
                </div>
                {isEditingProfile ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={loading}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Physical Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Fisicos</CardTitle>
              <CardDescription>
                Tu composicion corporal actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Weight */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    Peso
                  </div>
                  {isEditingWeight ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={editedWeight}
                        onChange={(e) => setEditedWeight(e.target.value)}
                        className="w-24"
                      />
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingWeight(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveWeight} disabled={loading}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {athlete?.weightKg || '--'} kg
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingWeight(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    Altura
                  </div>
                  {isEditingHeight ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editedHeight}
                        onChange={(e) => setEditedHeight(e.target.value)}
                        className="w-24"
                      />
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingHeight(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveHeight} disabled={loading}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {athlete?.heightCm || '--'} cm
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingHeight(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Body Fat */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Grasa Corporal
                  </div>
                  <p className="text-2xl font-bold">
                    {athlete?.bodyFatPercentage || '--'}%
                  </p>
                </div>

                {/* Max HR */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    FC Maxima
                  </div>
                  {isEditingHR ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editedMaxHR}
                        onChange={(e) => setEditedMaxHR(e.target.value)}
                        className="w-24"
                      />
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingHR(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSaveMaxHR} disabled={loading}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {athlete?.maxHeartRate || '--'} bpm
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditingHR(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Zones */}
          {athlete?.maxHeartRate && (
            <Card>
              <CardHeader>
                <CardTitle>Zonas de Frecuencia Cardiaca</CardTitle>
                <CardDescription>
                  Basadas en tu FC maxima de {athlete.maxHeartRate} bpm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { zone: 'Z1', name: 'Recuperacion', min: 50, max: 60 },
                    { zone: 'Z2', name: 'Aerobico', min: 60, max: 70 },
                    { zone: 'Z3', name: 'Tempo', min: 70, max: 80 },
                    { zone: 'Z4', name: 'Umbral', min: 80, max: 90 },
                    { zone: 'Z5', name: 'Maximo', min: 90, max: 100 },
                  ].map((zone, index) => {
                    const minBpm = Math.round((zone.min / 100) * athlete.maxHeartRate!)
                    const maxBpm = Math.round((zone.max / 100) * athlete.maxHeartRate!)
                    return (
                      <div
                        key={zone.zone}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{
                              backgroundColor: `hsl(${120 - index * 30}, 70%, 50%)`,
                            }}
                          >
                            {zone.zone}
                          </div>
                          <span className="font-medium">{zone.name}</span>
                        </div>
                        <span className="font-mono">
                          {minBpm} - {maxBpm} bpm
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Objetivo Principal</CardTitle>
                  <CardDescription>
                    Tu meta principal de entrenamiento
                  </CardDescription>
                </div>
                {!isEditingGoal && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingGoal(true)}>
                    Cambiar objetivo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingGoal ? (
                <div className="space-y-4">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal.type}
                      type="button"
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        selectedGoal === goal.type
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedGoal(goal.type)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-${goal.color}/10`}>
                          <goal.icon className={`h-5 w-5 text-${goal.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsEditingGoal(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveGoal} disabled={loading}>
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${currentGoal.color}/10`}>
                    <currentGoal.icon className={`h-6 w-6 text-${currentGoal.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{currentGoal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentGoal.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Servicios Conectados</CardTitle>
              <CardDescription>
                Sincroniza tus datos de otras aplicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrationError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {integrationError}
                </div>
              )}

              <div className="space-y-4">
                {/* Strava */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                        <Activity className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">Strava</p>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.strava.connected
                            ? 'Conectado y sincronizando'
                            : 'Sincroniza tus actividades de running y ciclismo'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integrationStatus.strava.connected ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={disconnectStrava}
                            disabled={integrationLoading}
                          >
                            {integrationLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Desconectar'
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setShowStravaInput(true)}
                            disabled={integrationLoading}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Conectar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Strava Tokens Input */}
                  {showStravaInput && !integrationStatus.strava.connected && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Ingresa tus tokens de Strava. Puedes obtenerlos de tu configuracion MCP o de la API de Strava.
                      </p>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Access Token"
                          value={stravaAccessToken}
                          onChange={(e) => setStravaAccessToken(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder="Refresh Token"
                          value={stravaRefreshToken}
                          onChange={(e) => setStravaRefreshToken(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowStravaInput(false)
                            setStravaAccessToken('')
                            setStravaRefreshToken('')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleConnectStrava}
                          disabled={integrationLoading || !stravaAccessToken.trim() || !stravaRefreshToken.trim()}
                        >
                          {integrationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Guardar'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hevy */}
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                        <Dumbbell className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Hevy</p>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.hevy.connected
                            ? 'Conectado y sincronizando'
                            : 'Sincroniza tus entrenamientos de fuerza'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integrationStatus.hevy.connected ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={disconnectHevy}
                            disabled={integrationLoading}
                          >
                            {integrationLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Desconectar'
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setShowHevyInput(true)}
                            disabled={integrationLoading}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Conectar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Hevy API Key Input */}
                  {showHevyInput && !integrationStatus.hevy.connected && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Ingresa tu API Key de Hevy. Puedes obtenerla en la configuracion de tu cuenta de Hevy.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="API Key de Hevy"
                          value={hevyApiKey}
                          onChange={(e) => setHevyApiKey(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowHevyInput(false)
                            setHevyApiKey('')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleConnectHevy}
                          disabled={integrationLoading || !hevyApiKey.trim()}
                        >
                          {integrationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Guardar'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
