import { useState } from 'react'
import {
  Apple,
  Plus,
  Search,
  Trash2,
  Clock,
  Flame,
  ChevronRight,
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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/store'

// Sample meal suggestions (would come from nutrition module)
const mealSuggestions = [
  {
    name: 'Desayuno Alto en Proteina',
    calories: 450,
    protein: 35,
    carbs: 40,
    fat: 15,
    foods: ['Huevos revueltos', 'Tostada integral', 'Aguacate'],
  },
  {
    name: 'Almuerzo Post-Entrenamiento',
    calories: 650,
    protein: 45,
    carbs: 70,
    fat: 18,
    foods: ['Pollo a la plancha', 'Arroz integral', 'Verduras'],
  },
  {
    name: 'Cena Ligera',
    calories: 400,
    protein: 30,
    carbs: 25,
    fat: 20,
    foods: ['Salmon', 'Ensalada mixta', 'Aceite de oliva'],
  },
]

export function Nutrition() {
  const { todaysMacros, todaysFoodLog, removeFoodEntry } = useStore()
  const [activeTab, setActiveTab] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')

  // Macro targets (would come from nutrition module based on athlete profile)
  const macroTargets = {
    calories: 2500,
    protein: 150,
    carbs: 300,
    fat: 80,
  }

  const remaining = {
    calories: Math.max(0, macroTargets.calories - todaysMacros.calories),
    protein: Math.max(0, macroTargets.protein - todaysMacros.protein),
    carbs: Math.max(0, macroTargets.carbs - todaysMacros.carbs),
    fat: Math.max(0, macroTargets.fat - todaysMacros.fat),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nutricion</h1>
          <p className="text-muted-foreground">
            Macros, comidas y sugerencias
          </p>
        </div>
        <Button variant="nutrition">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Alimento
        </Button>
      </div>

      {/* Macro Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Hoy</CardTitle>
          <CardDescription>
            Progreso hacia tus metas de macronutrientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                name: 'Calorias',
                current: todaysMacros.calories,
                target: macroTargets.calories,
                remaining: remaining.calories,
                unit: 'kcal',
                color: 'bg-blue-500',
              },
              {
                name: 'Proteina',
                current: todaysMacros.protein,
                target: macroTargets.protein,
                remaining: remaining.protein,
                unit: 'g',
                color: 'bg-red-500',
              },
              {
                name: 'Carbohidratos',
                current: todaysMacros.carbs,
                target: macroTargets.carbs,
                remaining: remaining.carbs,
                unit: 'g',
                color: 'bg-yellow-500',
              },
              {
                name: 'Grasa',
                current: todaysMacros.fat,
                target: macroTargets.fat,
                remaining: remaining.fat,
                unit: 'g',
                color: 'bg-green-500',
              },
            ].map((macro) => (
              <div key={macro.name} className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{macro.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {macro.current}/{macro.target} {macro.unit}
                  </span>
                </div>
                <Progress
                  value={Math.min((macro.current / macro.target) * 100, 100)}
                  indicatorClassName={macro.color}
                />
                <p className="text-xs text-muted-foreground">
                  {macro.remaining > 0
                    ? `${macro.remaining} ${macro.unit} restantes`
                    : 'Meta alcanzada'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Registro de Hoy</TabsTrigger>
          <TabsTrigger value="search">Buscar Alimentos</TabsTrigger>
          <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Alimentos Registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysFoodLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Apple className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Sin alimentos registrados
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Agrega los alimentos que consumas para llevar un registro de tus macros
                  </p>
                  <Button variant="nutrition" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar primer alimento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysFoodLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nutrition/10">
                          <Apple className="h-5 w-5 text-nutrition" />
                        </div>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.quantity} {entry.unit} • {entry.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">{entry.calories} kcal</p>
                          <p className="text-muted-foreground">
                            P: {entry.protein}g • C: {entry.carbs}g • G: {entry.fat}g
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFoodEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Alimentos</CardTitle>
              <CardDescription>
                Busca en la base de datos de OpenNutrition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="nutrition">Buscar</Button>
              </div>

              {searchQuery && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Resultados para "{searchQuery}"
                  </p>
                  {/* Search results would go here */}
                  <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    Escribe para buscar alimentos en la base de datos
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sugerencias de Comidas</CardTitle>
              <CardDescription>
                Basadas en tus macros restantes y tipo de dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mealSuggestions.map((meal) => (
                  <Card key={meal.name} className="cursor-pointer hover:border-nutrition/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{meal.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {meal.calories} kcal
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex gap-2 text-xs">
                        <span className="rounded bg-red-100 px-2 py-1 dark:bg-red-900/30">
                          P: {meal.protein}g
                        </span>
                        <span className="rounded bg-yellow-100 px-2 py-1 dark:bg-yellow-900/30">
                          C: {meal.carbs}g
                        </span>
                        <span className="rounded bg-green-100 px-2 py-1 dark:bg-green-900/30">
                          G: {meal.fat}g
                        </span>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {meal.foods.map((food) => (
                          <li key={food}>• {food}</li>
                        ))}
                      </ul>
                      <Button variant="outline" className="mt-4 w-full" size="sm">
                        Agregar al registro
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pre/Post Workout Nutrition */}
          <Card>
            <CardHeader>
              <CardTitle>Nutricion Pre/Post Entrenamiento</CardTitle>
              <CardDescription>
                Recomendaciones para hoy (dia de carrera facil)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-nutrition" />
                    Pre-Entrenamiento (2-3h antes)
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Comida ligera rica en carbohidratos. Evita grasas y fibra en exceso.
                  </p>
                  <p className="mt-2 text-sm">
                    Ejemplo: Avena con platano, tostada con miel
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-nutrition" />
                    Post-Entrenamiento (30-60min)
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Proteina para recuperacion muscular + carbohidratos para reponer glucogeno.
                  </p>
                  <p className="mt-2 text-sm">
                    Ejemplo: Batido de proteina con fruta, yogur griego
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
