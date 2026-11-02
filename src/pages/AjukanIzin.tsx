import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import { ArrowRight, FileText, Info, Paperclip, Send, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { FieldShell } from '@/components/kit/field-shell'
import { FocusPage, focusCardClassName, FormField, SubmitButton, SuccessCard } from '@/components/kit/focus-page'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useStudent } from '@/contexts/StudentContext'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { formatDateRange, formatFileSize, parseIsoDate, toIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { ApiError } from '@/services/api-client'
import { LeaveType } from '@/types/academic'

const REASON_MAX = 500
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
const ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const leaveTypes: Array<{ value: LeaveType, label: string, hint: string }> = [
    { value: 'izin', label: 'Izin', hint: 'Keperluan keluarga, lomba, dan lainnya.' },
    { value: 'sakit', label: 'Sakit', hint: 'Lampirkan surat dokter bila ada.' },
]

// Hari sekolah (Senin–Jumat) di antara dua tanggal, inklusif.
function countSchoolDays(start: string, end: string) {
    let count = 0
    for (let date = parseIsoDate(start); date <= parseIsoDate(end); date.setDate(date.getDate() + 1)) {
        if (date.getDay() !== 0 && date.getDay() !== 6) {
            count += 1
        }
    }
    return count
}

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

type Errors = { type?: string, startDate?: string, endDate?: string, reason?: string, attachment?: string }

// Key error validasi backend (snake_case) -> field form.
const apiErrorFields: Record<string, keyof Errors> = {
    type: 'type',
    start_date: 'startDate',
    end_date: 'endDate',
    reason: 'reason',
    attachment: 'attachment',
}

export default function AjukanIzin() {
    const goBack = useGoBack('/absensi')
    const { activeStudent } = useStudent()
    const studentId = activeStudent?.id ?? ''
    // Hanya untuk teks "diperiksa oleh ..."; bila gagal dimuat cukup sebut "wali kelas".
    const classroom = useApiData(studentId ? () => academicService.getClassroom(studentId) : null, [studentId])
    const homeroomTeacher = classroom.data?.homeroomTeacher ?? 'wali kelas'
    const today = toIsoDate(new Date())
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [type, setType] = useState<LeaveType | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [reason, setReason] = useState('')
    const [attachment, setAttachment] = useState<File | null>(null)
    const [errors, setErrors] = useState<Errors>({})
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const schoolDays = startDate && endDate && endDate >= startDate ? countSchoolDays(startDate, endDate) : null

    function clearError(key: keyof Errors) {
        setErrors((current) => ({ ...current, [key]: undefined }))
    }

    function handleStartDate(value: string) {
        clearError('startDate')
        setStartDate(value)
        // Tanggal selesai mengikuti tanggal mulai bila belum diisi atau jadi lebih awal.
        if (!endDate || endDate < value) {
            clearError('endDate')
            setEndDate(value)
        }
    }

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null
        event.target.value = ''
        if (!file) {
            return
        }

        if (!ATTACHMENT_TYPES.includes(file.type)) {
            setErrors((current) => ({ ...current, attachment: 'Gunakan file PDF, JPG, atau PNG.' }))
            return
        }
        if (file.size > ATTACHMENT_MAX_BYTES) {
            setErrors((current) => ({ ...current, attachment: 'Ukuran file maksimal 5 MB.' }))
            return
        }

        setErrors((current) => ({ ...current, attachment: undefined }))
        setAttachment(file)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const nextErrors: Errors = {}

        if (!type) {
            nextErrors.type = 'Pilih jenis pengajuan.'
        }
        if (!startDate) {
            nextErrors.startDate = 'Pilih tanggal mulai.'
        } else if (startDate < today) {
            nextErrors.startDate = 'Tanggal mulai tidak boleh sebelum hari ini.'
        }
        if (!endDate) {
            nextErrors.endDate = 'Pilih tanggal selesai.'
        } else if (startDate && endDate < startDate) {
            nextErrors.endDate = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
        }
        if (reason.trim().length < 5) {
            nextErrors.reason = 'Tuliskan alasan singkat (minimal 5 karakter).'
        }

        setErrors(nextErrors)
        if (Object.keys(nextErrors).length === 0) {
            setIsConfirmOpen(true)
        }
    }

    async function send() {
        if (!type || !studentId) {
            return
        }

        setIsSending(true)

        try {
            await academicService.createLeaveRequest({ studentId, type, startDate, endDate, reason: reason.trim(), attachment })
            setIsSent(true)
        } catch (caughtError) {
            if (caughtError instanceof ApiError && caughtError.errors) {
                const nextErrors: Errors = {}
                for (const [key, messages] of Object.entries(caughtError.errors)) {
                    const field = apiErrorFields[key]
                    if (field && messages[0]) {
                        nextErrors[field] = messages[0]
                    }
                }
                setErrors(nextErrors)
                if (Object.keys(nextErrors).length === 0) {
                    toast.error(caughtError.message)
                }
            } else {
                // 409 (tanggal bertumpuk), 403, dan galat lain: pesan backend sudah ramah untuk orang tua.
                toast.error('Pengajuan izin gagal dikirim.', { description: caughtError instanceof Error ? caughtError.message : undefined })
            }
        } finally {
            setIsSending(false)
        }
    }

    const summaryRows = [
        ['Jenis', type === 'sakit' ? 'Sakit' : 'Izin'],
        ['Tanggal', startDate && endDate ? formatDateRange(startDate, endDate) : '-'],
        ['Lampiran', attachment?.name ?? '-'],
    ].map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 border-b border-muted py-2.5 last:border-b-0">
            <dt className="shrink-0 text-[13px] font-bold text-subtle">{label}</dt>
            <dd className="min-w-0 break-words text-right text-sm font-bold">{value}</dd>
        </div>
    ))

    if (isSent) {
        return (
            <FocusPage title="Ajukan Izin" subtitle={activeStudent ? `Untuk ${activeStudent.name}` : undefined}>
                <SuccessCard title="Pengajuan terkirim!" description={`${capitalize(homeroomTeacher)} akan memeriksa pengajuan ini. Anda akan mendapat notifikasi setelah diproses.`}>
                    <dl className="flex w-full flex-col rounded-2xl border-2 border-border px-4 py-1 text-left">
                        {summaryRows}
                        <div className="flex items-center justify-between gap-3 py-2.5">
                            <dt className="text-[13px] font-bold text-subtle">Status</dt>
                            <dd className="rounded-full bg-pastel-sun px-2.5 py-1 text-xs font-extrabold text-[#6B4A00]">Menunggu persetujuan</dd>
                        </div>
                    </dl>
                    <Link to="/absensi" replace className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)]">
                        Kembali ke Absensi
                        <ArrowRight className="size-5" strokeWidth={2.4} />
                    </Link>
                </SuccessCard>
            </FocusPage>
        )
    }

    return (
        <FocusPage title="Ajukan Izin" subtitle={activeStudent ? [`Untuk ${activeStudent.name}`, activeStudent.className !== '-' ? activeStudent.className : null].filter(Boolean).join(' · ') : undefined} onBack={goBack} isDirty={Boolean(type || startDate || reason || attachment)}>
            <form onSubmit={handleSubmit} noValidate className={focusCardClassName}>
                <fieldset className="flex flex-col gap-1.5">
                    <legend className="mb-1.5 text-sm font-extrabold">Jenis Pengajuan</legend>
                    <div className="grid grid-cols-2 gap-2">
                        {leaveTypes.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                aria-pressed={type === item.value}
                                onClick={() => {
                                    clearError('type')
                                    setType(item.value)
                                }}
                                className={cn('h-12 rounded-full text-[15px] font-extrabold transition-colors', type === item.value ? 'bg-ink text-white' : 'border-2 border-border bg-card text-[#44544A]')}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {errors.type
                        ? <p className="text-sm font-semibold text-destructive">{errors.type}</p>
                        : type ? <p className="text-xs text-subtle">{leaveTypes.find((item) => item.value === type)?.hint}</p> : null}
                </fieldset>

                <div className="grid grid-cols-2 gap-2.5">
                    <FormField id="izin-mulai" label="Dari" error={errors.startDate}>
                        <FieldShell invalid={Boolean(errors.startDate)}>
                            <input
                                id="izin-mulai"
                                type="date"
                                min={today}
                                value={startDate}
                                onChange={(event) => handleStartDate(event.target.value)}
                                aria-invalid={Boolean(errors.startDate)}
                                aria-describedby="izin-mulai-desc"
                                className="min-w-0 flex-grow bg-transparent text-[15px] text-ink outline-none"
                            />
                        </FieldShell>
                    </FormField>
                    <FormField id="izin-selesai" label="Sampai" error={errors.endDate}>
                        <FieldShell invalid={Boolean(errors.endDate)}>
                            <input
                                id="izin-selesai"
                                type="date"
                                min={startDate || today}
                                value={endDate}
                                onChange={(event) => {
                                    clearError('endDate')
                                    setEndDate(event.target.value)
                                }}
                                aria-invalid={Boolean(errors.endDate)}
                                aria-describedby="izin-selesai-desc"
                                className="min-w-0 flex-grow bg-transparent text-[15px] text-ink outline-none"
                            />
                        </FieldShell>
                    </FormField>
                </div>
                {schoolDays !== null ? (
                    <p aria-live="polite" className="-mt-2 text-[13px] font-bold text-subtle">
                        {schoolDays > 0 ? `${schoolDays} hari sekolah tidak masuk` : 'Tanggal yang dipilih jatuh di akhir pekan.'}
                    </p>
                ) : null}

                <FormField id="izin-alasan" label="Alasan" error={errors.reason}>
                    <div className={cn(
                        'rounded-2xl border-2 bg-card px-3.5 py-3 transition-shadow focus-within:border-primary focus-within:shadow-[0_0_0_4px_#DCFCE7]',
                        errors.reason ? 'border-destructive' : 'border-border'
                    )}>
                        <textarea
                            id="izin-alasan"
                            rows={4}
                            maxLength={REASON_MAX}
                            placeholder="Contoh: Demam sejak semalam, perlu istirahat di rumah."
                            value={reason}
                            onChange={(event) => {
                                clearError('reason')
                                setReason(event.target.value)
                            }}
                            aria-invalid={Boolean(errors.reason)}
                            aria-describedby="izin-alasan-desc"
                            className="block w-full resize-none bg-transparent text-base text-ink outline-none"
                        />
                        <p className="text-right text-xs font-bold text-subtle">{reason.length}/{REASON_MAX}</p>
                    </div>
                </FormField>

                <div className="flex flex-col gap-1.5">
                    <span id="izin-lampiran-l" className="text-sm font-extrabold">Lampiran <span className="font-bold text-subtle">(opsional)</span></span>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} className="hidden" aria-labelledby="izin-lampiran-l" />
                    {attachment ? (
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-border p-2.5 pl-3">
                            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-fg">
                                <FileText className="size-5" />
                            </span>
                            <span className="flex min-w-0 flex-grow flex-col">
                                <span className="truncate text-sm font-extrabold">{attachment.name}</span>
                                <span className="text-xs text-subtle">{formatFileSize(attachment.size)}</span>
                            </span>
                            <button type="button" aria-label="Hapus lampiran" onClick={() => setAttachment(null)} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
                                <X className="size-[18px]" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn('flex h-[54px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-[15px] font-extrabold text-primary', errors.attachment ? 'border-destructive' : 'border-[#B9D7C2]')}>
                            <Paperclip className="size-5" />
                            Pilih File
                        </button>
                    )}
                    {errors.attachment
                        ? <p className="text-sm font-semibold text-destructive">{errors.attachment}</p>
                        : <p className="text-xs text-subtle">PDF, JPG, atau PNG, maksimal 5 MB. Misalnya surat dokter.</p>}
                </div>

                <SubmitButton isLoading={isSending} loadingLabel="Mengirim…">
                    Kirim Pengajuan
                    <Send className="size-5" strokeWidth={2.4} />
                </SubmitButton>
            </form>

            <div className="mx-5 mt-5 flex gap-3 rounded-[20px] bg-card p-3.5">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sun text-pastel-sun-fg">
                    <Info className="size-5" />
                </span>
                <p className="text-[13px] leading-normal text-subtle">
                    Pengajuan diperiksa oleh <span className="font-extrabold text-ink">{homeroomTeacher}</span>{homeroomTeacher.endsWith('.') ? '' : '.'} Jika disetujui, absensi pada tanggal tersebut tercatat sebagai izin/sakit.
                </p>
            </div>
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                icon={Send}
                title="Kirim pengajuan?"
                description={`Pengajuan akan dikirim ke ${homeroomTeacher} untuk disetujui.`}
                confirmLabel="Kirim"
                onConfirm={send}>
                <dl className="mt-4 flex w-full flex-col rounded-2xl border-2 border-border px-4 py-1 text-left">
                    {summaryRows}
                </dl>
            </ConfirmDialog>
        </FocusPage>
    )
}
