# Coach - Entrenador Integral

## Visión
Aplicación de coaching integral para deportistas con múltiples objetivos: rendimiento deportivo, composición corporal, fuerza, resistencia, o cualquier combinación de estos.

**Filosofía:** Los tres pilares (cardio/resistencia, fuerza, nutrición) trabajan de forma sinérgica y se adaptan según el objetivo principal del usuario. Ningún módulo es "secundario" - cada uno puede ser el foco según las metas individuales.

## Objetivos Soportados
- **Rendimiento en carrera**: 5K, 10K, 21K, 42K, ultra, trail
- **Fuerza e hipertrofia**: ganar músculo, aumentar fuerza máxima
- **Composición corporal**: perder grasa, recomposición, definición
- **Resistencia general**: mejorar capacidad aeróbica
- **Objetivos híbridos**: correr sin perder músculo, ganar fuerza sin perder cardio, etc.

## Datos del Usuario
La aplicación recibe y trackea:
- **Peso corporal** (kg) - seguimiento periódico
- **Grasa corporal** (%) - para calcular masa magra
- **Altura** (cm)
- **Edad**
- **Frecuencia cardíaca** (reposo y máxima)
- **Objetivos** (definidos por el usuario)
- **Preferencias** (días disponibles, equipamiento, restricciones)

## Módulos

### 1. Entrenador de Cardio/Resistencia
- Planes de entrenamiento para cualquier distancia
- Seguimiento de actividades via Strava
- Análisis de ritmos, zonas cardíacas, progresión
- Periodización y tapering pre-carrera
- Soporte para running, ciclismo, natación, etc.

### 2. Entrenador de Fuerza
- Rutinas de gimnasio adaptadas al objetivo
- Programas de hipertrofia, fuerza, o funcional
- Fuerza para deportistas (complemento a cardio)
- Prevención de lesiones
- Ajuste de volumen según fase y objetivo principal
- Sincronización con Hevy para tracking

### 3. Asistente Nutricional
- Logging de alimentos consumidos
- Cálculo de macros según objetivo y actividad
- **Proteína ajustada al objetivo** (1.6-2.2g/kg para preservar/ganar músculo)
- Propuestas de dietas para:
  - Días de entrenamiento intenso
  - Días de fuerza
  - Días de recuperación
  - Preparación para competencias
- Balance calórico según objetivo (déficit, mantenimiento, superávit)
- Hidratación y suplementación
- Base de datos via OpenNutrition

## Integraciones MCP
| Servicio | Uso |
|----------|-----|
| **Strava** | Actividades cardio, métricas, historial |
| **Hevy** | Entrenamientos de fuerza, progresión de pesos |
| **OpenNutrition** | Búsqueda de alimentos, valores nutricionales |

## Filosofía de Integración
```
┌─────────────────────────────────────────┐
│         OBJETIVO DEL USUARIO            │
│   (definido y ajustable en el tiempo)   │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌───────┐   ┌──────────┐   ┌──────────┐
│Cardio │   │  Fuerza  │   │Nutrición │
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
  running/              # Cardio, planes, análisis
  strength/             # Rutinas de gym
  nutrition/            # Logging, dietas, macros
  integrations/         # Clientes MCP (Strava, Hevy, OpenNutrition)
  types/                # Tipos compartidos
```

## Notas
- Credenciales en `.mcp.json` (no commitear)
- Proyecto en desarrollo inicial
