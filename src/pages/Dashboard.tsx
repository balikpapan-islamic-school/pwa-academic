import { ReactNode, useState } from 'react'
import { AlertTriangle, ArrowRight, Bell, BookOpen, CalendarCheck, Clock3, Link2, Wallet } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { BisLogo } from '@/components/bis-logo'
import { features, spmb } from '@/config/app'
import { ChildSwitcher } from '@/components/dashboard/child-switcher'
import { SchoolNews } from '@/components/dashboard/school-news'
import { ChildRequestCard } from '@/components/hubungkan/child-request-card'
import { CompactTopBar } from '@/components/kit/compact-top-bar'
import { useAuth } from '@/contexts/AuthContext'
import { dummyBills, dummyChildren, dummyChildRequests, dummyCurrentLesson, dummyGradeEntries, dummyNextLessons, dummyStudent, dummyTodayLessonCount, isNewGrade } from '@/lib/dummy-ui'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

function NotificationButton({ unread }: { unread: number }) {
    return (
        <Link
            to="/notifikasi"
            aria-label={unread > 0 ? `Notifikasi, ${unread} baru` : 'Notifikasi'}
            className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-card shadow-chip">
            <Bell className="size-[22px]" />
            {unread > 0 ? (
                <span aria-hidden="true" className="absolute right-3 top-[11px] size-[9px] rounded-full border-2 border-white bg-[#E5484D]" />
            ) : null}
        </Link>
    )
}

