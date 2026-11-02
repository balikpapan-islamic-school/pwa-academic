import { ReactNode, useState } from 'react'
import { ArrowLeft, Check, LoaderCircle, LucideIcon, TriangleAlert } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { PullToRefresh } from './pull-to-refresh'

type FocusPageProps = {
    title: ReactNode
    subtitle?: ReactNode
    // Tanpa onBack, tombol kembali disembunyikan (mis. di layar sukses).
    onBack?: () => void
    // Bila true, tombol kembali meminta konfirmasi dulu agar isian form tidak hilang tanpa sengaja.
    isDirty?: boolean
    headerExtra?: ReactNode
    // Foto latar header (mis. sampul berita); header jadi lebih tinggi dengan gradasi gelap agar teks tetap terbaca.
    backgroundImageUrl?: string | null
    children: ReactNode
}

// Kerangka halaman alur fokus (tanpa navigasi bawah): header hijau melengkung + kartu konten yang menumpuk di atasnya.
export function FocusPage({ title, subtitle, onBack, isDirty = false, headerExtra, backgroundImageUrl, children }: FocusPageProps) {
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    // Gambar gagal dimuat: kembali ke header hijau biasa.
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
    const imageUrl = backgroundImageUrl && backgroundImageUrl !== failedImageUrl ? backgroundImageUrl : null

    function handleBack() {
        if (isDirty) {
            setIsLeaveDialogOpen(true)
        } else {
            onBack?.()
        }
    }

    return (
        <PullToRefresh>
            <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-10 text-ink">
                <div className={cn('relative overflow-hidden rounded-b-[36px] px-6 pb-16 pt-[52px] text-white', imageUrl ? 'flex min-h-[380px] flex-col bg-ink' : 'bg-primary')}>
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt="" onError={() => setFailedImageUrl(imageUrl)} className="absolute inset-0 size-full object-cover motion-safe:animate-[cover-zoom_1.2s_ease-out_both]" />
                            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-black/80" />
                        </>
                    ) : (
                        <>
                            <div aria-hidden="true" className="absolute -right-10 -top-[30px] size-[170px] rounded-full bg-brand-mid" />
                            <div aria-hidden="true" className="absolute -bottom-[50px] right-[70px] size-[110px] rounded-full bg-brand-dark" />
                        </>
                    )}
                    {onBack ? (
                        <button type="button" onClick={handleBack} aria-label="Kembali" className={cn('relative flex size-11 items-center justify-center rounded-full', imageUrl ? 'bg-black/30 backdrop-blur-md' : 'bg-white/[0.18]')}>
                            <ArrowLeft className="size-[22px]" strokeWidth={2.2} />
                        </button>
                    ) : null}
                    <h1 className={cn('relative font-display text-[28px] font-bold leading-[1.1]', imageUrl ? 'mt-auto pt-[22px] [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]' : onBack ? 'mt-[22px]' : 'mt-[66px]')}>{title}</h1>
                    {subtitle ? <p className={cn('relative mt-2 text-[15px]', imageUrl ? 'text-white/85' : 'text-brand-soft')}>{subtitle}</p> : null}
                    {headerExtra}
                </div>
                {children}
                {onBack ? (
                    <ConfirmDialog
                        open={isLeaveDialogOpen}
                        onOpenChange={setIsLeaveDialogOpen}
                        icon={TriangleAlert}
                        tone="danger"
                        title="Tinggalkan halaman?"
                        description="Isian yang belum disimpan akan hilang."
                        cancelLabel="Lanjut Isi"
                        confirmLabel="Tinggalkan"
                        onConfirm={onBack}
                    />
                ) : null}
            </main>
        </PullToRefresh>
    )
}

// Kartu putih yang menumpuk di bawah header FocusPage.
export const focusCardClassName = 'relative mx-5 -mt-9 flex flex-col gap-4 rounded-[28px] bg-card px-5 py-[22px] shadow-float'

type FormFieldProps = {
    id: string
    label: string
    error?: string
    hint?: ReactNode
    children: ReactNode
}

// Label + input + pesan error/petunjuk. Input di dalamnya sebaiknya memakai aria-describedby={`${id}-desc`}.
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-extrabold">{label}</label>
            {children}
            {error
                ? <p id={`${id}-desc`} className="text-sm font-semibold text-destructive">{error}</p>
                : hint ? <p id={`${id}-desc`} className="text-xs text-subtle">{hint}</p> : null}
        </div>
    )
}

type SubmitButtonProps = {
    isLoading: boolean
    loadingLabel: string
    children: ReactNode
}

export function SubmitButton({ isLoading, loadingLabel, children }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex h-14 items-center justify-center gap-2.5 rounded-full bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_22px_rgba(0,130,54,0.28)] disabled:opacity-70">
            {isLoading ? (
                <>
                    <LoaderCircle className="size-5 animate-spin" />
                    {loadingLabel}
                </>
            ) : children}
        </button>
    )
}

type SuccessCardProps = {
    // Ikon di lingkaran atas; bawaan tanda centang.
    icon?: LucideIcon
    title: string
    description: ReactNode
    children?: ReactNode
}

export function SuccessCard({ icon: Icon = Check, title, description, children }: SuccessCardProps) {
    return (
        <section aria-live="polite" className={cn(focusCardClassName, 'items-center py-7 text-center')}>
            <span aria-hidden="true" className="flex size-[76px] items-center justify-center rounded-full bg-brand-soft motion-safe:animate-pop-in">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-white">
                    <Icon className="size-8" strokeWidth={3} />
                </span>
            </span>
            <div>
                <h2 className="font-display text-[22px] font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-normal text-subtle">{description}</p>
            </div>
            {children}
        </section>
    )
}

