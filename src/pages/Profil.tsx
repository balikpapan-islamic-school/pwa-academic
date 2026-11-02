import { useState } from 'react'
import { Bell, ChevronRight, CircleHelp, KeyRound, LogOut, LucideIcon, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CompactTopBar } from '@/components/kit/compact-top-bar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/contexts/AuthContext'
import { dummyPersonalInfo, dummyStudent, getDummyAccount } from '@/lib/dummy-ui'
import { cn } from '@/lib/utils'

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

export default function Profil() {
    const { logout } = useAuth()
    const [notificationsOn, setNotificationsOn] = useState(true)
    const [account] = useState(getDummyAccount)
    const [isLogoutOpen, setIsLogoutOpen] = useState(false)

    function toggleNotifications() {
        const next = !notificationsOn
        setNotificationsOn(next)
        toast.success(next ? 'Notifikasi diaktifkan' : 'Notifikasi dimatikan', {
            description: next ? 'Anda akan menerima kabar nilai, absensi, dan izin.' : 'Anda tidak akan menerima pemberitahuan dari aplikasi.',
        })
    }

    return (
        // Margin negatif membatalkan padding shell agar header hijau menempel ke tepi layar.
        <div className="-mx-5 -mt-[52px] flex flex-col">
            <CompactTopBar
                title={dummyStudent.name}
                threshold={150}
                leading={<span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-pastel-coral font-display text-sm font-bold text-pastel-coral-fg">{dummyStudent.initials}</span>}
            />
            <div className="relative flex h-[210px] items-start justify-between overflow-hidden rounded-b-[36px] bg-primary px-5 pt-[52px] text-white">
                <div aria-hidden="true" className="absolute -bottom-[70px] -left-[50px] size-[180px] rounded-full bg-brand-mid" />
                <h1 className="relative mt-1.5 font-display text-2xl font-bold">Profil Saya</h1>
            </div>

            <section className="relative mx-5 -mt-24 flex flex-col items-center rounded-[28px] bg-card p-5 text-center shadow-float">
                <div aria-hidden="true" className="-mt-16 flex size-[88px] items-center justify-center rounded-full border-4 border-white bg-pastel-coral font-display text-3xl font-bold text-pastel-coral-fg shadow-[0_6px_16px_rgba(0,0,0,0.14)]">
                    {dummyStudent.initials}
                </div>
                <h2 className="mt-3 font-display text-[22px] font-bold">{dummyStudent.name}</h2>
                <p className="mt-1 text-sm text-subtle">NIS {dummyStudent.nis} · {dummyStudent.className}</p>
                <span className="mt-2.5 rounded-full bg-pastel-mint px-3 py-1.5 text-xs font-extrabold text-pastel-mint-fg">Siswa Aktif</span>
            </section>

            <section aria-labelledby="data-h" className="mx-5 mt-[22px]">
                <h3 id="data-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Data Pribadi</h3>
                <div className="rounded-3xl bg-card px-4 py-1">
                    {dummyPersonalInfo.map((item) => (
                        <div key={item.label} className="flex items-center gap-3 border-b border-muted py-3 last:border-b-0">
                            <span className="w-[120px] shrink-0 text-[13px] font-bold text-subtle">{item.label}</span>
                            <span className="min-w-0 flex-grow break-words text-right text-sm font-bold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section aria-labelledby="akun-h" className="mx-5 mt-[22px]">
                <h3 id="akun-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Akun Orang Tua / Wali</h3>
                <Link to="/profil/edit" className="flex items-center gap-3 rounded-3xl bg-card p-4">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pastel-violet text-primary">
                        <UserRound className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-grow flex-col">
                        <span className="truncate text-[15px] font-extrabold">{account.name}</span>
                        <span className="truncate text-[13px] text-subtle">{account.email}</span>
                    </span>
                    <span className="shrink-0 text-[13px] font-extrabold text-primary">Ubah</span>
                </Link>
            </section>

            <section aria-labelledby="set-h" className="mx-5 mt-[22px]">
                <h3 id="set-h" className="mb-2.5 ml-1 font-display text-lg font-semibold">Pengaturan</h3>
                <div className="rounded-3xl bg-card px-2 py-1">
                    <SettingsRow icon={Users} iconClassName="bg-pastel-violet text-primary" label="Data Orang Tua / Wali" />
                    <SettingsRow icon={KeyRound} iconClassName="bg-pastel-mint text-[#0F7A73]" label={account.hasPassword ? 'Ubah Kata Sandi' : 'Buat Kata Sandi'} to="/profil/kata-sandi" />
                    <div className="flex min-h-14 items-center gap-3 px-2">
                        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-pastel-sun text-[#9A6400]">
                            <Bell className="size-5" />
                        </span>
                        <span id="notif-l" className="flex-grow text-[15px] font-bold">Notifikasi</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={notificationsOn}
                            aria-labelledby="notif-l"
                            onClick={toggleNotifications}
                            className={cn('flex h-8 w-[52px] rounded-full p-[3px] transition-colors', notificationsOn ? 'justify-end bg-primary' : 'justify-start bg-[#C3CEC5]')}>
                            <span className="size-[26px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                        </button>
                    </div>
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
