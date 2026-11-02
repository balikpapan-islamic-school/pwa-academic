import { ReactNode } from 'react'
import { CloudOff, LucideIcon, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const toneClasses = {
    violet: { tile: 'bg-pastel-violet text-pastel-violet-fg', shadow: 'bg-[#C9BFFF]', dot: 'bg-[#8F7CF2]' },
    mint: { tile: 'bg-pastel-mint text-pastel-mint-fg', shadow: 'bg-[#A9E3DE]', dot: 'bg-[#38B0A5]' },
    coral: { tile: 'bg-pastel-coral text-pastel-coral-fg', shadow: 'bg-[#FBBDB7]', dot: 'bg-[#F0827A]' },
    sun: { tile: 'bg-pastel-sun text-pastel-sun-fg', shadow: 'bg-[#FADF85]', dot: 'bg-[#F2B630]' },
    sky: { tile: 'bg-pastel-sky text-pastel-sky-fg', shadow: 'bg-[#B5D5FB]', dot: 'bg-[#5E9BEA]' },
}

export type EmptyStateTone = keyof typeof toneClasses

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    description?: ReactNode
    tone?: EmptyStateTone
    // `stacked` untuk isi utama halaman/tab, `inline` untuk bagian kecil di antara section lain.
    layout?: 'stacked' | 'inline'
    action?: ReactNode
    className?: string
}

// Ilustrasi kecil: ubin pastel berikon dengan bayangan miring dan titik berkilau, senada dengan ubin modul.
function EmptyIllustration({ icon: Icon, tone, size }: { icon: LucideIcon, tone: EmptyStateTone, size: 'lg' | 'sm' }) {
    const classes = toneClasses[tone]

    return (
        <span aria-hidden="true" className={cn('relative shrink-0', size === 'lg' ? 'size-[76px]' : 'size-[52px]')}>
            <span className={cn('absolute inset-0 rotate-[10deg] rounded-[22px]', classes.shadow, size === 'sm' && 'rounded-2xl')} />
            <span className={cn('relative flex size-full items-center justify-center rounded-[22px]', classes.tile, size === 'sm' && 'rounded-2xl')}>
                <Icon className={size === 'lg' ? 'size-9' : 'size-6'} strokeWidth={1.8} />
            </span>
            <span className={cn('absolute rounded-full motion-safe:animate-twinkle', classes.dot, size === 'lg' ? '-right-2 -top-1.5 size-2.5' : '-right-1.5 -top-1 size-2')} />
            {size === 'lg' ? <span className={cn('absolute -bottom-1 -left-2.5 size-1.5 rounded-full opacity-60', classes.dot)} /> : null}
        </span>
    )
}

export function EmptyState({ icon, title, description, tone = 'mint', layout = 'stacked', action, className }: EmptyStateProps) {
    if (layout === 'inline') {
        return (
            <div className={cn('flex items-center gap-3.5 rounded-[20px] bg-card p-3.5 pr-4', className)}>
                <EmptyIllustration icon={icon} tone={tone} size="sm" />
                <div className="flex min-w-0 flex-grow flex-col gap-0.5">
                    <p className="text-[15px] font-extrabold">{title}</p>
                    {description ? <p className="text-[13px] leading-snug text-subtle">{description}</p> : null}
                </div>
                {action}
            </div>
        )
    }

    return (
        <div className={cn('relative flex flex-col items-center overflow-hidden rounded-3xl bg-card px-6 pb-6 pt-7 text-center', className)}>
            <span aria-hidden="true" className="absolute -right-10 -top-12 size-32 rounded-full bg-background" />
            <span aria-hidden="true" className="absolute -bottom-10 -left-8 size-20 rounded-full bg-background" />
            <EmptyIllustration icon={icon} tone={tone} size="lg" />
            <h3 className="relative mt-5 font-display text-lg font-semibold leading-tight">{title}</h3>
            {description ? <p className="relative mt-1.5 max-w-[280px] text-[13px] leading-normal text-subtle">{description}</p> : null}
            {action ? <div className="relative mt-4">{action}</div> : null}
        </div>
    )
}

export function RetryButton({ onClick, compact = false }: { onClick: () => void, compact?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={compact ? 'Coba lagi' : undefined}
            className={cn(
                'flex shrink-0 items-center justify-center gap-1.5 rounded-full border-2 border-border bg-card font-extrabold text-primary',
                compact ? 'size-11' : 'h-11 px-5 text-sm'
            )}>
            <RotateCw className="size-4" strokeWidth={2.4} />
            {compact ? null : 'Coba lagi'}
        </button>
    )
}

type LoadErrorStateProps = {
    title: string
    onRetry?: () => void
    layout?: 'stacked' | 'inline'
    className?: string
}

// Gagal memuat: selalu nada coral + ikon awan terputus, dengan tombol coba lagi bila tersedia.
export function LoadErrorState({ title, onRetry, layout = 'stacked', className }: LoadErrorStateProps) {
    return (
        <EmptyState
            icon={CloudOff}
            tone="coral"
            layout={layout}
            title={title}
            description="Periksa koneksi internet, lalu coba lagi."
            action={onRetry ? <RetryButton onClick={onRetry} compact={layout === 'inline'} /> : undefined}
            className={className}
        />
    )
}
