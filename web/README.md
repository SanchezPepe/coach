# Coach - Frontend Web

Frontend moderno para la aplicación Coach, construido con React, Vite, y Firebase.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | React 18 + Vite + TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| Estado | Zustand (persistente) |
| Auth | Firebase Auth |
| Base de datos | Firestore |
| Backend/APIs | Firebase Functions |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |
| PWA | vite-plugin-pwa |

## Estructura del Proyecto

```
web/src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   └── layout/          # Layout principal
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── MobileNav.tsx
│       └── MobileSidebar.tsx
├── pages/               # Páginas de la aplicación
│   ├── Dashboard.tsx    # Vista principal con resumen
│   ├── Running.tsx      # Actividades y plan de entrenamiento
│   ├── Strength.tsx     # Rutinas de fuerza
│   ├── Nutrition.tsx    # Macros y registro de alimentos
│   ├── Profile.tsx      # Perfil del atleta
│   └── Auth.tsx         # Login/Registro
├── hooks/               # Custom hooks
│   └── useAuth.ts       # Autenticación Firebase
├── services/            # Servicios externos
│   └── firebase.ts      # Configuración Firebase
├── store/               # Estado global
│   └── index.ts         # Zustand store
├── lib/                 # Utilidades
│   └── utils.ts         # cn(), formatters
├── App.tsx              # Router y layout
├── main.tsx             # Entry point
└── index.css            # Tailwind + tema
```

## Características

- **Tema oscuro/claro** - Toggle en el header
- **Responsive** - Desktop con sidebar, mobile con bottom nav
- **PWA** - Instalable en dispositivos móviles
- **Autenticación** - Email/password y Google
- **Offline-first** - Store persistente con Zustand

## Desarrollo Local

### 1. Instalar dependencias

```bash
cd web
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 4. Build de producción

```bash
npm run build
```

Los archivos se generan en `web/dist/`

## Firebase Functions

Las Cloud Functions están en `/functions` y proporcionan:

- **getStravaActivities** - Obtener actividades de Strava
- **getHevyWorkouts** - Obtener entrenamientos de Hevy
- **searchFoods** - Buscar alimentos en OpenNutrition
- **saveAthleteProfile** - Guardar perfil del atleta
- **logBodyComposition** - Registrar peso y composición corporal

### Instalar y desplegar functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## CI/CD con GitHub Actions

El workflow `.github/workflows/deploy.yml` ejecuta:

1. **En cada push/PR a main:**
   - Lint y type-check
   - Build del frontend
   - Build de functions

2. **Solo en push a main:**
   - Deploy a Firebase Hosting
   - Deploy de Cloud Functions

3. **En PRs:**
   - Preview URL automática

### Configurar secrets en GitHub

Agrega estos secrets en tu repositorio (Settings > Secrets):

| Secret | Descripción |
|--------|-------------|
| `VITE_FIREBASE_API_KEY` | API Key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `FIREBASE_TOKEN` | Token de `firebase login:ci` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON de service account |

## Configuración de Firebase

### 1. Crear proyecto

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Habilita Authentication (Email/Password + Google)
4. Crea una base de datos Firestore

### 2. Obtener credenciales

1. Ve a Project Settings > General
2. Agrega una app web
3. Copia las credenciales al `.env.local`

### 3. Desplegar

```bash
# Login en Firebase
firebase login

# Inicializar proyecto (selecciona Hosting + Functions + Firestore)
firebase init

# Desplegar todo
firebase deploy
```

## Páginas

### Dashboard (`/`)
- Resumen de calorías y macros del día
- Entrenamiento programado
- Actividades recientes de Strava
- Progreso hacia objetivos

### Running (`/running`)
- Lista de actividades sincronizadas
- Plan de entrenamiento con fases
- Zonas de ritmo personalizadas
- Estadísticas de volumen y carga

### Strength (`/strength`)
- Rutina del día
- Biblioteca de rutinas
- Historial de entrenamientos (Hevy)
- Progreso de pesos

### Nutrition (`/nutrition`)
- Macros del día con barras de progreso
- Registro de alimentos
- Búsqueda en OpenNutrition
- Sugerencias de comidas

### Profile (`/profile`)
- Datos físicos (peso, altura, FC)
- Zonas de frecuencia cardíaca
- Objetivos (primario y secundario)
- Conexiones con Strava y Hevy
