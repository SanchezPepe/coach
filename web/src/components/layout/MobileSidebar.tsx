import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { X, Activity, LayoutDashboard, Dumbbell, Apple, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Running', href: '/running', icon: Activity },
  { name: 'Fuerza', href: '/strength', icon: Dumbbell },
  { name: 'Nutricion', href: '/nutrition', icon: Apple },
]

const secondaryNavigation = [
  { name: 'Perfil', href: '/profile', icon: User },
  { name: 'Configuracion', href: '/settings', icon: Settings },
]

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-lg lg:hidden">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Coach</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="flex flex-col gap-y-5 px-6 py-4">
          <ul role="list" className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <Separator />

          <ul role="list" className="space-y-1">
            {secondaryNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Fragment>
  )
}
