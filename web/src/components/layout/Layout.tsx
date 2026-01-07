import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { MobileSidebar } from './MobileSidebar'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="py-6 pb-20 lg:pb-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
