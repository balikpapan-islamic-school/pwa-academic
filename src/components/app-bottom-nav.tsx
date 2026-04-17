import { NavLink } from 'react-router-dom'
import { mainMenu } from '@/config/menu'
import { cn } from '@/lib/utils'

export function AppBottomNav() {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
                {mainMenu.map((item) => (
                    <NavLink
                        key={item.url}
                        to={item.url}
                        className={({ isActive }) => cn(
                            'flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                            isActive ? 'bg-muted text-foreground' : 'text-muted-foreground'
                        )}>
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
