import { useState } from 'react'
import {
  Dumbbell,
  Calendar,
  ChevronRight,
  Play,
  Clock,
  Target,
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

// Sample routine data (would come from strength module)
const todaysRoutine = {
  name: 'Fuerza - Tren Superior',
  duration: '45 min',
  focus: 'Pecho, espalda, hombros',
  exercises: [
    { name: 'Press de banca', sets: 4, reps: '8-10', rest: '90s' },
    { name: 'Remo con barra', sets: 4, reps: '8-10', rest: '90s' },
    { name: 'Press militar', sets: 3, reps: '10-12', rest: '60s' },
    { name: 'Dominadas', sets: 3, reps: 'Max', rest: '90s' },
    { name: 'Face pulls', sets: 3, reps: '15', rest: '45s' },
  ],
}

const routines = [
  {
    id: '1',
    name: 'Fuerza Maxima - Piernas',
    duration: '60 min',
    exercises: 6,
    focus: 'strength',
  },
  {
    id: '2',
    name: 'Core y Estabilidad',
    duration: '30 min',
    exercises: 8,
    focus: 'functional',
  },
  {
    id: '3',
    name: 'Tren Superior - Hipertrofia',
    duration: '50 min',
    exercises: 7,
    focus: 'hypertrophy',
  },
]

const recentWorkouts = [
  {
    id: '1',
    name: 'Piernas - Fuerza',
    date: '2026-01-05',
    duration: '58 min',
    volume: 12500,
  },
  {
    id: '2',
    name: 'Core y Estabilidad',
    date: '2026-01-03',
    duration: '32 min',
    volume: 0,
  },
  {
    id: '3',
    name: 'Tren Superior',
    date: '2026-01-01',
    duration: '52 min',
    volume: 8200,
  },
]

export function Strength() {
  const [activeTab, setActiveTab] = useState('today')

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
        <Button variant="strength">
          <Dumbbell className="mr-2 h-4 w-4" />
          Sincronizar Hevy
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
          {/* Today's Routine */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Rutina de Hoy
                  </CardTitle>
                  <CardDescription>
                    {todaysRoutine.name} - {todaysRoutine.focus}
                  </CardDescription>
                </div>
                <Button variant="strength">
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{todaysRoutine.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {todaysRoutine.exercises.length} ejercicios
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {todaysRoutine.exercises.map((exercise, index) => (
                  <div
                    key={exercise.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-strength/10 text-sm font-medium text-strength">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} x {exercise.reps} • Descanso: {exercise.rest}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
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
                <div className="text-2xl font-bold">20,700 kg</div>
                <p className="text-xs text-muted-foreground">
                  esta semana
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Racha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 semanas</div>
                <p className="text-xs text-muted-foreground">
                  cumpliendo el plan
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="cursor-pointer hover:border-strength/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-strength/10">
                      <Dumbbell className="h-5 w-5 text-strength" />
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        routine.focus === 'strength'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : routine.focus === 'hypertrophy'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {routine.focus}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{routine.name}</CardTitle>
                  <CardDescription>
                    {routine.duration} • {routine.exercises} ejercicios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Ver rutina
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-strength/10">
                        <Dumbbell className="h-6 w-6 text-strength" />
                      </div>
                      <div>
                        <p className="font-medium">{workout.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(workout.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {workout.duration}
                        </div>
                        {workout.volume > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="h-3 w-3" />
                            {workout.volume.toLocaleString()} kg
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
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
