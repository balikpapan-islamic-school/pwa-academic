import { createContext, ReactNode, use, useCallback, useEffect, useState } from 'react'
import { academicService } from '@/services'
import { UpdatePasswordInput } from '@/services/academic-service'
import { clearAccessToken, getAccessToken, setUnauthorizedHandler } from '@/services/api-client'
import { AuthUser } from '@/types/academic'

type AuthContextType = {
    user: AuthUser | null
    isReady: boolean
    sessionMessage: string | null
    clearSessionMessage: () => void
    login: (email: string, password: string) => Promise<AuthUser>
    loginWithGoogle: (idToken: string) => Promise<AuthUser>
    updateName: (name: string) => Promise<AuthUser>
    updatePassword: (input: UpdatePasswordInput) => Promise<void>
    refreshUser: () => Promise<void>
    logout: () => void
}

const STORAGE_KEY = 'pwa-academic-auth-user'
const ACTIVE_STUDENT_KEY = 'pwa-academic-active-student'

const AuthContext = createContext<AuthContextType | null>(null)

function clearLocalSession() {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(ACTIVE_STUDENT_KEY)
    clearAccessToken()
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [sessionMessage, setSessionMessage] = useState<string | null>(null)

    const storeUser = useCallback((nextUser: AuthUser) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
    }, [])

    useEffect(() => {
        // 401 / 403 "Akun bukan wali siswa." dari endpoint mana pun mengakhiri sesi.
        setUnauthorizedHandler((error) => {
            clearLocalSession()
            setUser(null)
            setSessionMessage(error.status === 403 ? error.message : 'Sesi berakhir. Silakan login kembali.')
        })

        return () => setUnauthorizedHandler(null)
    }, [])

    useEffect(() => {
        if (!getAccessToken()) {
            window.localStorage.removeItem(STORAGE_KEY)
            setIsReady(true)
            return
        }

        academicService.getCurrentUser()
            .then(storeUser)
            .catch(() => {
                clearLocalSession()
                setUser(null)
                setSessionMessage('Sesi berakhir. Silakan login kembali.')
            })
            .finally(() => {
                setIsReady(true)
            })
    }, [storeUser])

    async function login(email: string, password: string) {
        const nextUser = await academicService.login(email, password)
        setSessionMessage(null)
        storeUser(nextUser)
        return nextUser
    }

    async function loginWithGoogle(idToken: string) {
        const nextUser = await academicService.loginWithGoogle(idToken)
        setSessionMessage(null)
        storeUser(nextUser)
        return nextUser
    }

    async function updateName(name: string) {
        const nextUser = await academicService.updateProfile({ name })
        storeUser(nextUser)
        return nextUser
    }

    async function updatePassword(input: UpdatePasswordInput) {
        await academicService.updatePassword(input)

        if (user && !user.hasPassword) {
            storeUser({ ...user, hasPassword: true })
        }
    }

    // Memuat ulang /auth/me, mis. setelah pengajuan anak disetujui admin agar Beranda lengkap terbuka.
    const refreshUser = useCallback(async () => {
        storeUser(await academicService.getCurrentUser())
    }, [storeUser])

    function logout() {
        academicService.logout().catch(() => {
            // Token cleanup tetap dilakukan di client meski request logout gagal.
        })
        clearLocalSession()
        setUser(null)
    }

    const clearSessionMessage = useCallback(() => setSessionMessage(null), [])

    return (
        <AuthContext value={{ user, isReady, sessionMessage, clearSessionMessage, login, loginWithGoogle, updateName, updatePassword, refreshUser, logout }}>
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
