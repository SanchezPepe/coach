import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Dumbbell,
  Apple,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useStore } from '@/store'

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

export function Sidebar() {
  const athlete = useStore((state) => state.athlete)

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Coach</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
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
            </li>

            <Separator />

            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
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
            </li>

            {/* User info at bottom */}
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{athlete?.name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {athlete?.weightKg ? `${athlete.weightKg} kg` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
