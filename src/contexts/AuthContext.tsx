import { createContext, ReactNode, use, useEffect, useState } from 'react'
import { academicService } from '@/services'
import { clearAccessToken, getAccessToken } from '@/services/api-client'
import { AuthUser } from '@/types/academic'

type AuthContextType = {
    user: AuthUser | null
    isReady: boolean
    sessionMessage: string | null
    clearSessionMessage: () => void
    login: (identity: string, password: string) => Promise<void>
    logout: () => void
}

const STORAGE_KEY = 'pwa-academic-auth-user'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [sessionMessage, setSessionMessage] = useState<string | null>(null)

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        const token = getAccessToken()

        if (!token) {
            if (stored) {
                window.localStorage.removeItem(STORAGE_KEY)
            }

            setIsReady(true)
            return
        }

        academicService.getCurrentUser()
            .then((currentUser) => {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
                setUser(currentUser)
            })
            .catch(() => {
                window.localStorage.removeItem(STORAGE_KEY)
                window.localStorage.removeItem('pwa-academic-active-student')
                clearAccessToken()
                setUser(null)
                setSessionMessage('Sesi berakhir. Silakan login kembali.')
            })
            .finally(() => {
                setIsReady(true)
            })
    }, [])

    async function login(identity: string, password: string) {
        const nextUser = await academicService.login(identity, password)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
        setSessionMessage(null)
        setUser(nextUser)
    }

    function logout() {
        academicService.logout().catch(() => {
            // Token cleanup tetap dilakukan di client meski request logout gagal.
        })
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem('pwa-academic-active-student')
        clearAccessToken()
        setUser(null)
    }

    return (
        <AuthContext value={{ user, isReady, sessionMessage, clearSessionMessage: () => setSessionMessage(null), login, logout }}>
            {children}
        </AuthContext>
    )
}

export function useAuth() {
    const context = use(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
