import { useEffect, useState } from 'react'
import { FileSearch } from 'lucide-react'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { ReportList } from '@/components/rapor/report-list'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
import { ReportSummary } from '@/types/academic'

export default function Rapor() {
    const { activeStudent } = useStudent()
    const [summaries, setSummaries] = useState<ReportSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setSummaries([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        academicService.getReportSummaries(activeStudent.id).then((result) => {
            if (!cancelled) {
                setSummaries(result)
                setIsLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Rapor</PageHeaderHeading>
                <PageHeaderDescription>Akses hasil belajar semester siswa beserta catatan akademik penting.</PageHeaderDescription>
            </PageHeader>

            {summaries.length > 0 ? (
                <div className="space-y-4">
                    <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg">
                        <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:p-8">
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-xs font-medium text-amber-50/90 sm:text-sm">Arsip Hasil Belajar</p>
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Daftar rapor per semester</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-50/90 lg:text-base">
                                        Pilih semester untuk membuka halaman detail rapor, melihat capaian setiap mata pelajaran, dan membaca catatan akademik dari sekolah.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-amber-50/80">Jumlah Rapor</p>
                                    <p className="mt-3 text-3xl font-semibold tracking-tight">{summaries.length}</p>
                                    <p className="mt-1 text-xs text-amber-50/80">semester tersedia</p>
                                </div>
                                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                                    <p className="text-xs uppercase tracking-wide text-amber-50/80">Rapor Terbaru</p>
                                    <p className="mt-3 text-lg font-semibold tracking-tight">{summaries[0]?.semester ?? '-'}</p>
                                    <p className="mt-1 text-xs text-amber-50/80">siap dibuka lebih detail</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <SectionHeading title="Daftar Rapor" description="Pilih semester untuk melihat ringkasan dan detail rapor." />
                        <ReportList items={summaries} />
                    </div>
                </div>
            ) : (
                <EmptyState title="Belum ada rapor" description="Rapor akan muncul ketika sudah dipublikasikan dari sistem akademik utama." icon={FileSearch} />
            )}
        </div>
    )
}
