import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
    const { user, isReady } = useAuth()
    const location = useLocation()

    if (!isReady) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-background p-6 shadow-sm">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-20 rounded-xl" />
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}
