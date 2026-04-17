import { Link, NavLink } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, UserRound } from 'lucide-react'
import { mainMenu } from '@/config/menu'
import { AppLogo } from './app-logo'
import { ModeToggle } from './mode-toggle'
import { Button, buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useAuth } from '@/contexts/AuthContext'

export function AppHeader() {
    const { unreadCount } = useNotifications()
    const { logout } = useAuth()

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to="/" className="shrink-0">
                        <AppLogo />
                    </Link>
                </div>

                <nav className="hidden flex-1 items-center gap-1 md:flex">
                    {mainMenu.map((item) => (
                        <NavLink
                            key={item.url}
                            to={item.url}
                            className={({ isActive }) => cn(
                                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}>
                            {item.icon ? <item.icon className="size-4" /> : null}
                            <span>{item.title}</span>
                        </NavLink>
                    ))}
                </nav>

                <nav className="flex items-center gap-2">
                    <NavLink
                        to="/pilih-anak"
                        className={({ isActive }) => cn(
                            buttonVariants({ variant: 'ghost', size: 'sm' }),
                            'hidden md:inline-flex',
                            isActive && 'bg-accent'
                        )}>
                        Ganti Anak
                        <ChevronRight className="size-4" />
                    </NavLink>
                    <div className="shrink-0">
                        <ModeToggle />
                    </div>
                    <NavLink
                        to="/notifikasi"
                        className={({ isActive }) => cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'relative size-9 rounded-full',
                            isActive && 'bg-accent'
                        )}>
                        <Bell className="size-4" />
                        {unreadCount > 0 ? (
                            <span className="absolute right-1.5 top-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                {Math.min(unreadCount, 9)}
                            </span>
                        ) : null}
                        <span className="sr-only">Notifikasi</span>
                    </NavLink>
                    <NavLink
                        to="/profil"
                        className={({ isActive }) => cn(
                            buttonVariants({ variant: 'outline', size: 'icon' }),
                            'size-9 rounded-full',
                            isActive && 'bg-accent'
                        )}>
                        <UserRound className="size-4" />
                        <span className="sr-only">Profil</span>
                    </NavLink>
                    <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={logout}>
                        <LogOut className="size-4" />
                        <span className="sr-only">Keluar</span>
                    </Button>
                </nav>
            </div>
        </header>
    )
}
