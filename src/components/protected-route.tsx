import { AppSplash } from '@/components/shared/app-splash'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
    const { user, isReady } = useAuth()
    const location = useLocation()

    if (!isReady) {
        return <AppSplash />
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}
