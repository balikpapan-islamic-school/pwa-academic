import { useEffect, useState } from 'react'
import { ArrowRight, Bell, ChevronRight, CircleHelp, KeyRound, Link2, LogOut, LucideIcon, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CompactTopBar } from '@/components/kit/compact-top-bar'
import { InstallAppSettingsRow } from '@/components/pwa/install-app'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ChildAvatar } from '@/components/dashboard/child-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useStudent } from '@/contexts/StudentContext'
import { useHasLinkedStudent } from '@/hooks/use-has-linked-student'
import { formatDate, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { StudentProfile } from '@/types/academic'

type SettingsRowProps = {
    icon: LucideIcon
    iconClassName: string
    label: string
    // Tanpa `to`, baris masih berupa tombol tanpa tujuan (halaman belum dibuat).
    to?: string
}

function SettingsRow({ icon: Icon, iconClassName, label, to }: SettingsRowProps) {
    const content = (
        <>
            <span aria-hidden="true" className={cn('flex size-10 items-center justify-center rounded-xl', iconClassName)}>
                <Icon className="size-5" />
            </span>
            <span className="flex-grow text-[15px] font-bold">{label}</span>
            <ChevronRight className="size-5 text-subtle" />
        </>
    )
    const className = 'flex min-h-14 w-full items-center gap-3 px-2 text-left'

    return to
        ? <Link to={to} className={className}>{content}</Link>
        : <button type="button" className={className}>{content}</button>
}

// Foto Google bila ada, selain itu inisial nama wali.
function AccountAvatar({ name, initials, url, className }: { name: string, initials: string, url: string | null, className: string }) {
    const [hasError, setHasError] = useState(false)

    if (url && !hasError) {
        return <img src={url} alt={name} referrerPolicy="no-referrer" onError={() => setHasError(true)} className={cn('object-cover', className)} />
    }

    return <span aria-hidden="true" className={cn('flex items-center justify-center bg-pastel-violet font-display font-bold text-primary', className)}>{initials}</span>
}

function buildPersonalInfo(profile: StudentProfile) {
    const birth = [profile.birthplace, profile.birthDate ? formatDate(parseIsoDate(profile.birthDate)) : null].filter(Boolean).join(', ')
    const gender = profile.gender === 'laki-laki' ? 'Laki-laki' : profile.gender === 'perempuan' ? 'Perempuan' : null

    return [
        { label: 'Tempat, tgl lahir', value: birth || '-' },
        { label: 'Jenis kelamin', value: gender ?? '-' },
        { label: 'Email', value: profile.email ?? '-' },
        { label: 'No. HP', value: profile.phone ?? '-' },
        { label: 'Wali kelas', value: profile.homeroomTeacher ?? '-' },
    ]
}

type ProfileState = { studentId: string, status: 'loading' | 'error' } | { studentId: string, status: 'ready', profile: StudentProfile }

export default function Profil() {
    const { user, logout } = useAuth()
    const hasLinkedStudent = useHasLinkedStudent()
    const { activeStudent, linkedStudents } = useStudent()
    const student = hasLinkedStudent ? activeStudent : null
    const studentIndex = student ? linkedStudents.findIndex((item) => item.id === student.id) : 0
    const [profileState, setProfileState] = useState<ProfileState | null>(null)
    const accountName = user?.name ?? ''
    const accountInitials = user?.avatarInitials ?? ''
    const accountAvatarUrl = user?.avatarUrl ?? null
    // null sampai GET /me/preferences selesai; sakelar dinonaktifkan selama itu.
    const [notificationsOn, setNotificationsOn] = useState<boolean | null>(null)
    const [isLogoutOpen, setIsLogoutOpen] = useState(false)

    useEffect(() => {
        let cancelled = false

        academicService.getNotificationPreferences()
            .then((preferences) => {
                if (!cancelled) {
                    setNotificationsOn(preferences.pushNotifications)
                }
            })
            .catch(() => {
                // Sakelar tetap tampil dengan nilai bawaan agar halaman Profil tidak terganggu.
                if (!cancelled) {
                    setNotificationsOn(true)
                }
            })

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (!student) {
            return
        }

        let cancelled = false
        const studentId = student.id
        setProfileState({ studentId, status: 'loading' })

        academicService.getStudentProfile(studentId)
            .then((profile) => {
                if (!cancelled) {
                    setProfileState({ studentId, status: 'ready', profile })
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setProfileState({ studentId, status: 'error' })
                }
            })

        return () => {
            cancelled = true
        }
    }, [student])

    // Abaikan hasil milik anak sebelumnya saat anak aktif baru saja diganti.
    const currentProfile = profileState && student && profileState.studentId === student.id ? profileState : null
    const profile = currentProfile?.status === 'ready' ? currentProfile.profile : null
    const isStudentActive = profile?.statusActive ?? student?.statusActive ?? true

    // Optimistic: sakelar langsung berubah, dikembalikan bila PATCH gagal.
    async function toggleNotifications() {
        if (notificationsOn === null) {
            return
        }

        const next = !notificationsOn
        setNotificationsOn(next)

        try {
            await academicService.updateNotificationPreferences({ pushNotifications: next })
            toast.success(next ? 'Notifikasi diaktifkan.' : 'Notifikasi dimatikan.', {
                description: next ? 'Anda akan menerima kabar nilai, absensi, dan izin.' : 'Anda tidak akan menerima pemberitahuan dari aplikasi.',
            })
        } catch (caughtError) {
            setNotificationsOn(!next)
            toast.error(caughtError instanceof Error ? caughtError.message : 'Pengaturan notifikasi gagal disimpan.')
        }
    }

    return (
        // Margin negatif membatalkan padding shell agar header hijau menempel ke tepi layar.
        <div className="-mx-5 -mt-[52px] flex flex-col">
            {student ? (
                <CompactTopBar
                    title={student.name}
                    threshold={150}
                    leading={<ChildAvatar student={student} index={studentIndex} className="size-9 border-2 border-white text-sm" />}
                />
            ) : (
                <CompactTopBar
                    title={accountName}
                    threshold={150}
                    leading={<AccountAvatar name={accountName} initials={accountInitials} url={accountAvatarUrl} className="size-9 shrink-0 rounded-full border-2 border-white text-sm" />}
                />
            )}
            <div className="relative flex h-[210px] items-start justify-between overflow-hidden rounded-b-[36px] bg-primary px-5 pt-[52px] text-white">
                <div aria-hidden="true" className="absolute -bottom-[70px] -left-[50px] size-[180px] rounded-full bg-brand-mid" />
                <h1 className="relative mt-1.5 font-display text-2xl font-bold">Profil Saya</h1>
            </div>

            {student ? (
                <>
                    <section className="relative mx-5 -mt-24 flex flex-col items-center rounded-[28px] bg-card p-5 text-center shadow-float">
                        <ChildAvatar student={{ ...student, photoUrl: profile?.photoUrl ?? student.photoUrl }} index={studentIndex} className="-mt-16 size-[88px] border-4 border-white text-3xl shadow-[0_6px_16px_rgba(0,0,0,0.14)]" />
                        <h2 className="mt-3 font-display text-[22px] font-bold">{student.name}</h2>
                        <p className="mt-1 text-sm text-subtle">{[`NIS ${student.nis}`, student.className !== '-' ? student.className : null].filter(Boolean).join(' · ')}</p>
                        <span className={cn('mt-2.5 rounded-full px-3 py-1.5 text-xs font-extrabold', isStudentActive ? 'bg-pastel-mint text-pastel-mint-fg' : 'bg-muted text-subtle')}>
                            {isStudentActive ? 'Siswa Aktif' : 'Tidak Aktif'}
                        </span>
                    </section>

                    <section aria-labelledby="data-h" className="mx-5 mt-[22px]">
                        <h3 id="data-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Data Pribadi</h3>
                        <div className="rounded-3xl bg-card px-4 py-1" aria-busy={currentProfile?.status === 'loading'}>
                            {profile ? buildPersonalInfo(profile).map((item) => (
                                <div key={item.label} className="flex items-center gap-3 border-b border-muted py-3 last:border-b-0">
                                    <span className="w-[120px] shrink-0 text-[13px] font-bold text-subtle">{item.label}</span>
                                    <span className="min-w-0 flex-grow break-words text-right text-sm font-bold">{item.value}</span>
                                </div>
                            )) : currentProfile?.status === 'error' ? (
                                <p className="py-4 text-center text-sm text-subtle">Data pribadi belum dapat dimuat. Coba lagi nanti.</p>
                            ) : (
                                [0, 1, 2, 3, 4].map((item) => (
                                    <div key={item} className="flex items-center justify-between gap-3 border-b border-muted py-3.5 last:border-b-0">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <section className="relative mx-5 -mt-24 flex flex-col items-center rounded-[28px] bg-card p-5 text-center shadow-float">
                        <AccountAvatar name={accountName} initials={accountInitials} url={accountAvatarUrl} className="-mt-16 size-[88px] rounded-full border-4 border-white text-3xl shadow-[0_6px_16px_rgba(0,0,0,0.14)]" />
                        <h2 className="mt-3 font-display text-[22px] font-bold">{accountName}</h2>
                        <p className="mt-1 max-w-full truncate text-sm text-subtle">{user?.email}</p>
                        <span className="mt-2.5 rounded-full bg-pastel-sun px-3 py-1.5 text-xs font-extrabold text-[#6B4A00]">Belum terhubung ke peserta didik</span>
                    </section>

                    <Link to="/hubungkan-anak" className="mx-5 mt-[22px] flex items-center gap-3.5 rounded-3xl bg-card p-4">
                        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pastel-sky text-pastel-sky-fg">
                            <Link2 className="size-5" />
                        </span>
                        <span className="flex min-w-0 flex-grow flex-col">
                            <span className="text-[15px] font-extrabold">Hubungkan Data Peserta Didik</span>
                            <span className="text-[13px] text-subtle">Data anak tampil setelah disetujui sekolah.</span>
                        </span>
                        <ArrowRight className="size-5 shrink-0 text-primary" strokeWidth={2.4} />
                    </Link>
                </>
            )}

            <section aria-labelledby="akun-h" className="mx-5 mt-[22px]">
                <h3 id="akun-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Akun Orang Tua / Wali</h3>
                <Link to="/profil/edit" className="flex items-center gap-3 rounded-3xl bg-card p-4">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pastel-violet text-primary">
                        <UserRound className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-grow flex-col">
                        <span className="truncate text-[15px] font-extrabold">{user?.name}</span>
                        <span className="truncate text-[13px] text-subtle">{user?.email}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-extrabold text-primary">Ubah</span>
                </Link>
            </section>

            <section aria-labelledby="set-h" className="mx-5 mt-[22px]">
                <h3 id="set-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Pengaturan</h3>
                <div className="rounded-3xl bg-card px-2 py-1">
                    {student ? <SettingsRow icon={Users} iconClassName="bg-pastel-violet text-primary" label="Data Orang Tua / Wali" to="/profil/wali" /> : null}
                    <SettingsRow icon={KeyRound} iconClassName="bg-pastel-mint text-[#0F7A73]" label={user?.hasPassword !== false ? 'Ubah Kata Sandi' : 'Buat Kata Sandi'} to="/profil/kata-sandi" />
                    <div className="flex min-h-14 items-center gap-3 px-2">
                        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-pastel-sun text-[#9A6400]">
                            <Bell className="size-5" />
                        </span>
                        <span id="notif-l" className="flex-grow text-[15px] font-bold">Notifikasi</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={notificationsOn ?? false}
                            aria-labelledby="notif-l"
                            disabled={notificationsOn === null}
                            onClick={toggleNotifications}
                            className={cn('flex h-8 w-[52px] rounded-full p-[3px] transition-colors disabled:opacity-50', notificationsOn ? 'justify-end bg-primary' : 'justify-start bg-[#C3CEC5]')}>
                            <span className="size-[26px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                        </button>
                    </div>
                    <InstallAppSettingsRow />
                    <SettingsRow icon={CircleHelp} iconClassName="bg-pastel-sky text-[#2F6FD6]" label="Pusat Bantuan" />
                </div>
            </section>

            <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="mx-5 mt-5 flex h-[54px] items-center justify-center gap-2 rounded-full border-2 border-[#F3C3BF] bg-card text-base font-extrabold text-[#B3362F]">
                <LogOut className="size-5" />
                Keluar
            </button>

            <ConfirmDialog
                open={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                icon={LogOut}
                tone="danger"
                title="Keluar dari akun?"
                description="Anda perlu masuk lagi dengan email dan kata sandi atau Google."
                confirmLabel="Keluar"
                onConfirm={logout}
            />
        </div>
    )
}
