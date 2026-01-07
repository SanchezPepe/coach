import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Activity, Dumbbell, Apple, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Running', href: '/running', icon: Activity },
  { name: 'Fuerza', href: '/strength', icon: Dumbbell },
  { name: 'Nutricion', href: '/nutrition', icon: Apple },
  { name: 'Perfil', href: '/profile', icon: User },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
