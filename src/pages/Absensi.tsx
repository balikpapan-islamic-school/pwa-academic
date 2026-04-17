import { useEffect, useMemo, useState } from 'react'
import { CalendarX2, CheckCircle2, CircleSlash2, FileClock, HeartPulse } from 'lucide-react'
import { AttendanceList } from '@/components/absensi/attendance-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
import { AttendanceItem, AttendanceSummary } from '@/types/academic'

type StatusFilter = 'Semua' | AttendanceItem['status']

export default function Absensi() {
    const { activeStudent } = useStudent()
    const [items, setItems] = useState<AttendanceItem[]>([])
    const [summary, setSummary] = useState<AttendanceSummary>({ hadir: 0, sakit: 0, izin: 0, alfa: 0 })
    const [period, setPeriod] = useState<'7' | '30'>('30')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setItems([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        Promise.all([
            academicService.getAttendance(activeStudent.id),
            academicService.getAttendanceSummary(activeStudent.id),
        ]).then(([attendance, attendanceSummary]) => {
            if (!cancelled) {
                setItems(attendance)
                setSummary(attendanceSummary)
                setIsLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    const attendanceRate = Math.round((summary.hadir / Math.max(summary.hadir + summary.sakit + summary.izin + summary.alfa, 1)) * 100)

    const summaryCards = [
        { title: 'Hadir', value: summary.hadir, helper: 'kehadiran aktif', icon: CheckCircle2, tone: 'success' as const },
        { title: 'Sakit', value: summary.sakit, helper: 'izin kesehatan', icon: HeartPulse, tone: 'warning' as const },
        { title: 'Izin', value: summary.izin, helper: 'dengan keterangan', icon: FileClock, tone: 'info' as const },
        { title: 'Alfa', value: summary.alfa, helper: 'tanpa keterangan', icon: CircleSlash2, tone: 'danger' as const },
    ]

    const visibleItems = useMemo(() => {
        const byPeriod = items.slice(0, period === '7' ? 4 : items.length)

        if (statusFilter === 'Semua') {
            return byPeriod
        }

        return byPeriod.filter((item) => item.status === statusFilter)
    }, [items, period, statusFilter])

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Absensi</PageHeaderHeading>
                <PageHeaderDescription>Pantau kehadiran siswa melalui ringkasan yang jelas dan riwayat absensi yang mudah dipindai.</PageHeaderDescription>
            </PageHeader>

            <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-lg">
                <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-slate-300">Ringkasan Kehadiran</p>
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight">{activeStudent?.name}</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                Absensi membantu wali siswa dan siswa melihat konsistensi kehadiran, izin, sakit, dan alfa dalam periode berjalan.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Persentase hadir</p>
                            <p className="mt-3 text-2xl font-semibold">{attendanceRate}%</p>
                            <p className="mt-1 text-xs text-slate-400">dari rekap semester</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Periode aktif</p>
                            <p className="mt-3 text-2xl font-semibold">{period === '7' ? '7 Hari' : '30 Hari'}</p>
                            <p className="mt-1 text-xs text-slate-400">filter ringkasan</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Filter status</p>
                            <p className="mt-3 text-2xl font-semibold">{statusFilter}</p>
                            <p className="mt-1 text-xs text-slate-400">kondisi absensi</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item) => (
                    <Card key={item.title}>
                        <CardContent className="py-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">{item.title}</p>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                                </div>
                                <div className="rounded-2xl bg-muted/70 p-3">
                                    <item.icon className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <section className="space-y-4">
                <SectionHeading title="Filter Absensi" description="Gunakan periode dan status untuk mempersempit riwayat yang ingin dilihat." />

                <Card>
                    <CardContent className="flex flex-col gap-4 py-5">
                        <div className="flex flex-wrap gap-2">
                            <Button variant={period === '7' ? 'default' : 'outline'} onClick={() => setPeriod('7')}>7 hari</Button>
                            <Button variant={period === '30' ? 'default' : 'outline'} onClick={() => setPeriod('30')}>30 hari</Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(['Semua', 'Hadir', 'Sakit', 'Izin', 'Alfa'] as StatusFilter[]).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${statusFilter === item ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/30 hover:bg-muted/40'}`}
                                    onClick={() => setStatusFilter(item)}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <SectionHeading
                    title="Riwayat Kehadiran"
                    description={`Menampilkan ${visibleItems.length} catatan absensi untuk filter ${statusFilter.toLowerCase()} pada periode ${period === '7' ? '7 hari' : '30 hari'}.`}
                    action={<StatusBadge label={statusFilter} tone={statusFilter === 'Semua' ? 'neutral' : statusFilter === 'Hadir' ? 'success' : statusFilter === 'Alfa' ? 'danger' : 'warning'} />}
                />

                {visibleItems.length > 0 ? (
                    <AttendanceList items={visibleItems} />
                ) : (
                    <EmptyState title="Belum ada data absensi" description="Tidak ada data absensi yang sesuai dengan periode dan status yang dipilih." icon={CalendarX2} />
                )}
            </section>
        </div>
    )
}
