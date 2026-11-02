import { FormEvent, useState } from 'react'
import { Check, Circle, CircleCheck, Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FieldShell } from '@/components/kit/field-shell'
import { FocusPage, focusCardClassName, FormField, SubmitButton } from '@/components/kit/focus-page'
import { useGoBack } from '@/hooks/use-go-back'
import { fakeRequest, getDummyAccount, saveDummyAccount } from '@/lib/dummy-ui'
import { cn } from '@/lib/utils'

const PASSWORD_MIN = 8

type PasswordInputProps = {
    id: string
    value: string
    onChange: (value: string) => void
    autoComplete: 'current-password' | 'new-password'
    invalid: boolean
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <FieldShell invalid={invalid}>
            <LockKeyhole className="size-5 shrink-0" />
            <input
                id={id}
                type={isVisible ? 'text' : 'password'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete={autoComplete}
                aria-invalid={invalid}
                aria-describedby={`${id}-desc`}
                className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
            />
            <button
                type="button"
                onClick={() => setIsVisible((current) => !current)}
                aria-label={isVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-subtle">
                {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
        </FieldShell>
    )
}

function Requirement({ met, children }: { met: boolean, children: string }) {
    const Icon = met ? CircleCheck : Circle

    return (
        <li className={cn('flex items-center gap-2 text-[13px] font-bold', met ? 'text-primary' : 'text-subtle')}>
            <Icon className="size-4 shrink-0" />
            {children}
        </li>
    )
}

type Errors = { current?: string, password?: string, confirmation?: string }

export default function KataSandi() {
    const goBack = useGoBack('/profil')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [account] = useState(getDummyAccount)
    // `?mode=buat` untuk melihat tampilan akun Google yang belum punya kata sandi.
    const isCreating = searchParams.get('mode') === 'buat' || !account.hasPassword
    const title = isCreating ? 'Buat Kata Sandi' : 'Ubah Kata Sandi'

    const [current, setCurrent] = useState('')
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [isSaving, setIsSaving] = useState(false)

    const isLongEnough = password.length >= PASSWORD_MIN
    const isMatching = password.length > 0 && password === confirmation

    function clearError(key: keyof Errors) {
        setErrors((current) => ({ ...current, [key]: undefined }))
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const nextErrors: Errors = {}

        if (!isCreating && !current) {
            nextErrors.current = 'Masukkan kata sandi saat ini.'
        }
        if (!isLongEnough) {
            nextErrors.password = `Kata sandi minimal ${PASSWORD_MIN} karakter.`
        } else if (!isCreating && password === current) {
            nextErrors.password = 'Kata sandi baru harus berbeda dari yang lama.'
        }
        if (!isMatching) {
            nextErrors.confirmation = 'Konfirmasi kata sandi belum sama.'
        }

        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) {
            return
        }

        setIsSaving(true)
        await fakeRequest()
        saveDummyAccount({ hasPassword: true })
        toast.success('Kata sandi tersimpan', {
            description: isCreating ? `Sekarang bisa masuk dengan Google atau ${account.email}.` : 'Gunakan kata sandi baru saat masuk berikutnya.',
        })
        navigate('/profil', { replace: true })
    }

    return (
        <FocusPage title={title} subtitle="Keamanan akun Anda." onBack={goBack} isDirty={Boolean(current || password || confirmation)}>
            <form onSubmit={handleSubmit} noValidate className={focusCardClassName}>
                {isCreating ? (
                    <div className="flex gap-3 rounded-2xl bg-pastel-mint p-3.5 text-pastel-mint-fg">
                        <KeyRound className="mt-0.5 size-5 shrink-0" />
                        <p className="text-sm font-bold leading-snug">
                            Akun Anda masuk lewat Google. Buat kata sandi agar tetap bisa masuk dengan email {account.email} bila Google tidak bisa dipakai.
                        </p>
                    </div>
                ) : (
                    <FormField id="sandi-lama" label="Kata Sandi Saat Ini" error={errors.current}>
                        <PasswordInput id="sandi-lama" value={current} onChange={(value) => {
                        clearError('current')
                        setCurrent(value)
                    }} autoComplete="current-password" invalid={Boolean(errors.current)} />
                    </FormField>
                )}

                <FormField id="sandi-baru" label="Kata Sandi Baru" error={errors.password}>
                    <PasswordInput id="sandi-baru" value={password} onChange={(value) => {
                        clearError('password')
                        setPassword(value)
                    }} autoComplete="new-password" invalid={Boolean(errors.password)} />
                </FormField>

                <FormField id="sandi-konfirmasi" label="Ulangi Kata Sandi Baru" error={errors.confirmation}>
                    <PasswordInput id="sandi-konfirmasi" value={confirmation} onChange={(value) => {
                        clearError('confirmation')
                        setConfirmation(value)
                    }} autoComplete="new-password" invalid={Boolean(errors.confirmation)} />
                </FormField>

                <ul aria-label="Syarat kata sandi" className="flex flex-col gap-1.5 rounded-2xl bg-[#F1F6F1] p-3.5">
                    <Requirement met={isLongEnough}>{`Minimal ${PASSWORD_MIN} karakter`}</Requirement>
                    <Requirement met={isMatching}>Kedua kata sandi sama</Requirement>
                </ul>

                <SubmitButton isLoading={isSaving} loadingLabel="Menyimpan…">
                    <Check className="size-5" strokeWidth={2.6} />
                    Simpan Kata Sandi
                </SubmitButton>
            </form>
        </FocusPage>
    )
}
