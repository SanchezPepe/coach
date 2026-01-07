import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Dashboard, Running, Strength, Nutrition, Profile, Auth } from '@/pages'
import { useStore } from '@/store'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const theme = useStore((state) => state.theme)

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/running" element={<Running />} />
          <Route path="/strength" element={<Strength />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