function CompactNotificationLink({ unread }: { unread: number }) {
    return (
        <Link to="/notifikasi" aria-label={unread > 0 ? `Notifikasi, ${unread} baru` : 'Notifikasi'} className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.18]">
            <Bell className="size-5" />
            {unread > 0 ? <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full border border-white bg-[#E5484D]" /> : null}
        </Link>
    )
}

function ModuleCard({ to, label, meta, icon, className, iconClassName, metaClassName }: { to: string, label: string, meta: string, icon: ReactNode, className: string, iconClassName: string, metaClassName: string }) {
    return (
        <Link to={to} className={cn('flex min-h-[140px] flex-col rounded-3xl p-4 text-ink', className)}>
            <span aria-hidden="true" className={cn('flex size-[46px] items-center justify-center rounded-[14px] bg-card', iconClassName)}>{icon}</span>
            <span className="mt-auto pt-3 font-display text-lg font-semibold">{label}</span>
            <span className={cn('flex items-center justify-between text-[13px]', metaClassName)}>
                {meta}
                <ArrowRight className="size-[18px]" strokeWidth={2.4} />
            </span>
        </Link>
    )
}

const ACTIVE_CHILD_KEY = 'pwa-academic-active-child'

function readActiveChildId() {
    try {
        const stored = window.localStorage.getItem(ACTIVE_CHILD_KEY)
        return dummyChildren.some((child) => child.id === stored) ? stored! : dummyChildren[0].id
    } catch {
        return dummyChildren[0].id
    }
}

function StudentDashboard() {
    const [activeChildId, setActiveChildId] = useState(readActiveChildId)
    const child = dummyChildren.find((item) => item.id === activeChildId) ?? dummyChildren[0]
    const hasManyChildren = dummyChildren.length > 1

    function selectChild(id: string) {
        setActiveChildId(id)
        try {
            window.localStorage.setItem(ACTIVE_CHILD_KEY, id)
        } catch {
            // Pilihan anak cukup bertahan selama sesi bila storage diblokir.
        }
    }

    const newGradeCount = dummyGradeEntries.filter((entry) => isNewGrade(entry)).length
    const nearestBill = dummyBills[0]

    return (
        <>
            <header className="flex items-center gap-3">
                <div aria-hidden="true" className={cn('flex size-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-white font-display text-[19px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.10)]', child.avatarClassName)}>
                    {child.initials}
                </div>
                <div className="min-w-0 flex-grow">
                    <h1 className="truncate font-display text-[23px] font-bold">Halo, {child.nickname}!</h1>
                    <p className="mt-0.5 truncate text-sm text-subtle">Kelas {child.className} · Semester {child.semester}</p>
                </div>
                {hasManyChildren
                    ? <ChildSwitcher items={dummyChildren} activeId={child.id} onSelect={selectChild} />
                    : <NotificationButton unread={3} />}
            </header>
            <CompactTopBar
                title={`Halo, ${child.nickname}!`}
                leading={<span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white font-display text-sm font-bold', child.avatarClassName)}>{child.initials}</span>}
                action={hasManyChildren
                    ? <ChildSwitcher items={dummyChildren} activeId={child.id} onSelect={selectChild} variant="compact" />
                    : <CompactNotificationLink unread={3} />}
            />

            <section aria-label="Menu utama" className="grid grid-cols-2 gap-3.5">
                <ModuleCard to="/akademik" label="Nilai" meta={newGradeCount > 0 ? `${newGradeCount} nilai baru` : 'Lihat nilai'} icon={<BookOpen className="size-6" />} className="bg-pastel-violet" iconClassName="text-pastel-violet-fg" metaClassName="text-[#44544A]" />
                <ModuleCard to="/absensi" label="Absensi" meta={`Kehadiran ${dummyStudent.attendanceRate}%`} icon={<CalendarCheck className="size-6" />} className="bg-pastel-sky" iconClassName="text-pastel-sky-fg" metaClassName="text-[#1F4A8A]" />
                {features.payments ? <ModuleCard to="/pembayaran" label="Pembayaran" meta={`${dummyBills.length} tagihan`} icon={<Wallet className="size-6" />} className="bg-pastel-coral" iconClassName="text-[#C2413A]" metaClassName="text-[#7A2E29]" /> : null}
                <ModuleCard to="/akademik?tab=kelas" label="Jadwal" meta={`${dummyTodayLessonCount} mapel hari ini`} icon={<Clock3 className="size-6" />} className={cn('bg-pastel-sun', !features.payments && 'col-span-2 min-h-[120px]')} iconClassName="text-[#9A6400]" metaClassName="text-[#6B4A00]" />
            </section>

            <section aria-labelledby="jadwal-h" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 id="jadwal-h" className="font-display text-xl font-semibold">Jadwal Hari Ini</h2>
                    <Link to="/akademik?tab=kelas" className="flex min-h-11 items-center text-sm font-bold text-subtle">Lihat semua</Link>
                </div>
                <Link to="/akademik?tab=kelas" className="flex items-center gap-3.5 rounded-3xl bg-card p-3.5 shadow-soft">
                    <span aria-hidden="true" className="flex size-[72px] shrink-0 items-center justify-center rounded-[18px] bg-pastel-violet font-display text-2xl font-bold text-pastel-violet-fg">
                        {dummyCurrentLesson.symbol}
                    </span>
                    <span className="flex min-w-0 flex-grow flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F7A73]">
                            <span aria-hidden="true" className="size-2 rounded-full bg-[#0F7A73]" />
                            Sedang berlangsung
                        </span>
                        <span className="text-base font-extrabold">{dummyCurrentLesson.subject}</span>
                        <span className="text-[13px] text-subtle">{dummyCurrentLesson.time} · {dummyCurrentLesson.room}</span>
                        <span aria-hidden="true" className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                            <span className="block h-full rounded-full bg-[#45BFB4]" style={{ width: `${dummyCurrentLesson.progress}%` }} />
                        </span>
                    </span>
                </Link>
                <div className="rounded-3xl bg-card px-3.5 py-1.5 shadow-soft">
                    {dummyNextLessons.map((lesson) => (
                        <div key={lesson.time} className="flex items-center gap-3 py-2.5">
                            <span className="w-16 text-[13px] font-extrabold text-subtle">{lesson.time}</span>
                            <span className="flex-grow text-[15px] font-bold">{lesson.subject}</span>
                            <span className="text-[13px] text-subtle">{lesson.room}</span>
                        </div>
                    ))}
                </div>
            </section>

            {features.payments ? (
                <Link to="/pembayaran" className="flex items-center gap-3.5 rounded-3xl bg-ink p-4 text-white">
                    <span aria-hidden="true" className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-pastel-sun text-[#9A6400]">
                        <AlertTriangle className="size-[22px]" />
                    </span>
                    <span className="flex flex-grow flex-col gap-0.5">
                        <span className="text-[15px] font-extrabold">SPP November jatuh tempo</span>
                        <span className="text-[13px] text-[#C8D8CD]">{nearestBill.due} · {formatCurrency(nearestBill.amount)}</span>
                    </span>
                    <span className="text-sm font-extrabold text-pastel-sun">Bayar</span>
                </Link>
            ) : null}

            <SchoolNews />
        </>
    )
}

function EmptyDashboard() {
    const { user } = useAuth()
    const openRequests = dummyChildRequests.filter((request) => request.status !== 'APPROVED')

    return (
        <>
            <header className="flex items-center gap-3">
                <BisLogo className="h-12" />
                <div className="min-w-0 flex-grow">
                    <h1 className="font-display text-[22px] font-bold">Assalamu’alaikum!</h1>
                    <p className="mt-0.5 truncate text-sm text-subtle">{user?.email ?? 'akun@gmail.com'}</p>
                </div>
                <NotificationButton unread={0} />
            </header>
            <CompactTopBar title="Assalamu’alaikum!" action={<CompactNotificationLink unread={0} />} />

            {spmb.registrationUrl ? (
                <a href={spmb.registrationUrl} target="_blank" rel="noreferrer" aria-labelledby="spmb-h" className="relative flex w-full items-center gap-3 overflow-hidden rounded-3xl bg-primary p-4 text-left text-white">
                    <div aria-hidden="true" className="absolute -bottom-12 -left-8 size-[110px] rounded-full bg-brand-mid" />
                    <span id="spmb-h" className="relative min-w-0 flex-grow font-display text-lg font-bold leading-tight">SPMB {spmb.schoolYear}</span>
                    <span className="relative flex h-10 shrink-0 items-center gap-1 rounded-full bg-white px-3.5 text-sm font-extrabold text-brand-dark">
                        Daftar
                        <ArrowRight className="size-4" strokeWidth={2.4} />
                    </span>
                </a>
            ) : null}

            {/* GET /children hanya berisi anak yang disetujui; pengajuan yang belum selesai tampil di sini. */}
            {openRequests.length > 0 ? (
                <section aria-labelledby="req-h" className="flex flex-col gap-2.5">
                    <h2 id="req-h" className="font-display text-[19px] font-semibold">Status Pengajuan</h2>
                    {openRequests.map((request) => <ChildRequestCard key={request.id} request={request} />)}
                </section>
            ) : null}

            <section aria-labelledby="link-h" className="rounded-3xl bg-card p-[18px] shadow-soft">
                <div className="flex items-center gap-3.5">
                    <span aria-hidden="true" className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-pastel-sky text-pastel-sky-fg">
                        <Link2 className="size-6" />
                    </span>
                    <div className="min-w-0 flex-grow">
                        <h2 id="link-h" className="font-display text-lg font-semibold">Hubungkan Data Peserta Didik</h2>
                        <p className="mt-0.5 text-[13px] leading-[1.45] text-subtle">Anak sudah bersekolah di BIS? Lihat nilai, absensi &amp; {features.payments ? 'tagihannya' : 'jadwalnya'}.</p>
                    </div>
                </div>
                <Link to="/hubungkan-anak" className="mt-3.5 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-extrabold text-white">
                    Hubungkan Sekarang
                    <ArrowRight className="size-[18px]" strokeWidth={2.4} />
                </Link>
            </section>

            <SchoolNews />
        </>
    )
}

export default function Dashboard() {
    const [searchParams] = useSearchParams()

    // Pratinjau tampilan akun tanpa peserta didik: buka "/?state=kosong".
    return searchParams.get('state') === 'kosong' ? <EmptyDashboard /> : <StudentDashboard />
}
