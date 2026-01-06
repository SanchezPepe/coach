# Coach - Running Coach Integral

## Visión
Aplicación de coaching integral para corredores de medio maratón (21K) y maratón (42K).

**Objetivo dual:** Mejorar rendimiento en carrera **sin perder masa muscular**, y ganar músculo gradualmente. El running es el eje central, pero la fuerza y nutrición están optimizadas para preservar/construir músculo mientras se mejora la capacidad aeróbica.

## Datos del Usuario
La aplicación recibe y trackea:
- **Peso corporal** (kg) - seguimiento periódico
- **Grasa corporal** (%) - para calcular masa magra
- **Altura** (cm)
- **Edad**
- **Frecuencia cardíaca** (reposo y máxima)
- **Objetivos** (carrera meta, tiempo objetivo)

## Módulos

### 1. Entrenador de Running (Core)
- Planes de entrenamiento para 21K y 42K
- Seguimiento de actividades via Strava
- Análisis de ritmos, zonas cardíacas, progresión
- Periodización y tapering pre-carrera

### 2. Entrenador de Fuerza (Complementario)
- Rutinas de gimnasio **en función del plan de running**
- **Objetivo: preservar masa muscular y ganar fuerza gradualmente**
- Fuerza funcional para corredores (core, glúteos, estabilidad)
- Hipertrofia controlada (sin interferir con running)
- Prevención de lesiones
- Ajuste de volumen según fase de entrenamiento (base, build, peak, taper)
- Sincronización con Hevy para tracking

### 3. Asistente Nutricional (Complementario)
- Logging de alimentos consumidos
- Cálculo de macros según fase de entrenamiento
- **Proteína suficiente para preservar/ganar músculo** (1.6-2.2g/kg)
- Propuestas de dietas para:
  - Días de entrenamiento largo (más carbohidratos)
  - Días de fuerza (más proteína)
  - Días de recuperación
  - Semana de carrera (carb loading)
- Balance calórico según objetivo (mantener peso, recomp, mini-cut)
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
