import { useState } from 'react'
import {
  Activity,
  TrendingUp,
  Heart,
  Timer,
  Mountain,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useStrava } from '@/hooks'
import { formatDistance, formatPace, formatDuration, formatDateShort } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function Running() {
  const { activities, weeklyStats, loading, error, refresh } = useStrava()
  const [activeTab, setActiveTab] = useState('activities')

  // Pace zones (would come from running module)
  const paceZones = [
    { name: 'Recuperacion', min: '6:30', max: '7:00', description: 'Muy facil, conversacional' },
    { name: 'Facil', min: '5:45', max: '6:15', description: 'Aerobico, comodo' },
    { name: 'Maraton', min: '5:15', max: '5:30', description: 'Ritmo de carrera larga' },
    { name: 'Umbral', min: '4:45', max: '5:00', description: 'Comfortably hard' },
    { name: 'Intervalos', min: '4:15', max: '4:30', description: 'Trabajo de velocidad' },
  ]

  // Training plan phases (would come from running module)
  const trainingPlan = {
    currentWeek: 4,
    totalWeeks: 16,
    phase: 'Construccion',
    targetRace: '21K',
    targetDate: '2026-04-15',
    weeklyKm: 45,
    longRun: 18,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Running</h1>
          <p className="text-muted-foreground">
            Actividades, planes y analisis
          </p>
        </div>
        <Button variant="running" onClick={() => refresh()} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sincronizar
        </Button>
      </div>

      {/* Training Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan de Entrenamiento</CardTitle>
              <CardDescription>
                Objetivo: {trainingPlan.targetRace} - {trainingPlan.targetDate}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver plan completo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Progreso</p>
              <p className="text-2xl font-bold">
                Semana {trainingPlan.currentWeek}/{trainingPlan.totalWeeks}
              </p>
              <Progress
                value={(trainingPlan.currentWeek / trainingPlan.totalWeeks) * 100}
                indicatorClassName="bg-running"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fase Actual</p>
              <p className="text-2xl font-bold">{trainingPlan.phase}</p>
              <p className="text-sm text-muted-foreground">
                Enfoque en volumen aerobico
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Volumen Semanal</p>
              <p className="text-2xl font-bold">{trainingPlan.weeklyKm} km</p>
              <p className="text-sm text-muted-foreground">
                Objetivo de esta semana
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tirada Larga</p>
              <p className="text-2xl font-bold">{trainingPlan.longRun} km</p>
              <p className="text-sm text-muted-foreground">
                Este domingo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
          <TabsTrigger value="zones">Zonas de Ritmo</TabsTrigger>
          <TabsTrigger value="stats">Estadisticas</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Error al cargar actividades
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {error}
                </p>
                <Link to="/profile">
                  <Button variant="running" className="mt-4">
                    Configurar Strava
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Sin actividades
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Conecta tu cuenta de Strava para ver tus actividades y analisis de rendimiento
                </p>
                <Link to="/profile">
                  <Button variant="running" className="mt-4">
                    Conectar Strava
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-running/10">
                        <Activity className="h-6 w-6 text-running" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{activity.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDateShort(new Date(activity.start_date_local))} • {activity.sport_type}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalles
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDistance(activity.distance)}
                        </p>
                        <p className="text-xs text-muted-foreground">Distancia</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatDuration(activity.moving_time)}
                        </p>
                        <p className="text-xs text-muted-foreground">Tiempo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {formatPace(activity.moving_time / (activity.distance / 1000))}
                        </p>
                        <p className="text-xs text-muted-foreground">Ritmo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.total_elevation_gain}m
                        </p>
                        <p className="text-xs text-muted-foreground">Desnivel</p>
                      </div>
                    </div>
                    {activity.average_heartrate && (
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {Math.round(activity.average_heartrate)} bpm
                          </p>
                          <p className="text-xs text-muted-foreground">FC Media</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zonas de Ritmo</CardTitle>
              <CardDescription>
                Basado en tu objetivo de carrera y tiempos recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paceZones.map((zone, index) => (
                  <div
                    key={zone.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full font-bold"
                        style={{
                          backgroundColor: `hsl(${142 - index * 25}, 70%, ${45 + index * 5}%)`,
                          color: 'white',
                        }}
                      >
                        Z{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{zone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {zone.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">
                        {zone.min} - {zone.max}
                      </p>
                      <p className="text-sm text-muted-foreground">min/km</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Distancia (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `${weeklyStats.totalDistance.toFixed(1)} km`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklyStats.runCount} carreras
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tiempo (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    formatDuration(weeklyStats.totalTime * 60)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tiempo en movimiento
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Ritmo Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : weeklyStats.avgPace > 0 ? (
                    formatPace(weeklyStats.avgPace * 60)
                  ) : (
                    '--:--'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  min/km promedio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Desnivel (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `${Math.round(weeklyStats.totalElevation)}m`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ganancia acumulada
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Carga de Entrenamiento</CardTitle>
              <CardDescription>
                Relacion aguda/cronica de los ultimos 28 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-running">1.15</div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    Zona Optima
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Entre 0.8 y 1.3 es ideal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
