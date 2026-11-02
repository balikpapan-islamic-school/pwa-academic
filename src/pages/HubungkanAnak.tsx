import { FormEvent, useState } from 'react'
import { ArrowRight, CalendarDays, Check, IdCard, Phone, SearchX, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FieldShell } from '@/components/kit/field-shell'
import { FocusPage, focusCardClassName, SubmitButton, SuccessCard } from '@/components/kit/focus-page'
import { useGoBack } from '@/hooks/use-go-back'
import { dummyStudent } from '@/lib/dummy-ui'
import { formatDate, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type Step = 'form' | 'confirm' | 'success'
type Relation = 'Ayah' | 'Ibu' | 'Wali'

const steps: Array<{ key: Step, label: string }> = [
    { key: 'form', label: 'Isi Data' },
    { key: 'confirm', label: 'Konfirmasi' },
    { key: 'success', label: 'Selesai' },
]

const relations: Relation[] = ['Ayah', 'Ibu', 'Wali']

// Simulasi pencarian: hanya data dummy (NIS/NISN + tanggal lahir Naura) yang ditemukan.
function findDummyStudent(identity: string, birthDate: string) {
    return new Promise<boolean>((resolve) => {
        window.setTimeout(() => {
            resolve((identity === dummyStudent.nis || identity === dummyStudent.nisn) && birthDate === dummyStudent.birthDate)
        }, 800)
    })
}

function StepIndicator({ current }: { current: Step }) {
    const currentIndex = steps.findIndex((step) => step.key === current)

    return (
        <ol className="relative mt-5 flex items-center gap-2" aria-label="Langkah">
            {steps.map((step, index) => {
                const isDone = index < currentIndex
                const isActive = index === currentIndex

                return (
                    <li key={step.key} aria-current={isActive ? 'step' : undefined} className="flex flex-1 flex-col gap-1.5">
                        <span className={cn('h-1.5 rounded-full transition-colors', isDone || isActive ? 'bg-cta' : 'bg-white/25')} />
                        <span className={cn('text-xs font-extrabold', isDone || isActive ? 'text-white' : 'text-white/60')}>
                            {index + 1}. {step.label}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}

function StudentPreview() {
    return (
        <div className="flex items-center gap-3.5 rounded-[20px] bg-[#F1F6F1] p-3.5">
            <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-pastel-coral font-display text-xl font-bold text-pastel-coral-fg">
                {dummyStudent.initials}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-display text-lg font-bold leading-tight">{dummyStudent.name}</span>
                <span className="text-[13px] text-subtle">NIS {dummyStudent.nis} · Kelas {dummyStudent.className}</span>
                <span className="text-[13px] text-subtle">{dummyStudent.unit}</span>
            </span>
        </div>
    )
}

export default function HubungkanAnak() {
    const leavePage = useGoBack('/?state=kosong')
    const [step, setStep] = useState<Step>('form')
    const [identity, setIdentity] = useState('')
    const [birthDate, setBirthDate] = useState('')
    const [relation, setRelation] = useState<Relation | null>(null)
    const [errors, setErrors] = useState<{ identity?: string, birthDate?: string, relation?: string }>({})
    const [notFound, setNotFound] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    function goBack() {
        if (step === 'confirm') {
            setStep('form')
            return
        }

        leavePage()
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const nextErrors: typeof errors = {}

        if (!/^\d{5,10}$/.test(identity)) {
            nextErrors.identity = 'Masukkan NIS (5–10 digit) atau NISN (10 digit).'
        }
        if (!birthDate) {
            nextErrors.birthDate = 'Pilih tanggal lahir peserta didik.'
        }
        if (!relation) {
            nextErrors.relation = 'Pilih hubungan Anda dengan peserta didik.'
        }

        setErrors(nextErrors)
        setNotFound(false)
        if (Object.keys(nextErrors).length > 0) {
            return
        }

        setIsSearching(true)
        const found = await findDummyStudent(identity, birthDate)
        setIsSearching(false)

        if (found) {
            setStep('confirm')
        } else {
            setNotFound(true)
        }
    }

    return (
        <FocusPage
            title={<>Hubungkan<br />Peserta Didik</>}
            subtitle="Lihat nilai, absensi, dan jadwal anak Anda di aplikasi."
            onBack={step !== 'success' ? goBack : undefined}
            headerExtra={<StepIndicator current={step} />}>
            {step === 'form' ? (
                <>
                    <form onSubmit={handleSubmit} noValidate className={focusCardClassName}>
                        {notFound ? (
                            <div role="alert" className="flex gap-3 rounded-2xl bg-pastel-coral p-3.5 text-pastel-coral-fg">
                                <SearchX className="mt-0.5 size-5 shrink-0" />
                                <p className="text-sm font-bold leading-snug">Data tidak ditemukan. Pastikan NIS/NISN dan tanggal lahir sesuai data di sekolah.</p>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="nis-anak" className="text-sm font-extrabold">NIS / NISN Peserta Didik</label>
                            <FieldShell invalid={Boolean(errors.identity)}>
                                <IdCard className="size-5 shrink-0" />
                                <input
                                    id="nis-anak"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="Contoh: 2024017"
                                    value={identity}
                                    onChange={(event) => setIdentity(event.target.value.replace(/\D/g, '').slice(0, 10))}
                                    aria-invalid={Boolean(errors.identity)}
                                    aria-describedby={errors.identity ? 'nis-error' : 'nis-hint'}
                                    className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                                />
                            </FieldShell>
                            {errors.identity
                                ? <p id="nis-error" className="text-sm font-semibold text-destructive">{errors.identity}</p>
                                : <p id="nis-hint" className="text-xs text-subtle">Tertera di kartu pelajar atau rapor.</p>}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="tgl-anak" className="text-sm font-extrabold">Tanggal Lahir</label>
                            <FieldShell invalid={Boolean(errors.birthDate)}>
                                <CalendarDays className="size-5 shrink-0" />
                                <input
                                    id="tgl-anak"
                                    type="date"
                                    value={birthDate}
                                    max={new Date().toISOString().slice(0, 10)}
                                    onChange={(event) => setBirthDate(event.target.value)}
                                    aria-invalid={Boolean(errors.birthDate)}
                                    className="min-w-0 flex-grow bg-transparent text-base text-ink outline-none"
                                />
                            </FieldShell>
                            {errors.birthDate ? <p className="text-sm font-semibold text-destructive">{errors.birthDate}</p> : null}
                        </div>

                        <fieldset className="flex flex-col gap-1.5">
                            <legend className="mb-1.5 text-sm font-extrabold">Hubungan dengan Peserta Didik</legend>
                            <div className="grid grid-cols-3 gap-2">
                                {relations.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        aria-pressed={relation === item}
                                        onClick={() => setRelation(item)}
                                        className={cn('h-12 rounded-full text-[15px] font-extrabold transition-colors', relation === item ? 'bg-ink text-white' : 'border-2 border-border bg-card text-[#44544A]')}>
                                        {item}
                                    </button>
                                ))}
                            </div>
                            {errors.relation ? <p className="text-sm font-semibold text-destructive">{errors.relation}</p> : null}
                        </fieldset>

                        <SubmitButton isLoading={isSearching} loadingLabel="Mencari data…">
                            Cari Peserta Didik
                            <ArrowRight className="size-5" strokeWidth={2.4} />
                        </SubmitButton>
                    </form>

                    <div className="mx-5 mt-5 flex flex-col gap-2.5">
                        <div className="flex gap-3 rounded-[20px] bg-card p-3.5">
                            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-mint text-pastel-mint-fg">
                                <ShieldCheck className="size-5" />
                            </span>
                            <p className="text-[13px] leading-normal text-subtle">
                                <span className="font-extrabold text-ink">Data Anda aman.</span> Tanggal lahir dipakai untuk memastikan hanya orang tua/wali yang bisa menghubungkan data anak.
                            </p>
                        </div>
                        <a href="tel:+62542000000" className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
                            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-fg">
                                <Phone className="size-5" />
                            </span>
                            <span className="flex-grow text-[13px] leading-normal text-subtle">
                                <span className="block font-extrabold text-ink">Tidak tahu NIS?</span>
                                Hubungi Tata Usaha sekolah
                            </span>
                            <ArrowRight className="size-[18px] text-subtle" />
                        </a>
                    </div>
                </>
            ) : null}

            {step === 'confirm' ? (
                <section aria-labelledby="confirm-h" className={focusCardClassName}>
                    <div>
                        <h2 id="confirm-h" className="font-display text-xl font-bold">Apakah ini anak Anda?</h2>
                        <p className="mt-1 text-sm text-subtle">Periksa kembali sebelum menghubungkan.</p>
                    </div>
                    <StudentPreview />
                    <dl className="flex flex-col rounded-2xl border-2 border-border px-4 py-1">
                        {[
                            ['Tanggal lahir', formatDate(parseIsoDate(dummyStudent.birthDate))],
                            ['Wali kelas', dummyStudent.homeroomTeacher],
                            ['Hubungan', relation ?? '-'],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-3 border-b border-muted py-2.5 last:border-b-0">
                                <dt className="text-[13px] font-bold text-subtle">{label}</dt>
                                <dd className="text-sm font-bold">{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
                        <button type="button" onClick={() => setStep('form')} className="h-[52px] rounded-full border-2 border-border bg-card text-[15px] font-extrabold">Bukan</button>
                        <button type="button" onClick={() => setStep('success')} className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-extrabold text-white">
                            <Check className="size-5" strokeWidth={2.6} />
                            Ya, Hubungkan
                        </button>
                    </div>
                </section>
            ) : null}

            {step === 'success' ? (
                <SuccessCard title="Berhasil terhubung!" description={`Sekarang Anda bisa memantau nilai, absensi, dan jadwal ${dummyStudent.nickname}.`}>
                    <div className="w-full text-left">
                        <StudentPreview />
                    </div>
                    <Link to="/" className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)]">
                        Lihat Beranda {dummyStudent.nickname}
                        <ArrowRight className="size-5" strokeWidth={2.4} />
                    </Link>
                </SuccessCard>
            ) : null}
        </FocusPage>
    )
}
