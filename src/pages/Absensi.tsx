import { useState } from 'react'
import { CalendarX2, ChevronLeft, ChevronRight, FilePlus2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { HeroCard } from '@/components/kit/hero-card'
import { ScreenHeader } from '@/components/kit/screen-header'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { dummyAttendanceHistory, dummyAttendanceSpecialDays, dummyAttendanceSummary, dummyAttendanceToday, dummyLeaveRequests, dummyStudent, DummyLeaveRequest, LeaveStatus } from '@/lib/dummy-ui'
import { formatDateRange, formatLongDate, monthNames } from '@/lib/format'
import { cn } from '@/lib/utils'

type DayStatus = 'hadir' | 'izin' | 'sakit' | 'alfa'

const statusLabels: Record<DayStatus, string> = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alfa: 'Alpa' }
const statusOrder: DayStatus[] = ['hadir', 'izin', 'sakit', 'alfa']

const statusStyles: Record<DayStatus, { tile: string, value: string, label: string, cell: string, legend: string, badge: string }> = {
    hadir: { tile: 'bg-pastel-mint', value: 'text-pastel-mint-fg', label: 'text-[#1E5753]', cell: 'bg-pastel-mint text-pastel-mint-fg', legend: 'bg-[#8ED9D2]', badge: 'bg-pastel-mint text-pastel-mint-fg' },
    izin: { tile: 'bg-pastel-sun', value: 'text-pastel-sun-fg', label: 'text-[#6B4A00]', cell: 'bg-[#F7D36A] text-[#4D3300]', legend: 'bg-[#F7D36A]', badge: 'bg-pastel-sun text-[#6B4A00]' },
    sakit: { tile: 'bg-pastel-sky', value: 'text-pastel-sky-fg', label: 'text-[#1F4A8A]', cell: 'bg-[#8FBEF5] text-[#0F3166]', legend: 'bg-[#8FBEF5]', badge: 'bg-pastel-sky text-[#1F4A8A]' },
    alfa: { tile: 'bg-pastel-coral', value: 'text-pastel-coral-fg', label: 'text-[#7A2E29]', cell: 'bg-[#F2A49E] text-[#5C1A15]', legend: 'bg-[#F2A49E]', badge: 'bg-pastel-coral text-[#7A2E29]' },
}

const historyIconStyles = {
    Hadir: 'bg-pastel-mint text-pastel-mint-fg',
    Sakit: 'bg-pastel-sky text-pastel-sky-fg',
}

