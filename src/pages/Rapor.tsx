import { useEffect, useMemo, useState } from 'react'
import { FileSearch } from 'lucide-react'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { ReportList } from '@/components/rapor/report-list'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
import { ReportDetail, ReportSummary } from '@/types/academic'

export default function Rapor() {
    const { activeStudent } = useStudent()
    const [summaries, setSummaries] = useState<ReportSummary[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [detail, setDetail] = useState<ReportDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setSummaries([])
            setDetail(null)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        academicService.getReportSummaries(activeStudent.id).then((result) => {
            if (cancelled) {
                return
            }

            setSummaries(result)
            const nextId = result[0]?.id ?? null
            setSelectedId(nextId)

            if (!nextId) {
                setDetail(null)
                setIsLoading(false)
                return
            }

            academicService.getReportDetail(nextId).then((reportDetail) => {
                if (!cancelled) {
                    setDetail(reportDetail)
                    setIsLoading(false)
                }
            })
        })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    useEffect(() => {
        let cancelled = false

        if (!selectedId) {
            return
        }

        academicService.getReportDetail(selectedId).then((result) => {
            if (!cancelled) {
                setDetail(result)
            }
        })

        return () => {
            cancelled = true
        }
    }, [selectedId])

    const selectedSummary = useMemo(() => summaries.find((item) => item.id === selectedId) ?? null, [summaries, selectedId])

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
                <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
                    <div className="space-y-4 xl:sticky xl:top-28">
                        <SectionHeading title="Daftar Rapor" description="Pilih semester untuk melihat ringkasan dan detail rapor." />
                        <ReportList items={summaries} onSelect={setSelectedId} />
                    </div>

                    {detail && selectedSummary ? (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <CardTitle>{detail.semester}</CardTitle>
                                        <CardDescription>Rata-rata nilai {detail.average}</CardDescription>
                                    </div>
                                    <StatusBadge label={detail.status} tone={detail.status === 'Final' ? 'success' : 'warning'} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {detail.subjects.map((subject) => (
                                        <div key={subject.id} className="rounded-2xl bg-muted/60 p-4">
                                            <p className="font-semibold">{subject.subject}</p>
                                            <p className="mt-2 text-sm text-muted-foreground">Pengetahuan {subject.knowledgeScore} · Keterampilan {subject.skillScore}</p>
                                            <p className="mt-3 text-sm text-muted-foreground">{subject.note}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid gap-4 xl:grid-cols-2">
                                    <div className="rounded-2xl border bg-card p-5">
                                        <h3 className="font-semibold">Catatan Wali Kelas</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{detail.homeroomNote}</p>
                                    </div>
                                    <div className="rounded-2xl border bg-card p-5">
                                        <h3 className="font-semibold">Catatan Kepala Sekolah</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{detail.principalNote ?? 'Belum ada catatan tambahan.'}</p>
                                    </div>
                                </div>

                                {detail.documentUrl ? <Button variant="outline">Unduh Rapor</Button> : null}
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            ) : (
                <EmptyState title="Belum ada rapor" description="Rapor akan muncul ketika sudah dipublikasikan dari sistem akademik utama." icon={FileSearch} />
            )}
        </div>
    )
}
