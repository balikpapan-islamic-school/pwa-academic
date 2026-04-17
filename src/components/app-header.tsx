import { Link, NavLink } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, UserRound } from 'lucide-react'
import { AppLogo } from './app-logo'
import { Button, buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'
import { useStudent } from '@/contexts/StudentContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useAuth } from '@/contexts/AuthContext'

export function AppHeader() {
    const { activeStudent } = useStudent()
    const { unreadCount } = useNotifications()
    const { logout } = useAuth()

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to="/" className="shrink-0">
                        <AppLogo />
                    </Link>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium">Portal Akademik</p>
                        <p className="text-xs text-muted-foreground">Informasi belajar siswa dan wali siswa</p>
                    </div>
                </div>

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
                    <Button variant="ghost" size="icon" className="hidden size-9 rounded-full md:inline-flex" onClick={logout}>
                        <LogOut className="size-4" />
                        <span className="sr-only">Keluar</span>
                    </Button>
                </nav>
            </div>

            <div className="border-t bg-muted/40">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Siswa Aktif</p>
                        <p className="truncate text-sm font-semibold">
                            {activeStudent ? `${activeStudent.name} - ${activeStudent.unit} ${activeStudent.className}` : 'Memuat data siswa...'}
                        </p>
                    </div>
                    <Button asChild variant="secondary" size="sm" className="shrink-0 md:hidden">
                        <Link to="/pilih-anak">Ganti</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
