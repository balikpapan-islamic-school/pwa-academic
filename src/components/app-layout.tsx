import { Outlet } from 'react-router'
import { AppBottomNav } from './app-bottom-nav'

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-[22px] px-5 pb-32 pt-[52px]">
                <Outlet />
            </main>
            <AppBottomNav />
        </div>
    )
}
