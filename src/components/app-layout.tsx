import { Outlet } from 'react-router'
import { AppBottomNav } from './app-bottom-nav'
import { PullToRefresh } from './kit/pull-to-refresh'

export function AppLayout() {
    return (
        <div className="min-h-screen bg-background">
            <PullToRefresh>
                <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-[22px] px-5 pb-32 pt-[52px]">
                    <Outlet />
                </main>
            </PullToRefresh>
            <AppBottomNav />
        </div>
    )
}
