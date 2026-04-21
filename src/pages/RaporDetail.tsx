import { ArrowLeft, FileSearch } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockReportDetailsByReportId } from '@/lib/mock-data'

export default function RaporDetail() {
    const { reportId } = useParams()
    const detail = reportId ? mockReportDetailsByReportId[reportId] : undefined

    if (!detail) {
        return (
            <div className="space-y-6">
                <PageHeader>
                    <Button variant="ghost" asChild className="mb-2 w-fit px-0 text-muted-foreground hover:bg-transparent">
                        <Link to="/rapor">
                            <ArrowLeft className="size-4" />
                            Kembali ke daftar rapor
                        </Link>
                    </Button>
                    <PageHeaderHeading>Detail Rapor</PageHeaderHeading>
                    <PageHeaderDescription>Rapor yang kamu pilih tidak ditemukan pada data dummy saat ini.</PageHeaderDescription>
                </PageHeader>

                <EmptyState title="Detail rapor tidak ditemukan" description="Pilih kembali semester rapor dari halaman daftar untuk membuka detail yang tersedia." icon={FileSearch} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <Button variant="ghost" asChild className="mb-2 w-fit px-0 text-muted-foreground hover:bg-transparent">
                    <Link to="/rapor">
                        <ArrowLeft className="size-4" />
                        Kembali ke daftar rapor
                    </Link>
                </Button>
                <PageHeaderHeading>Detail Rapor</PageHeaderHeading>
                <PageHeaderDescription>Lihat ringkasan hasil belajar, capaian mata pelajaran, dan catatan akademik untuk semester yang dipilih.</PageHeaderDescription>
            </PageHeader>

            <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-lg">
                <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:p-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge label={detail.status} tone={detail.status === 'Final' ? 'success' : 'warning'} />
                            <span className="text-xs text-slate-300">Semester {detail.semester}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Ringkasan Hasil Belajar</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
                                Detail rapor ini membantu orang tua dan siswa melihat capaian akademik semester beserta catatan penting dari sekolah.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Rata-rata</p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight">{detail.average}</p>
                            <p className="mt-1 text-xs text-slate-300">nilai semester berjalan</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Jumlah Mata Pelajaran</p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight">{detail.subjects.length}</p>
                            <p className="mt-1 text-xs text-slate-300">tercantum di rapor ini</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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

                    {detail.documentUrl ? <Button variant="outline" className="w-full sm:w-auto">Unduh Rapor</Button> : null}
                </CardContent>
            </Card>
        </div>
    )
}
