import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/store'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useStore()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1" />

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Cambiar tema</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
                <span className="sr-only">Ver notificaciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Entrenamiento de hoy</p>
                  <p className="text-sm text-muted-foreground">
                    Tienes una carrera de 10km programada
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Meta de proteina</p>
                  <p className="text-sm text-muted-foreground">
                    Te faltan 45g para llegar a tu meta
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Nueva actividad sincronizada</p>
                  <p className="text-sm text-muted-foreground">
                    Tu carrera de ayer se sincronizo desde Strava
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