const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function dateKey(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Data dummy: hari sekolah yang sudah lewat dianggap hadir, kecuali yang tercatat khusus.
function dummyStatusFor(date: Date, today: Date): DayStatus | null {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    if (isWeekend || date > today) {
        return null
    }

    return dummyAttendanceSpecialDays[dateKey(date.getFullYear(), date.getMonth(), date.getDate())] ?? 'hadir'
}

function MonthCalendar() {
    const today = new Date()
    const [month, setMonth] = useState(() => new Date(2026, 9, 1))
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7

    return (
        <section aria-labelledby="cal-h" className="rounded-3xl bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
                <button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="flex size-11 items-center justify-center rounded-full bg-background">
                    <ChevronLeft className="size-5" strokeWidth={2.4} />
                </button>
                <h2 id="cal-h" className="font-display text-lg font-semibold">{monthNames[monthIndex]} {year}</h2>
                <button type="button" aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="flex size-11 items-center justify-center rounded-full bg-background">
                    <ChevronRight className="size-5" strokeWidth={2.4} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekdayLabels.map((label) => (
                    <span key={label} className="py-1 text-xs font-extrabold text-subtle">{label}</span>
                ))}
                {Array.from({ length: leadingBlanks }, (_, index) => <span key={`blank-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1
                    const status = dummyStatusFor(new Date(year, monthIndex, day), today)

                    return (
                        <span
                            key={day}
                            aria-label={`${day} ${monthNames[monthIndex]}${status ? `, ${statusLabels[status]}` : ''}`}
                            className={cn('flex h-[38px] items-center justify-center rounded-xl text-sm font-extrabold', status ? statusStyles[status].cell : 'text-[#849087]')}>
                            {day}
                        </span>
                    )
                })}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-3 text-xs font-bold text-[#44544A]">
                {statusOrder.map((status) => (
                    <span key={status} className="flex items-center gap-1.5">
                        <span aria-hidden="true" className={cn('size-3 rounded', statusStyles[status].legend)} />
                        {statusLabels[status]}
                    </span>
                ))}
            </div>
        </section>
    )
}

const leaveStatusLabels: Record<LeaveStatus, { label: string, className: string }> = {
    menunggu: { label: 'Menunggu', className: 'bg-pastel-sun text-[#6B4A00]' },
    disetujui: { label: 'Disetujui', className: 'bg-pastel-mint text-pastel-mint-fg' },
    ditolak: { label: 'Ditolak', className: 'bg-pastel-coral text-[#7A2E29]' },
}

function LeaveRequests() {
    const [requests, setRequests] = useState(dummyLeaveRequests)
    const [pendingCancel, setPendingCancel] = useState<DummyLeaveRequest | null>(null)

    function cancelRequest() {
        if (!pendingCancel) {
            return
        }
        setRequests((current) => current.filter((item) => item.id !== pendingCancel.id))
        toast.success('Pengajuan izin dibatalkan')
    }

    return (
        <section aria-labelledby="izin-h" className="flex flex-col gap-2.5">
            <h2 id="izin-h" className="font-display text-[19px] font-semibold">Pengajuan Izin</h2>
            {requests.length === 0 ? (
                <p className="rounded-[20px] bg-card p-4 text-sm text-subtle">Belum ada pengajuan izin.</p>
            ) : requests.map((request) => (
                <div key={request.id} className="flex flex-col gap-2 rounded-[20px] bg-card p-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-[15px] font-extrabold">{request.type === 'sakit' ? 'Sakit' : 'Izin'} · {formatDateRange(request.startDate, request.endDate)}</span>
                            <span className="text-[13px] text-subtle">{request.reason}</span>
                        </span>
                        <span className={cn('shrink-0 rounded-full px-2.5 py-1.5 text-xs font-extrabold', leaveStatusLabels[request.status].className)}>
                            {leaveStatusLabels[request.status].label}
                        </span>
                    </div>
                    {request.reviewNote ? (
                        <p className="rounded-xl bg-[#F1F6F1] px-3 py-2 text-[13px] text-[#44544A]">
                            <span className="font-extrabold">Wali kelas:</span> {request.reviewNote}
                        </p>
                    ) : null}
                    {request.status === 'menunggu' ? (
                        <button
                            type="button"
                            onClick={() => setPendingCancel(request)}
                            className="h-10 self-start rounded-full border-2 border-[#F3C3BF] px-4 text-[13px] font-extrabold text-[#B3362F]">
                            Batalkan Pengajuan
                        </button>
                    ) : null}
                </div>
            ))}
            <ConfirmDialog
                open={pendingCancel !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingCancel(null)
                    }
                }}
                icon={CalendarX2}
                tone="danger"
                title="Batalkan pengajuan?"
                description={pendingCancel
                    ? `Pengajuan ${pendingCancel.type} ${formatDateRange(pendingCancel.startDate, pendingCancel.endDate)} akan ditarik dari wali kelas.`
                    : ''}
                cancelLabel="Tidak"
                confirmLabel="Ya, Batalkan"
                onConfirm={cancelRequest}
            />
        </section>
    )
}

export default function Absensi() {
    const today = dummyAttendanceToday

    return (
        <div className="flex flex-col gap-[18px]">
            <ScreenHeader
                title="Absensi"
                action={(
                    <Link to="/absensi/izin" className="flex h-11 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-extrabold text-primary shadow-chip">
                        <FilePlus2 className="size-[18px]" />
                        Ajukan Izin
                    </Link>
                )}
                compactAction={(
                    <Link to="/absensi/izin" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.18] px-3.5 text-[13px] font-extrabold">
                        <FilePlus2 className="size-4" />
                        Ajukan Izin
                    </Link>
                )}
            />

            <HeroCard tone="ink">
                <p className="text-[13px] font-bold text-[#C8D8CD]">{formatLongDate(new Date())}</p>
                <div className="mt-1.5 flex items-center gap-2.5">
                    <p className="font-display text-[22px] font-semibold">
                        {today.status ? `${dummyStudent.nickname} ${statusLabels[today.status].toLowerCase()} hari ini` : 'Belum ada catatan hari ini'}
                    </p>
                    {today.punctuality ? (
                        <span className="rounded-full bg-pastel-mint px-2.5 py-1 text-xs font-extrabold text-pastel-mint-fg">{today.punctuality}</span>
                    ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs font-bold text-[#C8D8CD]">Jam Masuk</p>
                        <p className="mt-0.5 font-display text-xl font-semibold">{today.checkInAt ?? '--.--'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-xs font-bold text-[#C8D8CD]">Jam Pulang</p>
                        <p className="mt-0.5 font-display text-xl font-semibold">{today.checkOutAt ?? '--.--'}</p>
                    </div>
                </div>
                <p className="mt-3 text-xs text-[#C8D8CD]">Kehadiran dicatat oleh guru di sekolah.</p>
            </HeroCard>

            <section aria-label="Rekap semester" className="grid grid-cols-4 gap-2">
                {statusOrder.map((status) => (
                    <div key={status} className={cn('rounded-[18px] px-1 py-3 text-center', statusStyles[status].tile)}>
                        <p className={cn('font-display text-[22px] font-bold', statusStyles[status].value)}>{dummyAttendanceSummary[status]}</p>
                        <p className={cn('text-xs font-extrabold', statusStyles[status].label)}>{statusLabels[status]}</p>
                    </div>
                ))}
            </section>

            <MonthCalendar />

            <LeaveRequests />

            <section aria-labelledby="hist-h" className="flex flex-col gap-2.5">
                <h2 id="hist-h" className="font-display text-[19px] font-semibold">Riwayat Terbaru</h2>
                {dummyAttendanceHistory.map((item) => (
                    <div key={item.day} className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
                        <span aria-hidden="true" className={cn('flex size-[46px] shrink-0 items-center justify-center rounded-[14px] font-display text-[17px] font-bold', historyIconStyles[item.status])}>
                            {item.day}
                        </span>
                        <span className="flex flex-grow flex-col gap-0.5">
                            <span className="text-[15px] font-extrabold">{item.title}</span>
                            <span className="text-[13px] text-subtle">{item.detail}</span>
                        </span>
                        <span className={cn('rounded-full px-2.5 py-1.5 text-xs font-extrabold', item.status === 'Hadir' ? statusStyles.hadir.badge : statusStyles.sakit.badge)}>{item.status}</span>
                    </div>
                ))}
            </section>
        </div>
    )
}
