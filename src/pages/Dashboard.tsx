import { useEffect, useState } from 'react'
import { BookOpenCheck, ClipboardCheck, FileBadge2, GraduationCap } from 'lucide-react'
import { DashboardSummaryCard } from '@/components/dashboard/dashboard-summary-card'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { ScheduleList } from '@/components/jadwal/schedule-list'
import { GradeList } from '@/components/nilai/grade-list'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { StudentProfileCard } from '@/components/profil/student-profile-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { getDashboard } from '@/services/mock-api'
import { DashboardData } from '@/types/academic'

export default function Dashboard() {
    const { activeStudent } = useStudent()
    const [data, setData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setData(null)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        getDashboard(activeStudent.id).then((result) => {
            if (!cancelled) {
                setData(result)
                setIsLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    if (isLoading || !data) {
        return <PageSkeleton />
    }

    const latestReport = data.latestReport

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Beranda</PageHeaderHeading>
                <PageHeaderDescription>Ringkasan cepat aktivitas belajar, kehadiran, nilai, dan rapor siswa aktif.</PageHeaderDescription>
            </PageHeader>

            <StudentProfileCard student={data.student} />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardSummaryCard title="Jadwal Hari Ini" description="Sesi belajar aktif" value={`${data.todaySchedule.length} sesi`} helper={data.todaySchedule[0] ? `${data.todaySchedule[0].subject} mulai ${data.todaySchedule[0].startTime}` : 'Belum ada jadwal'} icon={BookOpenCheck} />
                <DashboardSummaryCard title="Kehadiran" description="Rekap semester berjalan" value={`${data.attendanceSummary.hadir} hadir`} helper={`${data.attendanceSummary.sakit} sakit · ${data.attendanceSummary.izin} izin · ${data.attendanceSummary.alfa} alfa`} icon={ClipboardCheck} />
                <DashboardSummaryCard title="Rata-rata Nilai" description="Dari mata pelajaran utama" value={`${Math.round(data.gradeHighlights.reduce((sum, item) => sum + item.score, 0) / data.gradeHighlights.length)}`} helper={`${data.gradeHighlights[0]?.subject ?? 'Belum ada data'} menjadi nilai sorotan`} icon={GraduationCap} />
                <DashboardSummaryCard title="Status Rapor" description={latestReport.semester} value={latestReport.status} helper={`Rata-rata ${latestReport.average}${latestReport.publishedAt ? ` · ${latestReport.publishedAt}` : ''}`} icon={FileBadge2} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <SectionHeading title="Jadwal Hari Ini" description="Pelajaran yang akan diikuti siswa pada hari aktif." />
                    <ScheduleList items={data.todaySchedule} />
                </div>
                <div className="space-y-4">
                    <SectionHeading title="Sorotan Nilai" description="Ringkasan cepat dari performa akademik terbaru." />
                    <GradeList items={data.gradeHighlights.slice(0, 2)} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Absensi Terbaru</CardTitle>
                    <CardDescription>Pantauan cepat kehadiran terbaru dari sistem akademik utama.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.latestAttendance.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">{item.date}</p>
                                <p className="text-sm text-muted-foreground">{item.subject ?? item.note ?? 'Tercatat'}</p>
                            </div>
                            <p className="text-sm font-semibold">{item.status}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </>
    )
}
