import { FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/services/api-client'

type LoginFieldErrors = {
    username?: string[]
    password?: string[]
}

function isGenericValidationMessage(message: string) {
    const normalized = message.toLowerCase()

    return normalized.includes('the given data was invalid') || normalized.includes('unprocessable entity') || normalized.includes('(and 1 more error)')
}

function getReadableLoginError(message: string) {
    if (message.toLowerCase() === 'failed to fetch') {
        return 'Login tidak dapat diproses karena aplikasi gagal terhubung ke API. Periksa CORS, redirect backend, atau koneksi ke server.'
    }

    return message
}

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, sessionMessage, clearSessionMessage } = useAuth()
    const [identity, setIdentity] = useState('arifin')
    const [password, setPassword] = useState('password')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})

    useEffect(() => {
        return () => {
            clearSessionMessage()
        }
    }, [clearSessionMessage])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setFieldErrors({})

        try {
            await login(identity, password)
            const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/'
            navigate(redirectTo)
        } catch (caughtError) {
            if (caughtError instanceof ApiError) {
                const nextFieldErrors = {
                    username: caughtError.errors?.username,
                    password: caughtError.errors?.password,
                }
                const hasFieldErrors = Boolean(nextFieldErrors.username?.length || nextFieldErrors.password?.length)

                setError(getReadableLoginError(caughtError.message))
                setFieldErrors(nextFieldErrors)

                if (hasFieldErrors && isGenericValidationMessage(caughtError.message)) {
                    setError(null)
                }

                return
            }

            if (caughtError instanceof Error) {
                setError(getReadableLoginError(caughtError.message))
                return
            }

            setError('Login gagal diproses.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto">
                        <AppLogo />
                    </div>
                    <div className="space-y-1">
                        <CardDescription>Halaman login awal untuk siswa dan wali siswa.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sessionMessage ? (
                        <Alert>
                            <AlertTitle>Sesi Login</AlertTitle>
                            <AlertDescription>{sessionMessage}</AlertDescription>
                        </Alert>
                    ) : null}

                    {error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Login Gagal</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Username</label>
                            <Input
                                id="email"
                                value={identity}
                                onChange={(event) => setIdentity(event.target.value)}
                                placeholder="username"
                                aria-invalid={Boolean(fieldErrors.username?.length)}
                            />
                            {fieldErrors.username?.map((item) => (
                                <p key={item} className="text-sm text-destructive">{item}</p>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Kata sandi</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                aria-invalid={Boolean(fieldErrors.password?.length)}
                            />
                            {fieldErrors.password?.map((item) => (
                                <p key={item} className="text-sm text-destructive">{item}</p>
                            ))}
                        </div>
                        <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Masuk'}</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}
