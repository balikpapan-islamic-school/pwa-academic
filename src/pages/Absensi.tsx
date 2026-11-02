import { ReactNode, useState } from 'react'
import { CalendarX2, ChevronLeft, ChevronRight, FilePlus2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { HeroCard } from '@/components/kit/hero-card'
import { ScreenHeader } from '@/components/kit/screen-header'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudent } from '@/contexts/StudentContext'
import { useApiData } from '@/hooks/use-api-data'
import { dayNames, formatClock, formatDateRange, formatLongDate, monthNames, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveStatus } from '@/types/academic'

type DayStatus = AttendanceStatus

const statusLabels: Record<DayStatus, string> = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alfa: 'Alpa' }
const statusOrder: DayStatus[] = ['hadir', 'izin', 'sakit', 'alfa']

const statusStyles: Record<DayStatus, { tile: string, value: string, label: string, cell: string, legend: string, badge: string }> = {
    hadir: { tile: 'bg-pastel-mint', value: 'text-pastel-mint-fg', label: 'text-[#1E5753]', cell: 'bg-pastel-mint text-pastel-mint-fg', legend: 'bg-[#8ED9D2]', badge: 'bg-pastel-mint text-pastel-mint-fg' },
    izin: { tile: 'bg-pastel-sun', value: 'text-pastel-sun-fg', label: 'text-[#6B4A00]', cell: 'bg-[#F7D36A] text-[#4D3300]', legend: 'bg-[#F7D36A]', badge: 'bg-pastel-sun text-[#6B4A00]' },
    sakit: { tile: 'bg-pastel-sky', value: 'text-pastel-sky-fg', label: 'text-[#1F4A8A]', cell: 'bg-[#8FBEF5] text-[#0F3166]', legend: 'bg-[#8FBEF5]', badge: 'bg-pastel-sky text-[#1F4A8A]' },
    alfa: { tile: 'bg-pastel-coral', value: 'text-pastel-coral-fg', label: 'text-[#7A2E29]', cell: 'bg-[#F2A49E] text-[#5C1A15]', legend: 'bg-[#F2A49E]', badge: 'bg-pastel-coral text-[#7A2E29]' },
}

const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function SectionMessage({ children }: { children: ReactNode }) {
    return <p className="rounded-[20px] bg-card p-4 text-sm text-subtle">{children}</p>
}

function MonthCalendar({ studentId }: { studentId: string }) {
    const [month, setMonth] = useState(() => {
        const today = new Date()
        return new Date(today.getFullYear(), today.getMonth(), 1)
    })
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const leadingBlanks = (new Date(year, monthIndex, 1).getDay() + 6) % 7
    const calendar = useApiData(() => academicService.getAttendanceCalendar(studentId, monthKey), [studentId, monthKey])
    // Hanya tanggal yang punya catatan dikirim backend; sisanya (akhir pekan, belum tercatat) tampil abu-abu.
    const statusByDate = new Map(calendar.data?.days.map((day) => [day.date, day.status]))
    const holidayByDate = new Map(calendar.data?.holidays.map((holiday) => [holiday.date, holiday.name]))

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
            <div aria-busy={calendar.status === 'loading'} className={cn('grid grid-cols-7 gap-1 text-center transition-opacity', calendar.status === 'loading' && 'opacity-50')}>
                {weekdayLabels.map((label) => (
                    <span key={label} className="py-1 text-xs font-extrabold text-subtle">{label}</span>
                ))}
                {Array.from({ length: leadingBlanks }, (_, index) => <span key={`blank-${index}`} />)}
                {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1
                    const key = `${monthKey}-${String(day).padStart(2, '0')}`
                    const status = statusByDate.get(key)
                    const holiday = holidayByDate.get(key)

                    return (
                        <span
                            key={day}
                            title={holiday}
                            aria-label={`${day} ${monthNames[monthIndex]}${status ? `, ${statusLabels[status]}` : holiday ? `, ${holiday}` : ''}`}
                            className={cn('flex h-[38px] items-center justify-center rounded-xl text-sm font-extrabold', status ? statusStyles[status].cell : holiday ? 'bg-muted text-[#849087]' : 'text-[#849087]')}>
                            {day}
                        </span>
                    )
                })}
            </div>
            {calendar.status === 'error' ? <p className="mt-2 text-center text-[13px] text-subtle">Kalender belum dapat dimuat.</p> : null}
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

