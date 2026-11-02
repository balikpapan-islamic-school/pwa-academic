import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { mainMenu } from '@/config/menu'
import { cn } from '@/lib/utils'

export function AppBottomNav() {
    const location = useLocation()
    const [searchParams] = useSearchParams()
    // Sementara mengikuti pratinjau Beranda tanpa peserta didik ("/?state=kosong").
    const hasStudent = !(location.pathname === '/' && searchParams.get('state') === 'kosong')

    return (
        <nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-40">
            <div className="mx-auto flex max-w-md justify-around rounded-t-[28px] bg-card px-2 pb-6 pt-2.5 shadow-[0_-6px_24px_rgba(0,0,0,0.08)]">
                {mainMenu.map((item) => {
                    const content = (isActive: boolean) => (
                        <>
                            <span className={cn('flex rounded-full px-3.5 py-1', isActive && 'bg-brand-soft')}>
                                {item.icon ? <item.icon className="size-[22px]" strokeWidth={isActive ? 2.2 : 2} /> : null}
                            </span>
                            {item.title}
                        </>
                    )

                    if (item.requiresStudent && !hasStudent) {
                        return (
                            <span key={item.url} aria-disabled="true" className="flex min-h-[52px] min-w-16 flex-col items-center justify-center gap-[3px] text-xs font-bold text-[#A3AFA6]">
                                {content(false)}
                            </span>
                        )
                    }

                    return (
                        <NavLink
                            key={item.url}
                            to={item.url}
                            end={item.url === '/'}
                            className={({ isActive }) => cn(
                                'flex min-h-[52px] min-w-16 flex-col items-center justify-center gap-[3px] text-xs',
                                isActive ? 'font-extrabold text-primary' : 'font-bold text-[#5F6E64]'
                            )}>
                            {({ isActive }) => content(isActive)}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
