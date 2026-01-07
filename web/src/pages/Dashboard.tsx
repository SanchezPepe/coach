import { Activity, Dumbbell, Apple, TrendingUp, Target, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store'
import { formatDistance, formatPace, formatDateShort } from '@/lib/utils'

export function Dashboard() {
  const { athlete, todaysMacros, stravaActivities } = useStore()

  // Calculate macro targets (simplified - would come from nutrition module)
  const macroTargets = {
    calories: 2500,
    protein: 150,
    carbs: 300,
    fat: 80,
  }

  const recentActivities = stravaActivities.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {athlete?.name || 'Atleta'}
        </h1>
        <p className="text-muted-foreground">
          Aqui esta tu resumen de hoy
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calorias Hoy
            </CardTitle>
            <Apple className="h-4 w-4 text-nutrition" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysMacros.calories}
            </div>
            <p className="text-xs text-muted-foreground">
              de {macroTargets.calories} kcal
            </p>
            <Progress
              value={(todaysMacros.calories / macroTargets.calories) * 100}
              className="mt-2"
              indicatorClassName="bg-nutrition"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proteina
            </CardTitle>
            <Target className="h-4 w-4 text-strength" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysMacros.protein}g
            </div>
            <p className="text-xs text-muted-foreground">
              de {macroTargets.protein}g
            </p>
            <Progress
              value={(todaysMacros.protein / macroTargets.protein) * 100}
              className="mt-2"
              indicatorClassName="bg-strength"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Km Esta Semana
            </CardTitle>
            <Activity className="h-4 w-4 text-running" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistance(
                recentActivities
                  .filter((a) => a.type === 'Run')
                  .reduce((sum, a) => sum + a.distance, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peso Actual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {athlete?.weightKg || '--'} kg
            </div>
            <p className="text-xs text-muted-foreground">
              {athlete?.bodyFatPercentage
                ? `${athlete.bodyFatPercentage}% grasa corporal`
                : 'Sin datos de composicion'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Entrenamiento de Hoy
            </CardTitle>
            <CardDescription>
              Semana 4, Fase de Construccion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-running/10">
                  <Activity className="h-5 w-5 text-running" />
                </div>
                <div>
                  <p className="font-medium">Carrera Facil</p>
                  <p className="text-sm text-muted-foreground">
                    8 km @ ritmo facil
                  </p>
                </div>
              </div>
              <Button variant="running" size="sm">
                Ver detalles
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-strength/10">
                  <Dumbbell className="h-5 w-5 text-strength" />
                </div>
                <div>
                  <p className="font-medium">Fuerza - Core</p>
                  <p className="text-sm text-muted-foreground">
                    30 min, ejercicios de estabilidad
                  </p>
                </div>
              </div>
              <Button variant="strength" size="sm">
                Iniciar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividades Recientes
            </CardTitle>
            <CardDescription>
              Sincronizado desde Strava
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay actividades recientes
                </p>
                <Button variant="outline" className="mt-4">
                  Conectar Strava
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-running/10">
                        <Activity className="h-4 w-4 text-running" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(new Date(activity.start_date_local))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDistance(activity.distance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPace(activity.moving_time / (activity.distance / 1000))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Nutricion de Hoy
          </CardTitle>
          <CardDescription>
            Progreso hacia tus metas de macros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { name: 'Calorias', current: todaysMacros.calories, target: macroTargets.calories, unit: 'kcal', color: 'bg-blue-500' },
              { name: 'Proteina', current: todaysMacros.protein, target: macroTargets.protein, unit: 'g', color: 'bg-red-500' },
              { name: 'Carbohidratos', current: todaysMacros.carbs, target: macroTargets.carbs, unit: 'g', color: 'bg-yellow-500' },
              { name: 'Grasa', current: todaysMacros.fat, target: macroTargets.fat, unit: 'g', color: 'bg-green-500' },
            ].map((macro) => (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{macro.name}</span>
                  <span className="text-muted-foreground">
                    {macro.current}/{macro.target} {macro.unit}
                  </span>
                </div>
                <Progress
                  value={Math.min((macro.current / macro.target) * 100, 100)}
                  indicatorClassName={macro.color}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
