# Coach - Running Coach Integral

## Visión
Aplicación de coaching integral para corredores de medio maratón (21K) y maratón (42K). El running es el eje central; el entrenamiento de fuerza y la nutrición están diseñados para optimizar el rendimiento en carrera.

## Módulos

### 1. Entrenador de Running (Core)
- Planes de entrenamiento para 21K y 42K
- Seguimiento de actividades via Strava
- Análisis de ritmos, zonas cardíacas, progresión
- Periodización y tapering pre-carrera

### 2. Entrenador de Fuerza (Complementario)
- Rutinas de gimnasio **en función del plan de running**
- Fuerza funcional para corredores (core, glúteos, estabilidad)
- Prevención de lesiones
- Ajuste de volumen según fase de entrenamiento (base, build, peak, taper)
- Sincronización con Hevy para tracking

### 3. Asistente Nutricional (Complementario)
- Logging de alimentos consumidos
- Cálculo de macros según fase de entrenamiento
- Propuestas de dietas para:
  - Días de entrenamiento largo
  - Días de recuperación
  - Semana de carrera (carb loading)
- Hidratación y suplementación
- Base de datos via OpenNutrition

## Integraciones MCP
| Servicio | Uso |
|----------|-----|
| **Strava** | Actividades de running, métricas, historial |
| **Hevy** | Entrenamientos de fuerza, progresión de pesos |
| **OpenNutrition** | Búsqueda de alimentos, valores nutricionales |

## Filosofía de Integración
```
┌─────────────────────────────────────────┐
│           OBJETIVO DE CARRERA           │
│            (21K o 42K)                  │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌───────┐   ┌──────────┐   ┌──────────┐
│Running│   │  Fuerza  │   │Nutrición │
│(Strava)│   │  (Hevy)  │   │(OpenNut) │
└───────┘   └──────────┘   └──────────┘
    │             │             │
    └─────────────┴─────────────┘
                  │
         Sincronización y
         ajustes automáticos
```

## Stack Técnico
- Node.js + TypeScript
- MCP (Model Context Protocol)
- CLI interactivo (fase 1)
- Web UI (fase futura)

## Comandos
```bash
npm install          # Instalar dependencias
npm run build        # Compilar TypeScript
npm start            # Ejecutar aplicación
npm test             # Ejecutar tests
```

## Convenciones
- TypeScript estricto
- Async/await
- Métricas: km, kg, min/km para ritmos
- Código en inglés, UI en español

## Estructura
```
src/
  index.ts              # Entry point
  running/              # Planes, análisis de carrera
  strength/             # Rutinas de gym para corredores
  nutrition/            # Logging, dietas, macros
  integrations/         # Clientes MCP (Strava, Hevy, OpenNutrition)
  types/                # Tipos compartidos
```

## Notas
- Credenciales en `.mcp.json` (no commitear)
- Proyecto en desarrollo inicial
