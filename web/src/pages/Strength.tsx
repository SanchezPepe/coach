import { useState } from 'react'
import {
  Dumbbell,
  Calendar,
  ChevronRight,
  Clock,
  Target,
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
import { useHevy } from '@/hooks'
import { Link } from 'react-router-dom'
import { formatDateShort } from '@/lib/utils'

export function Strength() {
  const { workouts, weeklyStats, loading, error, refresh, calculateWorkoutStats } = useHevy()
  const [activeTab, setActiveTab] = useState('today')

  // Get the most recent workout for "today's routine" view
  const latestWorkout = workouts[0]
  const latestWorkoutStats = latestWorkout ? calculateWorkoutStats(latestWorkout) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fuerza</h1>
          <p className="text-muted-foreground">
            Rutinas, ejercicios y progreso
          </p>
        </div>
        <Button variant="strength" onClick={() => refresh()} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Sincronizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="routines">Rutinas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Latest Workout */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Error al cargar entrenamientos
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {error}
                </p>
                <Link to="/profile">
                  <Button variant="strength" className="mt-4">
                    Configurar Hevy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : !latestWorkout ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  Sin entrenamientos
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Conecta tu cuenta de Hevy para ver tus entrenamientos
                </p>
                <Link to="/profile">
                  <Button variant="strength" className="mt-4">
                    Conectar Hevy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Ultimo Entrenamiento
                    </CardTitle>
                    <CardDescription>
                      {latestWorkout.title} - {formatDateShort(new Date(latestWorkout.start_time))}
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Ver detalles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{latestWorkoutStats?.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {latestWorkout.exercises.length} ejercicios
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {latestWorkoutStats?.totalSets} sets
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {latestWorkout.exercises.map((exercise, index) => (
                    <div
                      key={`${exercise.exercise_template_id}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-strength/10 text-sm font-medium text-strength">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{exercise.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets.length} sets
                            {exercise.sets[0]?.weight_kg && ` • ${exercise.sets[0].weight_kg}kg`}
                            {exercise.sets[0]?.reps && ` x ${exercise.sets[0].reps}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    weeklyStats.workoutCount
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  sesiones completadas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Volumen Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    `${weeklyStats.totalVolume.toLocaleString()} kg`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  esta semana
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Sets Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    weeklyStats.totalSets
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  esta semana
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">
                Rutinas desde Hevy
              </h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Las rutinas se sincronizan automaticamente desde tu cuenta de Hevy
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entrenamientos Recientes</CardTitle>
              <CardDescription>
                Sincronizado desde Hevy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">{error}</p>
                  <Link to="/profile">
                    <Button variant="outline" className="mt-4">
                      Configurar Hevy
                    </Button>
                  </Link>
                </div>
              ) : workouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No hay entrenamientos recientes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workouts.map((workout) => {
                    const stats = calculateWorkoutStats(workout)
                    return (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-strength/10">
                            <Dumbbell className="h-6 w-6 text-strength" />
                          </div>
                          <div>
                            <p className="font-medium">{workout.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateShort(new Date(workout.start_time))} • {workout.exercises.length} ejercicios
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {stats.durationMinutes} min
                            </div>
                            {stats.totalVolume > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Target className="h-3 w-3" />
                                {stats.totalVolume.toLocaleString()} kg
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
