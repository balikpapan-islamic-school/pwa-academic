import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { ScheduleList } from '@/components/jadwal/schedule-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { useStudent } from '@/contexts/StudentContext'
import { getSchedule } from '@/services/mock-api'
import { ScheduleItem } from '@/types/academic'

export default function Jadwal() {
    const { activeStudent } = useStudent()
    const [items, setItems] = useState<ScheduleItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeDay, setActiveDay] = useState('Senin')

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

    const days = useMemo(() => Array.from(new Set(items.map((item) => item.day))), [items])
    const visibleItems = items.filter((item) => item.day === activeDay)

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Jadwal</PageHeaderHeading>
                <PageHeaderDescription>Jadwal pelajaran siswa aktif dengan tampilan yang nyaman untuk perangkat mobile.</PageHeaderDescription>
            </PageHeader>

            <SectionHeading title="Pilih Hari" description="Gunakan tab hari untuk melihat detail jadwal per hari." />

            <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => (
                    <Button key={day} variant={day === activeDay ? 'default' : 'outline'} onClick={() => setActiveDay(day)}>
                        {day}
                    </Button>
                ))}
            </div>

            {visibleItems.length > 0 ? (
                <ScheduleList items={visibleItems} />
            ) : (
                <EmptyState title="Belum ada jadwal" description="Belum ada jadwal pelajaran untuk hari yang dipilih." icon={CalendarDays} />
            )}
        </div>
    )
}
