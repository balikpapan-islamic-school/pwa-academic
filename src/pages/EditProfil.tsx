import { FormEvent, useState } from 'react'
import { Check, LockKeyhole, Mail, School, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FieldShell } from '@/components/kit/field-shell'
import { FocusPage, focusCardClassName, FormField, SubmitButton } from '@/components/kit/focus-page'
import { useAuth } from '@/contexts/AuthContext'
import { useGoBack } from '@/hooks/use-go-back'
import { ApiError } from '@/services/api-client'

export default function EditProfil() {
    const goBack = useGoBack('/profil')
    const navigate = useNavigate()
    const { user, updateName } = useAuth()
    const initialName = user?.name ?? ''
    const [name, setName] = useState(initialName)
    const [error, setError] = useState<string>()
    const [isSaving, setIsSaving] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmed = name.trim().replace(/\s+/g, ' ')

        if (trimmed.length < 3 || trimmed.length > 100) {
            setError('Nama wali harus 3–100 karakter.')
            return
        }

        setError(undefined)
        setIsSaving(true)

        try {
            const nextUser = await updateName(trimmed)
            toast.success('Nama wali tersimpan.', { description: nextUser.name })
            navigate('/profil', { replace: true })
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.errors?.name?.length) {
                setError(caughtError.errors.name[0])
            } else {
                toast.error(caughtError instanceof Error ? caughtError.message : 'Nama wali gagal disimpan.')
            }
            setIsSaving(false)
        }
    }

    return (
        <FocusPage title="Edit Profil" subtitle="Data akun orang tua / wali." onBack={goBack} isDirty={name.trim() !== initialName}>
            <form onSubmit={handleSubmit} noValidate className={focusCardClassName}>
                <FormField id="nama-wali" label="Nama Wali" error={error} hint="Nama ini tampil untuk wali kelas, misalnya saat Anda mengajukan izin.">
                    <FieldShell invalid={Boolean(error)}>
                        <UserRound className="size-5 shrink-0" />
                        <input
                            id="nama-wali"
                            autoComplete="name"
                            autoCapitalize="words"
                            maxLength={100}
                            value={name}
                            onChange={(event) => {
                                setError(undefined)
                                setName(event.target.value)
                            }}
                            aria-invalid={Boolean(error)}
                            aria-describedby="nama-wali-desc"
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                    </FieldShell>
                </FormField>

                <FormField id="email-wali" label="Email" hint="Email dipakai untuk masuk dan tidak bisa diubah dari aplikasi.">
                    <div className="flex h-[54px] items-center gap-2.5 rounded-2xl bg-[#F1F6F1] px-3.5 text-[#5F6E64]">
                        <Mail className="size-5 shrink-0" />
                        <input id="email-wali" value={user?.email ?? ''} readOnly aria-describedby="email-wali-desc" className="min-w-0 flex-grow bg-transparent text-base text-subtle outline-none" />
                        <LockKeyhole aria-label="Terkunci" className="size-[18px] shrink-0" />
                    </div>
                </FormField>

                <SubmitButton isLoading={isSaving} loadingLabel="Menyimpan…">
                    <Check className="size-5" strokeWidth={2.6} />
                    Simpan
                </SubmitButton>
            </form>

            <div className="mx-5 mt-5 flex gap-3 rounded-[20px] bg-card p-3.5">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-violet text-primary">
                    <School className="size-5" />
                </span>
                <p className="text-[13px] leading-normal text-subtle">
                    <span className="font-extrabold text-ink">Data peserta didik diubah oleh sekolah.</span> Jika nama, tanggal lahir, atau NIS anak tidak sesuai, hubungi Tata Usaha.
                </p>
            </div>
        </FocusPage>
    )
}
