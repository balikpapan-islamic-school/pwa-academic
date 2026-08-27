import { FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Heart, LogIn, ShieldCheck, Users } from 'lucide-react'
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

const features = [
    { icon: BookOpen, text: 'Pantau nilai & rapor putra-putri Anda' },
    { icon: Users, text: 'Informasi absensi real-time' },
    { icon: ShieldCheck, text: 'Jadwal pelajaran lengkap' },
    { icon: Heart, text: 'Komunikasi dengan pihak sekolah' },
]

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
        <main className="flex min-h-screen">
            <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-12 lg:flex">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:64px_64px]" />
                <div className="relative">
                    <AppLogo />
                </div>
                <div className="relative space-y-8">
                    <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                        <GraduationCap className="size-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Portal Akademik
                        </h1>
                        <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                            Akses informasi akademik putra-putri Anda dengan mudah. Pantau perkembangan belajar, jadwal, absensi, dan nilai rapor secara real-time.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {features.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/50">
                                    <Icon className="size-4 text-primary" />
                                </div>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Yayasan Pendidikan. Semua hak dilindungi.
                </div>
            </div>

            <div className="relative flex w-full items-center justify-center overflow-hidden px-4 lg:w-1/2">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-primary/[0.03]" />

            <div className="relative w-full max-w-sm">
                <Card className="w-full border-none bg-background/90 shadow-sm backdrop-blur-sm">
                    <CardHeader className="space-y-3 text-center lg:hidden">
                        <div className="mx-auto">
                                <AppLogo />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="space-y-1 text-center lg:text-left">
                            <h2 className="text-xl font-semibold tracking-tight">Selamat Datang</h2>
                            <CardDescription>Masuk untuk melanjutkan ke portal akademik</CardDescription>
                        </div>

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
                                    placeholder="Masukkan username"
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
                            <Button className="w-full" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    'Memproses...'
                                ) : (
                                    <>
                                        Masuk
                                        <LogIn className="ml-2 size-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-xs text-muted-foreground lg:text-left">
                            Dengan masuk, Anda menyetujui syarat & ketentuan yang berlaku.
                        </p>
                    </CardContent>
                </Card>
                </div>
            </div>
        </main>
    )
}