function LeaveRequests({ studentId }: { studentId: string }) {
    const leaveRequests = useApiData(() => academicService.getLeaveRequests(studentId), [studentId])
    const requests = leaveRequests.data?.items ?? []
    const [pendingCancel, setPendingCancel] = useState<LeaveRequest | null>(null)

    async function cancelRequest() {
        if (!pendingCancel) {
            return
        }

        try {
            await academicService.cancelLeaveRequest(pendingCancel.id)
            leaveRequests.setData((current) => ({ ...current, items: current.items.filter((item) => item.id !== pendingCancel.id) }))
            toast.success('Pengajuan izin dibatalkan.')
        } catch (caughtError) {
            toast.error(caughtError instanceof Error ? caughtError.message : 'Pengajuan izin gagal dibatalkan.')
            // 409: status sudah berubah di sisi wali kelas, muat ulang agar kartu menampilkan status terbaru.
            leaveRequests.reload()
        }
    }

    return (
        <section aria-labelledby="izin-h" className="flex flex-col gap-2.5">
            <h2 id="izin-h" className="font-display text-[19px] font-semibold">Pengajuan Izin</h2>
            {leaveRequests.status === 'loading' ? (
                <Skeleton className="h-[92px] rounded-[20px]" />
            ) : leaveRequests.status === 'error' ? (
                <SectionMessage>Pengajuan izin belum dapat dimuat.</SectionMessage>
            ) : requests.length === 0 ? (
                <SectionMessage>Belum ada pengajuan izin.</SectionMessage>
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

// "Masuk 06.48 · Pulang 15.05" untuk hadir, selain itu keterangan dari sekolah.
function historyDetail(record: AttendanceRecord) {
    if (record.checkInAt || record.checkOutAt) {
        return [record.checkInAt ? `Masuk ${formatClock(record.checkInAt)}` : null, record.checkOutAt ? `Pulang ${formatClock(record.checkOutAt)}` : null].filter(Boolean).join(' · ')
    }

    return record.note ?? (record.attachment ? 'Lampiran tersedia' : statusLabels[record.status])
}

function AttendanceHistory({ studentId }: { studentId: string }) {
    const history = useApiData(() => academicService.getAttendanceHistory(studentId, { perPage: 3 }), [studentId])

    return (
        <section aria-labelledby="hist-h" className="flex flex-col gap-2.5">
            <h2 id="hist-h" className="font-display text-[19px] font-semibold">Riwayat Terbaru</h2>
            {history.status === 'loading' ? (
                <Skeleton className="h-[74px] rounded-[20px]" />
            ) : history.status === 'error' ? (
                <SectionMessage>Riwayat absensi belum dapat dimuat.</SectionMessage>
            ) : history.data?.items.length === 0 ? (
                <SectionMessage>Belum ada catatan absensi.</SectionMessage>
            ) : history.data?.items.map((item) => {
                const date = parseIsoDate(item.date)
                const styles = statusStyles[item.status]

                return (
                    <div key={item.id} className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
                        <span aria-hidden="true" className={cn('flex size-[46px] shrink-0 items-center justify-center rounded-[14px] font-display text-[17px] font-bold', styles.badge)}>
                            {date.getDate()}
                        </span>
                        <span className="flex min-w-0 flex-grow flex-col gap-0.5">
                            <span className="text-[15px] font-extrabold">{dayNames[date.getDay()]}, {date.getDate()} {monthNames[date.getMonth()].slice(0, 3)}</span>
                            <span className="truncate text-[13px] text-subtle">{historyDetail(item)}</span>
                        </span>
                        <span className={cn('rounded-full px-2.5 py-1.5 text-xs font-extrabold', styles.badge)}>{statusLabels[item.status]}</span>
                    </div>
                )
            })}
        </section>
    )
}

function TodayCard({ studentId, nickname }: { studentId: string, nickname: string }) {
    const attendance = useApiData(() => academicService.getAttendanceToday(studentId), [studentId])
    const today = attendance.data

    const headline = attendance.status === 'loading'
        ? 'Memuat absensi…'
        : attendance.status === 'error'
            ? 'Absensi hari ini belum dapat dimuat'
            : today?.status
                ? `${nickname} ${statusLabels[today.status].toLowerCase()} hari ini`
                : today && !today.isSchoolDay ? 'Hari ini bukan hari sekolah' : 'Belum ada catatan hari ini'

    return (
        <HeroCard tone="ink">
            <p className="text-[13px] font-bold text-[#C8D8CD]">{formatLongDate(today ? parseIsoDate(today.date) : new Date())}</p>
            <div className="mt-1.5 flex items-center gap-2.5">
                <p className="font-display text-[22px] font-semibold">{headline}</p>
                {today?.punctuality ? (
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold', today.punctuality === 'terlambat' ? 'bg-pastel-sun text-[#6B4A00]' : 'bg-pastel-mint text-pastel-mint-fg')}>
                        {today.punctuality === 'terlambat' ? 'Terlambat' : 'Tepat waktu'}
                    </span>
                ) : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-bold text-[#C8D8CD]">Jam Masuk</p>
                    <p className="mt-0.5 font-display text-xl font-semibold">{today?.checkInAt ? formatClock(today.checkInAt) : '--.--'}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs font-bold text-[#C8D8CD]">Jam Pulang</p>
                    <p className="mt-0.5 font-display text-xl font-semibold">{today?.checkOutAt ? formatClock(today.checkOutAt) : '--.--'}</p>
                </div>
            </div>
            <p className="mt-3 text-xs text-[#C8D8CD]">Kehadiran dicatat oleh guru di sekolah.</p>
        </HeroCard>
    )
}

function SemesterRecap({ studentId }: { studentId: string }) {
    const summary = useApiData(() => academicService.getAttendanceSummary(studentId), [studentId])

    return (
        <section aria-label="Rekap semester" aria-busy={summary.status === 'loading'} className="grid grid-cols-4 gap-2">
            {statusOrder.map((status) => (
                <div key={status} className={cn('rounded-[18px] px-1 py-3 text-center', statusStyles[status].tile)}>
                    <p className={cn('font-display text-[22px] font-bold', statusStyles[status].value)}>{summary.data ? summary.data[status] : '–'}</p>
                    <p className={cn('text-xs font-extrabold', statusStyles[status].label)}>{statusLabels[status]}</p>
                </div>
            ))}
        </section>
    )
}

export default function Absensi() {
    const { activeStudent } = useStudent()

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

            {activeStudent ? (
                // `key` mereset bulan kalender dan semua data saat anak aktif diganti.
                <div key={activeStudent.id} className="flex flex-col gap-[18px]">
                    <TodayCard studentId={activeStudent.id} nickname={activeStudent.nickname} />
                    <SemesterRecap studentId={activeStudent.id} />
                    <MonthCalendar studentId={activeStudent.id} />
                    <LeaveRequests studentId={activeStudent.id} />
                    <AttendanceHistory studentId={activeStudent.id} />
                </div>
            ) : (
                <Skeleton className="h-[200px] rounded-[28px]" />
            )}
        </div>
    )
}
