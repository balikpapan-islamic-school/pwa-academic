import { Outlet } from 'react-router'
import { AppHeader } from './app-header'
import { AppBottomNav } from './app-bottom-nav'

export function AppLayout() {
    return (
        <div className="min-h-screen bg-muted/30">
            <AppHeader />
            <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl flex-1 flex-col px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
                <Outlet />
            </main>
            <AppBottomNav />
        </div>
    )
}
