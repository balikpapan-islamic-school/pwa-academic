import { BrowserRouter, HashRouter } from 'react-router'
import { PwaUpdatePrompt } from './components/pwa-update-prompt'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import { RefreshProvider } from './contexts/RefreshContext'
import { StudentProvider } from './contexts/StudentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <RefreshProvider>
                <AuthProvider>
                    <StudentProvider>
                        <NotificationsProvider>
                            <AppRouter>
                                <Router />
                                <Toaster />
                                <PwaUpdatePrompt />
                            </AppRouter>
                        </NotificationsProvider>
                    </StudentProvider>
                </AuthProvider>
            </RefreshProvider>
        </ThemeProvider>
    )
}
