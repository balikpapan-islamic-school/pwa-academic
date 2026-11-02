import { useState } from 'react'
import { ChevronRight, Download, Share, SquarePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { usePwaInstall } from '@/hooks/use-pwa-install'

const DISMISS_KEY = 'pwa-academic-install-dismissed-at'
// Setelah kartu ditutup, ajakan pasang di Beranda baru muncul lagi setelah sekian hari.
const DISMISS_DAYS = 14

function isRecentlyDismissed() {
    try {
        const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY))
        return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000
    } catch {
        return false
    }
}

function rememberDismiss() {
    try {
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
        // Tanpa penyimpanan, kartu hanya tersembunyi sampai halaman dimuat ulang.
    }
}

// iOS tidak punya dialog pasang dari browser, jadi tampilkan langkah manual di Safari.
function IosInstallSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const steps = [
        { icon: Share, text: <>Ketuk tombol <span className="font-extrabold">Bagikan</span> di bilah bawah Safari.</> },
        { icon: SquarePlus, text: <>Pilih <span className="font-extrabold">Tambah ke Layar Utama</span>.</> },
        { icon: Download, text: <>Ketuk <span className="font-extrabold">Tambah</span>. Ikon BIS akan muncul di layar utama.</> },
    ]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="mx-auto max-w-md gap-0 rounded-t-[28px] border-0 bg-background px-5 pb-8 pt-3 [&>button:last-child]:hidden">
                <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#C3CEC5]" />
                <SheetTitle className="font-display text-xl font-bold">Pasang di iPhone / iPad</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-subtle">Buka halaman ini di Safari, lalu ikuti langkah berikut.</SheetDescription>
                <ol className="mt-4 flex flex-col gap-2">
                    {steps.map(({ icon: Icon, text }, index) => (
                        <li key={index} className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
                            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pastel-sky text-pastel-sky-fg">
                                <Icon className="size-5" />
                            </span>
                            <span className="text-sm leading-snug">{text}</span>
                        </li>
                    ))}
                </ol>
                <button type="button" onClick={() => onOpenChange(false)} className="mt-4 h-[50px] rounded-full bg-primary text-[15px] font-extrabold text-white">
                    Mengerti
                </button>
            </SheetContent>
        </Sheet>
    )
}

// Satu aksi "pasang" untuk semua platform: dialog bawaan browser, atau panduan iOS.
function useInstallAction() {
    const install = usePwaInstall()
    const [isIosSheetOpen, setIsIosSheetOpen] = useState(false)

    async function startInstall() {
        if (install.canPrompt) {
            const outcome = await install.promptInstall()
            if (outcome === 'accepted') {
                toast.success('Aplikasi sedang dipasang.', { description: 'Buka BIS dari layar utama HP Anda.' })
            }
            return
        }

        setIsIosSheetOpen(true)
    }

    const sheet = install.isIos ? <IosInstallSheet open={isIosSheetOpen} onOpenChange={setIsIosSheetOpen} /> : null

    return { isAvailable: install.isAvailable, startInstall, sheet }
}

// Kartu ajakan pasang di Beranda.
export function InstallAppCard() {
    const { isAvailable, startInstall, sheet } = useInstallAction()
    const [isDismissed, setIsDismissed] = useState(isRecentlyDismissed)

    if (!isAvailable || isDismissed) {
        return sheet
    }

    return (
        <section aria-labelledby="install-h" className="flex items-center gap-3 rounded-3xl bg-card p-3.5 shadow-soft">
            <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="" className="size-12 shrink-0 rounded-2xl border border-border bg-white object-contain p-1" />
            <span className="flex min-w-0 flex-grow flex-col">
                <span id="install-h" className="text-[15px] font-extrabold">Pasang aplikasi BIS</span>
                <span className="text-[13px] leading-snug text-subtle">Buka lebih cepat langsung dari layar utama HP.</span>
            </span>
            <button type="button" onClick={startInstall} className="h-10 shrink-0 rounded-full bg-primary px-4 text-[13px] font-extrabold text-white">
                Pasang
            </button>
            <button
                type="button"
                aria-label="Tutup ajakan pasang aplikasi"
                onClick={() => {
                    rememberDismiss()
                    setIsDismissed(true)
                }}
                className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-subtle">
                <X className="size-[18px]" />
            </button>
            {sheet}
        </section>
    )
}

// Baris "Pasang Aplikasi" di Pengaturan Profil; tetap tersedia walau kartu Beranda sudah ditutup.
export function InstallAppSettingsRow() {
    const { isAvailable, startInstall, sheet } = useInstallAction()

    if (!isAvailable) {
        return null
    }

    return (
        <>
            <button type="button" onClick={startInstall} className="flex min-h-14 w-full items-center gap-3 px-2 text-left">
                <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-xl bg-pastel-violet text-primary">
                    <Download className="size-5" />
                </span>
                <span className="flex-grow text-[15px] font-bold">Pasang Aplikasi</span>
                <ChevronRight className="size-5 text-subtle" />
            </button>
            {sheet}
        </>
    )
}
