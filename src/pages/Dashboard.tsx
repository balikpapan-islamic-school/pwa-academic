import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight, BookOpen, CreditCard, FileBadge2, Newspaper, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, PageHeaderHeading } from '@/components/page-header'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
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

        academicService.getDashboard(activeStudent.id).then((result) => {
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

    const shortcuts = [
        {
            label: 'Profil',
            href: '/profil',
            icon: UserRound,
            iconClassName: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
            cardClassName: 'border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-100/80 hover:border-sky-300/90 hover:from-sky-100 hover:to-sky-200/80 dark:border-sky-500/20 dark:from-sky-500/10 dark:via-background dark:to-sky-500/5',
            glowClassName: 'from-sky-400/30 via-sky-300/10 to-transparent',
        },
        {
            label: 'Pembayaran',
            href: '/pembayaran',
            icon: CreditCard,
            iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
            cardClassName: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/80 hover:border-emerald-300/90 hover:from-emerald-100 hover:to-emerald-200/80 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:via-background dark:to-emerald-500/5',
            glowClassName: 'from-emerald-400/30 via-emerald-300/10 to-transparent',
        },
        {
            label: 'KBM',
            href: '/jadwal',
            icon: BookOpen,
            iconClassName: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
            cardClassName: 'border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-violet-100/80 hover:border-violet-300/90 hover:from-violet-100 hover:to-violet-200/80 dark:border-violet-500/20 dark:from-violet-500/10 dark:via-background dark:to-violet-500/5',
            glowClassName: 'from-violet-400/30 via-violet-300/10 to-transparent',
        },
        {
            label: 'Rapor',
            href: '/rapor',
            icon: FileBadge2,
            iconClassName: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
            cardClassName: 'border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-100/80 hover:border-amber-300/90 hover:from-amber-100 hover:to-amber-200/80 dark:border-amber-500/20 dark:from-amber-500/10 dark:via-background dark:to-amber-500/5',
            glowClassName: 'from-amber-400/30 via-amber-300/10 to-transparent',
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Beranda</PageHeaderHeading>
            </PageHeader>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 text-white shadow-lg">
                <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-sky-50/90">Assalamu'alaikum</p>
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight lg:text-4xl">{data.student.name}</h2>
                            <p className="mt-2 text-sm text-sky-50/90 lg:text-base">{data.student.unit} · Kelas {data.student.className} · Semester {data.student.semesterLabel}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:max-w-xl">
                            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wide text-sky-50/80">Wali Kelas</p>
                                <p className="mt-2 text-base font-semibold">{data.student.homeroomTeacher}</p>
                            </div>
                            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wide text-sky-50/80">Rapor Terakhir</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="text-base font-semibold">{data.latestReport.average}</p>
                                    <StatusBadge label={data.latestReport.status} tone={data.latestReport.status === 'Final' ? 'success' : 'warning'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-4">
                <SectionHeading title="Menu Utama" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {shortcuts.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`group relative overflow-hidden rounded-[1.75rem] border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:p-4.5 ${item.cardClassName}`}>
                            <div className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br blur-2xl transition-opacity group-hover:opacity-100 ${item.glowClassName}`} />
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/40 to-transparent opacity-80 transition-opacity dark:from-white/5" />
                            <div className="relative flex min-h-26 flex-col justify-between gap-4 md:min-h-28">
                                <div className="flex items-start justify-between gap-3">
                                    <div className={`rounded-[1.25rem] p-3 shadow-sm transition-transform duration-200 group-hover:scale-105 ${item.iconClassName}`}>
                                        <item.icon className="size-5 md:size-6" />
                                    </div>
                                    <div className="rounded-full border border-black/5 bg-white/80 p-2 text-muted-foreground opacity-70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:border-white/10 dark:bg-background/70">
                                        <ArrowUpRight className="size-4" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="block text-[15px] font-semibold tracking-tight md:text-base">{item.label}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {data.schoolAlert ? (
                <section className="space-y-4">
                    <SectionHeading title="Notifikasi Sekolah" />
                    <Alert className={`overflow-hidden shadow-sm bg-emerald-600 text-white`}>
                        <div className="flex flex-col gap-2 pr-0 md:pr-40">
                            <AlertTitle>{data.schoolAlert.title}</AlertTitle>
                            <AlertDescription className='text-white'>{data.schoolAlert.message}</AlertDescription>
                        </div>
                        {data.schoolAlert.actionHref && data.schoolAlert.actionLabel ? (
                            <AlertAction>
                                <Button variant={'ghost'} asChild>
                                    <Link to={data.schoolAlert.actionHref}>
                                        <label >Buka</label>
                                        <ArrowRight className="size-5" />
                                    </Link>
                                </Button>
                            </AlertAction>
                        ) : null}
                    </Alert>
                </section>
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="space-y-4">
                    <SectionHeading title="Agenda Sekolah / Yayasan" />
                    <div className="space-y-3">
                        {data.agendas.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex items-start justify-between gap-4 py-0">
                                    <div className="flex items-start gap-4">
                                        <div>
                                            <h3 className="font-semibold">{item.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{item.date} - {item.scope}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="mt-1 size-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <SectionHeading
                        title="Berita Terbaru"
                        action={<Button variant="ghost" asChild><Link to="/notifikasi">Lihat Semua</Link></Button>}
                    />
                    <div className="space-y-3">
                        {data.news.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex items-start gap-4 py-5">
                                    <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                                        <Newspaper className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge label={item.category} tone="info" />
                                            <span className="text-xs text-muted-foreground">{item.date}</span>
                                        </div>
                                        <h3 className="mt-3 text-base font-semibold leading-snug">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
