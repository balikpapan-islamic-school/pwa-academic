import { BrowserRouter, HashRouter } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import { StudentProvider } from './contexts/StudentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <StudentProvider>
                    <NotificationsProvider>
                        <AppRouter>
                            <Router />
                        </AppRouter>
                    </NotificationsProvider>
                </StudentProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}
