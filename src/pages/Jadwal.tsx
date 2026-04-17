import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { ScheduleList } from '@/components/jadwal/schedule-list'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { getSchedule } from '@/services/mock-api'
import { ScheduleItem } from '@/types/academic'

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function formatReadableDate(date: Date) {
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function startOfWeek(date: Date) {
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() - date.getDay())
    return nextDate
}

function buildWeekDates(date: Date) {
    const weekStart = startOfWeek(date)

    return Array.from({ length: 7 }, (_, index) => {
        const nextDate = new Date(weekStart)
        nextDate.setDate(weekStart.getDate() + index)
        return nextDate
    })
}

export default function Jadwal() {
    const { activeStudent } = useStudent()
    const [items, setItems] = useState<ScheduleItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const weekStripRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setItems([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        getSchedule(activeStudent.id).then((result) => {
            if (!cancelled) {
                setItems(result)
                setIsLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    const selectedDay = dayNames[selectedDate.getDay()]
    const visibleItems = items.filter((item) => item.day === selectedDay)
    const weekDates = useMemo(() => buildWeekDates(selectedDate), [selectedDate])

    const totalMinutes = visibleItems.reduce((sum, item) => {
        const [startHour, startMinute] = item.startTime.split(':').map(Number)
        const [endHour, endMinute] = item.endTime.split(':').map(Number)
        return sum + ((endHour * 60 + endMinute) - (startHour * 60 + startMinute))
    }, 0)

    useEffect(() => {
        const activeButton = weekStripRef.current?.querySelector<HTMLButtonElement>('[data-active="true"]')

        if (!activeButton) {
            return
        }

        activeButton.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        })
    }, [selectedDate])

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <section className="space-y-4">
                <SectionHeading title="Kalender KBM Mingguan" description="Pilih hari pada minggu ini untuk melihat urutan sesi belajar di bawah." />

                <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-lg">
                    <CardContent className="space-y-5 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-300">Minggu aktif</p>
                                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
                            </div>
                            <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-300">Hari dipilih</p>
                                <p className="mt-1 text-sm font-semibold">{selectedDay}</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-slate-950 to-transparent md:hidden" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-slate-950 to-transparent md:hidden" />

                            <div ref={weekStripRef} className="flex gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-7 md:overflow-visible md:px-0 md:pb-0">
                                <div className="w-2 shrink-0 md:hidden" />
                            {weekDates.map((date) => {
                                const isActive = date.toDateString() === selectedDate.toDateString()
                                const dayLabel = dayNames[date.getDay()]
                                const scheduleCount = items.filter((item) => item.day === dayLabel).length
                                const isToday = date.toDateString() === new Date().toDateString()

                                return (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        data-active={isActive}
                                        className={`min-w-24 shrink-0 rounded-[1.35rem] border px-2 py-4 text-center transition md:min-w-0 ${isActive ? 'border-white bg-white text-slate-900 shadow-sm' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'} ${date.getDay() === 0 ? 'opacity-50' : ''}`}
                                        onClick={() => setSelectedDate(date)}>
                                        <div className="flex flex-col items-center gap-2">
                                            <p className={`text-[11px] font-medium uppercase tracking-wide ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {dayLabel.slice(0, 3)}
                                            </p>
                                            <div className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${isActive ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}>
                                                {date.getDate()}
                                            </div>
                                            <p className={`text-[11px] ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {scheduleCount > 0 ? `${scheduleCount} sesi` : 'Kosong'}
                                            </p>
                                            {isToday ? <StatusBadge label="Hari ini" tone={isActive ? 'neutral' : 'info'} /> : null}
                                        </div>
                                    </button>
                                )
                            })}
                                <div className="w-2 shrink-0 md:hidden" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <SectionHeading title={`Timeline ${selectedDay}`} description={`Detail sesi KBM untuk ${formatReadableDate(selectedDate)}.`} />

                <Card>
                    <CardContent className="grid gap-4 py-5 md:grid-cols-3">
                        <div className="rounded-2xl bg-muted/60 p-4">
                            <p className="text-sm text-muted-foreground">Tanggal</p>
                            <p className="mt-2 font-semibold">{formatReadableDate(selectedDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-muted/60 p-4">
                            <p className="text-sm text-muted-foreground">Jumlah sesi</p>
                            <p className="mt-2 font-semibold">{visibleItems.length} sesi</p>
                        </div>
                        <div className="rounded-2xl bg-muted/60 p-4">
                            <p className="text-sm text-muted-foreground">Estimasi durasi</p>
                            <p className="mt-2 font-semibold">{totalMinutes} menit</p>
                        </div>
                    </CardContent>
                </Card>

                {visibleItems.length > 0 ? (
                    <ScheduleList items={visibleItems} />
                ) : (
                    <EmptyState title="Belum ada sesi KBM" description="Tidak ada jadwal pelajaran pada hari yang dipilih dalam minggu ini." icon={CalendarDays} />
                )}
            </section>
        </div>
    )
}
