import { useState } from 'react'
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
  Link,
  CheckCircle,
  XCircle,
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
import { useStore } from '@/store'

export function Profile() {
  const { athlete, updateWeight } = useStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [editedWeight, setEditedWeight] = useState(athlete?.weightKg?.toString() || '')

  const handleSaveWeight = () => {
    const weight = parseFloat(editedWeight)
    if (!isNaN(weight) && weight > 0) {
      updateWeight(weight)
      setIsEditing(false)
    }
  }

  // Integration status (would come from actual connection state)
  const integrations = [
    { name: 'Strava', connected: true, icon: Activity },
    { name: 'Hevy', connected: false, icon: Dumbbell },
  ]

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
                  <div>
                    <CardTitle>{athlete?.name || 'Usuario'}</CardTitle>
                    <CardDescription>
                      {athlete?.age ? `${athlete.age} anos` : ''} •{' '}
                      {athlete?.sex === 'male' ? 'Masculino' : 'Femenino'}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    Peso
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editedWeight}
                        onChange={(e) => setEditedWeight(e.target.value)}
                        className="w-24"
                      />
                      <Button size="sm" onClick={handleSaveWeight}>
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
                        onClick={() => {
                          setIsEditing(true)
                          setEditedWeight(athlete?.weightKg?.toString() || '')
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    Altura
                  </div>
                  <p className="text-2xl font-bold">
                    {athlete?.heightCm || '--'} cm
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Grasa Corporal
                  </div>
                  <p className="text-2xl font-bold">
                    {athlete?.bodyFatPercentage || '--'}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    FC Maxima
                  </div>
                  <p className="text-2xl font-bold">
                    {athlete?.maxHeartRate || '--'} bpm
                  </p>
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
                <Button variant="outline" size="sm">
                  Cambiar objetivo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-running/10">
                  <Activity className="h-6 w-6 text-running" />
                </div>
                <div>
                  <p className="font-semibold">Media Maraton (21K)</p>
                  <p className="text-sm text-muted-foreground">
                    Fecha objetivo: 15 de Abril, 2026
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tiempo objetivo: 1:45:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Objetivo Secundario</CardTitle>
                  <CardDescription>
                    Complementa tu objetivo principal
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-strength/10">
                  <Dumbbell className="h-6 w-6 text-strength" />
                </div>
                <div>
                  <p className="font-semibold">Mantenimiento de Fuerza</p>
                  <p className="text-sm text-muted-foreground">
                    Prevenir perdida muscular durante el entrenamiento de carrera
                  </p>
                </div>
              </div>
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
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected
                            ? 'Conectado y sincronizando'
                            : 'No conectado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <Button variant="outline" size="sm">
                            Desconectar
                          </Button>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                          <Button variant="default" size="sm">
                            <Link className="mr-2 h-4 w-4" />
                            Conectar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
