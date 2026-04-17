import { createContext, ReactNode, use, useEffect, useState } from 'react'
import { loginWithMock } from '@/services/mock-api'
import { AuthUser } from '@/types/academic'

type AuthContextType = {
    user: AuthUser | null
    isReady: boolean
    login: (identity: string, password: string) => Promise<void>
    logout: () => void
}

const STORAGE_KEY = 'pwa-academic-auth-user'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY)

        if (stored) {
            setUser(JSON.parse(stored) as AuthUser)
        }

        setIsReady(true)
    }, [])

    async function login(identity: string, password: string) {
        const nextUser = await loginWithMock(identity, password)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
    }

    function logout() {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem('pwa-academic-active-student')
        setUser(null)
    }

    return (
        <AuthContext value={{ user, isReady, login, logout }}>
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
