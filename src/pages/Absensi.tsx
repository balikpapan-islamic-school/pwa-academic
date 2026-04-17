import { useEffect, useMemo, useState } from 'react'
import { CalendarX2 } from 'lucide-react'
import { AttendanceList } from '@/components/absensi/attendance-list'
import { AttendanceSummaryCards } from '@/components/absensi/attendance-summary-cards'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { useStudent } from '@/contexts/StudentContext'
import { getAttendance, getAttendanceSummary } from '@/services/mock-api'
import { AttendanceItem, AttendanceSummary } from '@/types/academic'

export default function Absensi() {
    const { activeStudent } = useStudent()
    const [items, setItems] = useState<AttendanceItem[]>([])
    const [summary, setSummary] = useState<AttendanceSummary>({ hadir: 0, sakit: 0, izin: 0, alfa: 0 })
    const [period, setPeriod] = useState<'7' | '30'>('30')
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
            getAttendance(activeStudent.id),
            getAttendanceSummary(activeStudent.id),
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

    const visibleItems = useMemo(() => items.slice(0, period === '7' ? 3 : items.length), [items, period])

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Absensi</PageHeaderHeading>
                <PageHeaderDescription>Pantau kehadiran siswa melalui rekap ringkas dan riwayat terbaru.</PageHeaderDescription>
            </PageHeader>

            <AttendanceSummaryCards summary={summary} />

            <SectionHeading
                title="Riwayat Kehadiran"
                description="Filter sederhana untuk melihat catatan absensi terbaru."
                action={
                    <div className="flex gap-2">
                        <Button variant={period === '7' ? 'default' : 'outline'} onClick={() => setPeriod('7')}>7 hari</Button>
                        <Button variant={period === '30' ? 'default' : 'outline'} onClick={() => setPeriod('30')}>30 hari</Button>
                    </div>
                }
            />

            {visibleItems.length > 0 ? (
                <AttendanceList items={visibleItems} />
            ) : (
                <EmptyState title="Belum ada data absensi" description="Riwayat absensi akan muncul setelah data tersedia dari sistem utama." icon={CalendarX2} />
            )}
        </div>
    )
}
