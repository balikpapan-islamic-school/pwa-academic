import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, Fingerprint, IdCard, Phone, Send, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ChildRequestCard } from '@/components/hubungkan/child-request-card'
import { FieldShell } from '@/components/kit/field-shell'
import { FocusPage, focusCardClassName, FormField, SubmitButton, SuccessCard } from '@/components/kit/focus-page'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { LoadingRegion } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { useRefreshSignal } from '@/contexts/RefreshContext'
import { useGoBack } from '@/hooks/use-go-back'
import { hasPendingChildRequest } from '@/lib/child-requests'
import { ChildLinkRequest, ChildRelationship, childRelationshipLabels } from '@/lib/dummy-ui'
import { formatDate, parseIsoDate, toIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { ApiError } from '@/services/api-client'

type Step = 'form' | 'sent'

const steps = ['Isi Data', 'Verifikasi Admin', 'Terhubung']
const relationships: ChildRelationship[] = ['AYAH', 'IBU', 'WALI']

type Errors = { nik?: string, birthDate?: string, nisn?: string, relationship?: string }

function findRelationshipKey(label: string) {
    return relationships.find((item) => childRelationshipLabels[item].toLowerCase() === label.toLowerCase()) ?? null
}

function StepIndicator({ current }: { current: number }) {
    return (
        <ol className="relative mt-5 flex items-center gap-2" aria-label="Langkah">
            {steps.map((label, index) => {
                const isReached = index <= current

                return (
                    <li key={label} aria-current={index === current ? 'step' : undefined} className="flex flex-1 flex-col gap-1.5">
                        <span className={cn('h-1.5 rounded-full transition-colors', isReached ? 'bg-cta' : 'bg-white/25')} />
                        <span className={cn('text-xs font-extrabold', isReached ? 'text-white' : 'text-white/60')}>
                            {index + 1}. {label}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}

export default function HubungkanAnak() {
    const goBack = useGoBack('/')
    const location = useLocation()
    // "Ajukan Ulang" dari Beranda mengirim pengajuan yang ditolak lewat state navigasi.
    const resubmitted = (location.state as { resubmit?: ChildLinkRequest } | null)?.resubmit
    const today = toIsoDate(new Date())
    const [step, setStep] = useState<Step>('form')
    const [requests, setRequests] = useState<ChildLinkRequest[]>([])
    const [isRequestsLoaded, setIsRequestsLoaded] = useState(false)
    const [nik, setNik] = useState(resubmitted?.nik ?? '')
    const [birthDate, setBirthDate] = useState(resubmitted?.birthDate ?? '')
    const [nisn, setNisn] = useState(resubmitted?.nisn ?? '')
    const [relationship, setRelationship] = useState<ChildRelationship | null>(resubmitted ? findRelationshipKey(resubmitted.relationship) : null)
    const [errors, setErrors] = useState<Errors>({})
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)

    const { refreshKey, track } = useRefreshSignal()

    useEffect(() => {
        let cancelled = false

        track(academicService.getChildRequests()
            .then((result) => {
                if (!cancelled) {
                    setRequests(result)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    toast.error('Status pengajuan gagal dimuat.', { description: 'Form tetap bisa dikirim.' })
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsRequestsLoaded(true)
                }
            }))

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey])

    const isLocked = hasPendingChildRequest(requests)

    function clearError(key: keyof Errors) {
        setErrors((current) => ({ ...current, [key]: undefined }))
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const nextErrors: Errors = {}

        if (!/^\d{16}$/.test(nik)) {
            nextErrors.nik = 'NIK harus 16 digit.'
        }
        if (!birthDate) {
            nextErrors.birthDate = 'Pilih tanggal lahir anak.'
        } else if (birthDate >= today) {
            nextErrors.birthDate = 'Tanggal lahir harus sebelum hari ini.'
        }
        if (nisn && !/^\d{10}$/.test(nisn)) {
            nextErrors.nisn = 'NISN harus 10 digit, atau kosongkan.'
        }
        if (!relationship) {
            nextErrors.relationship = 'Pilih hubungan Anda dengan anak.'
        }

        setErrors(nextErrors)
        if (Object.keys(nextErrors).length === 0) {
            setIsConfirmOpen(true)
        }
    }

    async function send() {
        if (!relationship || isLocked) {
            return
        }

        setIsSending(true)

        try {
            const request = await academicService.createChildRequest({ nik, birthDate, nisn: nisn || null, relationship })
            setRequests((current) => [request, ...current])
            setStep('sent')
            window.scrollTo({ top: 0 })
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.errors) {
                setErrors({
                    nik: caughtError.errors.nik?.[0],
                    birthDate: caughtError.errors.tanggal_lahir?.[0],
                    nisn: caughtError.errors.nisn?.[0],
                    relationship: caughtError.errors.hubungan?.[0],
                })
            } else if (caughtError instanceof ApiError && caughtError.status === 429) {
                toast.error('Terlalu banyak pengajuan.', { description: 'Tunggu sebentar, lalu coba lagi.' })
            } else {
                toast.error('Pengajuan gagal dikirim.', { description: caughtError instanceof Error ? caughtError.message : undefined })
            }
        } finally {
            setIsSending(false)
        }
    }

    // Isi ulang form dari pengajuan yang ditolak agar wali cukup memperbaiki bagian yang salah.
    function resubmit(request: ChildLinkRequest) {
        setNik(request.nik)
        setBirthDate(request.birthDate)
        setNisn(request.nisn ?? '')
        setRelationship(findRelationshipKey(request.relationship))
        setErrors({})
        setStep('form')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function startNew() {
        setNik('')
        setBirthDate('')
        setNisn('')
        setRelationship(null)
        setErrors({})
        setStep('form')
    }

    const requestHistory = requests.length > 0 ? (
        <section aria-labelledby="req-h" className="mx-5 mt-[22px] flex flex-col gap-2.5">
            <h2 id="req-h" className="ml-1 font-display text-[19px] font-semibold">Status Pengajuan</h2>
            {requests.map((request) => (
                <ChildRequestCard key={request.id} request={request} onResubmit={resubmit} canResubmit={!isLocked} />
            ))}
        </section>
    ) : null

    // Tunggu riwayat dimuat agar form tidak sempat tampil saat masih ada pengajuan PENDING.
    if (!isRequestsLoaded) {
        return (
            <FocusPage title={<>Hubungkan<br />Peserta Didik</>} subtitle="Memuat status pengajuan…" onBack={goBack} headerExtra={<StepIndicator current={0} />}>
                <LoadingRegion label="Memuat status pengajuan" className={focusCardClassName}>
                    {['w-20', 'w-32', 'w-28'].map((width) => (
                        <div key={width} className="flex flex-col gap-2">
                            <Skeleton className={cn('my-[3px] h-3.5', width)} />
                            <div className="flex h-[54px] items-center gap-2.5 rounded-2xl border-2 border-border bg-card pl-3.5">
                                <Skeleton className="size-5 rounded-md" />
                                <Skeleton className="h-3.5 w-36" />
                            </div>
                        </div>
                    ))}
                    <Skeleton className="mt-1 h-14 rounded-full" />
                </LoadingRegion>
            </FocusPage>
        )
    }

    if (step === 'sent' || isLocked) {
        return (
            <FocusPage
                title={<>Hubungkan<br />Peserta Didik</>}
                subtitle="Data anak diverifikasi oleh admin sekolah."
                onBack={goBack}
                headerExtra={<StepIndicator current={1} />}>
                <SuccessCard
                    icon={Clock3}
                    title="Menunggu verifikasi admin"
                    description={isLocked
                        ? 'Admin sekolah sedang mencocokkan data pengajuan Anda. Pengajuan anak lain bisa dikirim setelah pengajuan ini selesai diverifikasi.'
                        : 'Admin sekolah akan mencocokkan data dengan data peserta didik. Setelah disetujui, data anak langsung tampil di Beranda.'}>
                    <Link to="/" className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)]">
                        Kembali ke Beranda
                        <ArrowRight className="size-5" strokeWidth={2.4} />
                    </Link>
                    {isLocked ? null : (
                        <button type="button" onClick={startNew} className="text-sm font-extrabold text-primary">
                            Ajukan anak lain
                        </button>
                    )}
                </SuccessCard>
                {requestHistory}
            </FocusPage>
        )
    }

    return (
        <FocusPage
            title={<>Hubungkan<br />Peserta Didik</>}
            subtitle="Lihat nilai, absensi, dan jadwal anak Anda di aplikasi."
            onBack={goBack}
            isDirty={Boolean(nik || birthDate || nisn || relationship)}
            headerExtra={<StepIndicator current={0} />}>
            <form onSubmit={handleSubmit} noValidate className={focusCardClassName}>
                <FormField id="nik-anak" label="NIK Anak" error={errors.nik} hint="16 digit, tertera di Kartu Keluarga.">
                    <FieldShell invalid={Boolean(errors.nik)}>
                        <Fingerprint className="size-5 shrink-0" />
                        <input
                            id="nik-anak"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="Contoh: 6471000000000001"
                            value={nik}
                            onChange={(event) => {
                                clearError('nik')
                                setNik(event.target.value.replace(/\D/g, '').slice(0, 16))
                            }}
                            aria-invalid={Boolean(errors.nik)}
                            aria-describedby="nik-anak-desc"
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                        <span aria-hidden="true" className="shrink-0 pr-2 text-xs font-bold text-subtle">{nik.length}/16</span>
                    </FieldShell>
                </FormField>

                <FormField id="tgl-anak" label="Tanggal Lahir Anak" error={errors.birthDate}>
                    <FieldShell invalid={Boolean(errors.birthDate)}>
                        <CalendarDays className="size-5 shrink-0" />
                        <input
                            id="tgl-anak"
                            type="date"
                            value={birthDate}
                            max={today}
                            onChange={(event) => {
                                clearError('birthDate')
                                setBirthDate(event.target.value)
                            }}
                            aria-invalid={Boolean(errors.birthDate)}
                            aria-describedby="tgl-anak-desc"
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                    </FieldShell>
                </FormField>

                <FormField id="nisn-anak" label="NISN (opsional)" error={errors.nisn} hint="10 digit. Membantu admin mencocokkan data lebih cepat.">
                    <FieldShell invalid={Boolean(errors.nisn)}>
                        <IdCard className="size-5 shrink-0" />
                        <input
                            id="nisn-anak"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="Contoh: 0011223344"
                            value={nisn}
                            onChange={(event) => {
                                clearError('nisn')
                                setNisn(event.target.value.replace(/\D/g, '').slice(0, 10))
                            }}
                            aria-invalid={Boolean(errors.nisn)}
                            aria-describedby="nisn-anak-desc"
                            className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                        />
                    </FieldShell>
                </FormField>

                <fieldset className="flex flex-col gap-1.5">
                    <legend className="mb-1.5 text-sm font-extrabold">Hubungan dengan Anak</legend>
                    <div className="grid grid-cols-3 gap-2">
                        {relationships.map((item) => (
                            <button
                                key={item}
                                type="button"
                                aria-pressed={relationship === item}
                                onClick={() => {
                                    clearError('relationship')
                                    setRelationship(item)
                                }}
                                className={cn('h-12 rounded-full text-[15px] font-extrabold transition-colors', relationship === item ? 'bg-ink text-white' : 'border-2 border-border bg-card text-[#44544A]')}>
                                {childRelationshipLabels[item]}
                            </button>
                        ))}
                    </div>
                    {errors.relationship ? <p className="text-sm font-semibold text-destructive">{errors.relationship}</p> : null}
                </fieldset>

                <SubmitButton isLoading={isSending} loadingLabel="Mengirim…">
                    Kirim Pengajuan
                    <Send className="size-5" strokeWidth={2.4} />
                </SubmitButton>
            </form>

            <div className="mx-5 mt-5 flex flex-col gap-2.5">
                <div className="flex gap-3 rounded-[20px] bg-card p-3.5">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-mint text-pastel-mint-fg">
                        <ShieldCheck className="size-5" />
                    </span>
                    <p className="text-[13px] leading-normal text-subtle">
                        <span className="font-extrabold text-ink">Data Anda aman.</span> NIK dan tanggal lahir hanya dipakai admin sekolah untuk memastikan Anda orang tua/wali anak tersebut.
                    </p>
                </div>
                <a href="tel:+62542000000" className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-fg">
                        <Phone className="size-5" />
                    </span>
                    <span className="flex-grow text-[13px] leading-normal text-subtle">
                        <span className="block font-extrabold text-ink">Butuh bantuan?</span>
                        Hubungi Tata Usaha sekolah
                    </span>
                    <ArrowRight className="size-[18px] text-subtle" />
                </a>
            </div>

            {requestHistory}

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                icon={Send}
                title="Kirim pengajuan?"
                description="Admin sekolah akan memverifikasi data berikut sebelum anak terhubung ke akun Anda."
                confirmLabel="Kirim"
                onConfirm={send}>
                <dl className="mt-4 flex w-full flex-col rounded-2xl border-2 border-border px-4 py-1 text-left">
                    {[
                        ['NIK', nik],
                        ['Tanggal lahir', birthDate ? formatDate(parseIsoDate(birthDate)) : '-'],
                        ['NISN', nisn || '-'],
                        ['Hubungan', relationship ? childRelationshipLabels[relationship] : '-'],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 border-b border-muted py-2.5 last:border-b-0">
                            <dt className="shrink-0 text-[13px] font-bold text-subtle">{label}</dt>
                            <dd className="min-w-0 break-all text-right text-sm font-bold">{value}</dd>
                        </div>
                    ))}
                </dl>
            </ConfirmDialog>
        </FocusPage>
    )
}
