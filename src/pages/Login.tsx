import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { BisLogo } from '@/components/bis-logo'
import { FieldShell } from '@/components/kit/field-shell'
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

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" aria-hidden="true" className="size-6">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
    )
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
    const [showPassword, setShowPassword] = useState(false)

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
                    // Backend memakai key `username` selama transisi, lalu `email` setelah login email aktif.
                    username: caughtError.errors?.email ?? caughtError.errors?.username,
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
                    <FieldShell invalid={Boolean(fieldErrors.username?.length)}>
                        <Mail className="size-5 shrink-0" />
                        <input
                            id="identity"
                            value={identity}
                            onChange={(event) => setIdentity(event.target.value)}
                            placeholder="nama@email.com"
                            inputMode="email"
                            autoComplete="email"
                            aria-invalid={Boolean(fieldErrors.username?.length)}
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                    </FieldShell>
                    {fieldErrors.username?.map((item) => (
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
                    disabled={isSubmitting}
                    className="mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)] disabled:opacity-60">
                    {isSubmitting ? 'Memproses...' : (
                        <>
                            Masuk
                            <ArrowRight className="size-5" strokeWidth={2.4} />
                        </>
                    )}
                </button>
            </form>

            <div className="mx-8 mb-4 mt-6 flex items-center gap-3 text-[13px] font-bold text-[#5F6E64]">
                <span className="h-px flex-grow bg-[#CFDCD1]" />
                atau
                <span className="h-px flex-grow bg-[#CFDCD1]" />
            </div>

            {/* TODO: sambungkan ke alur OAuth Google setelah endpoint backend tersedia. */}
            <button
                type="button"
                onClick={() => toast.info('Masuk dengan Google segera tersedia', { description: 'Untuk sementara gunakan email dan kata sandi.' })}
                className="mx-5 flex h-14 items-center justify-center gap-3 rounded-full border-2 border-border bg-card text-base font-extrabold text-ink transition-colors hover:bg-[#F7FAF7] active:scale-[0.98]">
                <GoogleIcon />
                Lanjutkan dengan Google
            </button>

            <p className="mb-8 mt-auto px-8 pt-8 text-center text-sm leading-normal text-subtle">
                Belum punya akun? <span className="font-extrabold text-primary">Hubungi admin sekolah</span>
            </p>
        </main>
    )
}
