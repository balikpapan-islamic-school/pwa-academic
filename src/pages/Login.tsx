import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { BisLogo } from '@/components/bis-logo'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { FieldShell } from '@/components/kit/field-shell'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/services/api-client'

type LoginFieldErrors = {
    email?: string[]
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

const isGoogleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, loginWithGoogle, sessionMessage, clearSessionMessage } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        return () => {
            clearSessionMessage()
        }
    }, [clearSessionMessage])

    const redirectAfterLogin = useCallback(() => {
        // Akun tanpa anak terhubung tetap ke Beranda; Beranda menampilkan versi "belum terhubung".
        const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/'
        navigate(redirectTo, { replace: true })
    }, [location.state, navigate])

    const handleGoogleCredential = useCallback(async (idToken: string) => {
        setIsGoogleSubmitting(true)
        setError(null)
        setFieldErrors({})

        try {
            const user = await loginWithGoogle(idToken)
            if (!user.hasPassword && user.linkedStudentsCount === 0) {
                toast.success('Akun berhasil dibuat', { description: 'Hubungkan peserta didik untuk mulai memantau.' })
            }
            redirectAfterLogin()
        } catch (caughtError) {
            const message = caughtError instanceof ApiError
                ? caughtError.errors?.id_token?.[0] ?? caughtError.message
                : caughtError instanceof Error ? getReadableLoginError(caughtError.message) : 'Login Google gagal diproses.'
            toast.error(message)
        } finally {
            setIsGoogleSubmitting(false)
        }
    }, [loginWithGoogle, redirectAfterLogin])

    const handleGoogleLoadError = useCallback((loadError: Error) => {
        toast.error(loadError.message, { description: 'Periksa koneksi internet, lalu muat ulang halaman.' })
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setFieldErrors({})

        try {
            await login(email.trim(), password)
            redirectAfterLogin()
        } catch (caughtError) {
            if (caughtError instanceof ApiError) {
                const nextFieldErrors = {
                    email: caughtError.errors?.email,
                    password: caughtError.errors?.password,
                }
                const hasFieldErrors = Boolean(nextFieldErrors.email?.length || nextFieldErrors.password?.length)
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
        <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background text-ink">
            <div className="relative overflow-hidden rounded-b-[36px] bg-primary px-6 pb-16 pt-[52px] text-white">
                <div aria-hidden="true" className="absolute -right-10 -top-[30px] size-[170px] rounded-full bg-brand-mid" />
                <div aria-hidden="true" className="absolute -bottom-[50px] right-[70px] size-[110px] rounded-full bg-brand-dark" />
                <div className="relative flex items-center justify-between">
                    <Link to="/onboarding" aria-label="Kembali" className="flex size-11 items-center justify-center rounded-full bg-white/[0.18]">
                        <ArrowLeft className="size-[22px]" strokeWidth={2.2} />
                    </Link>
                    <BisLogo variant="on-primary" className="h-11" />
                </div>
                <h1 className="relative mt-[22px] font-display text-[32px] font-bold leading-[1.1]">Selamat datang<br />kembali!</h1>
                <p className="relative mt-2 text-[15px] text-brand-soft">Masuk untuk melanjutkan ke akun sekolahmu.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative mx-5 -mt-9 flex flex-col gap-4 rounded-[28px] bg-card px-5 py-[22px] shadow-float">
                {sessionMessage ? (
                    <p role="status" className="rounded-2xl bg-pastel-sky px-4 py-3 text-sm font-bold text-pastel-sky-fg">{sessionMessage}</p>
                ) : null}

                {error ? (
                    <p role="alert" className="rounded-2xl bg-pastel-coral px-4 py-3 text-sm font-bold text-pastel-coral-fg">{error}</p>
                ) : null}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="identity" className="text-sm font-extrabold">Email</label>
                    <FieldShell invalid={Boolean(fieldErrors.email?.length)}>
                        <Mail className="size-5 shrink-0" />
                        <input
                            id="identity"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="nama@email.com"
                            inputMode="email"
                            autoComplete="email"
                            aria-invalid={Boolean(fieldErrors.email?.length)}
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                    </FieldShell>
                    {fieldErrors.email?.map((item) => (
                        <p key={item} className="text-sm font-semibold text-destructive">{item}</p>
                    ))}
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-sm font-extrabold">Kata Sandi</label>
                    <FieldShell invalid={Boolean(fieldErrors.password?.length)}>
                        <LockKeyhole className="size-5 shrink-0" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            aria-invalid={Boolean(fieldErrors.password?.length)}
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                        <button
                            type="button"
                            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            onClick={() => setShowPassword((value) => !value)}
                            className="flex size-11 items-center justify-center text-[#5F6E64]">
                            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                    </FieldShell>
                    {fieldErrors.password?.map((item) => (
                        <p key={item} className="text-sm font-semibold text-destructive">{item}</p>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)] disabled:opacity-60">
                    {isSubmitting ? 'Memproses...' : (
                        <>
                            Masuk
                            <ArrowRight className="size-5" strokeWidth={2.4} />
                        </>
                    )}
                </button>
            </form>

            {isGoogleEnabled ? (
                <>
                    <div className="mx-8 mb-4 mt-6 flex items-center gap-3 text-[13px] font-bold text-[#5F6E64]">
                        <span className="h-px flex-grow bg-[#CFDCD1]" />
                        atau
                        <span className="h-px flex-grow bg-[#CFDCD1]" />
                    </div>

                    <div className="mx-5 flex flex-col items-center gap-2" aria-busy={isGoogleSubmitting}>
                        <GoogleSignInButton onCredential={handleGoogleCredential} onLoadError={handleGoogleLoadError} />
                        {isGoogleSubmitting ? <p role="status" className="text-sm font-bold text-subtle">Memproses login Google...</p> : null}
                    </div>
                </>
            ) : null}

            <p className="mb-8 mt-auto px-8 pt-8 text-center text-sm leading-normal text-subtle">
                Belum punya akun? <span className="font-extrabold text-primary">Hubungi admin sekolah</span>
            </p>
        </main>
    )
}
