import { ReactNode } from 'react'
import { useScrolled } from '@/hooks/use-scrolled'
import { cn } from '@/lib/utils'

type CompactTopBarProps = {
    title: string
    leading?: ReactNode
    action?: ReactNode
    // Jarak scroll sebelum bar muncul; kira-kira saat header halaman sudah keluar layar.
    threshold?: number
}

// Bar hijau ringkas yang turun dari atas saat halaman di-scroll (gaya yang sama di semua halaman).
export function CompactTopBar({ title, leading, action, threshold = 72 }: CompactTopBarProps) {
    const isVisible = useScrolled(threshold)

    return (
        <div
            aria-hidden={!isVisible}
            inert={!isVisible}
            className={cn(
                'fixed inset-x-0 top-0 z-30 mx-auto flex min-h-[60px] max-w-md items-center justify-between gap-3 rounded-b-3xl bg-primary px-5 py-3 text-white shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-all duration-300',
                isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
            )}>
            <div className="flex min-w-0 items-center gap-2.5">
                {leading}
                <span className="truncate font-display text-lg font-bold">{title}</span>
            </div>
            {action}
        </div>
    )
}

// Tombol ikon bulat transparan untuk dipakai di dalam bar hijau.
export function CompactBarIconButton({ label, children, onClick }: { label: string, children: ReactNode, onClick?: () => void }) {
    return (
        <button type="button" aria-label={label} onClick={onClick} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.18]">
            {children}
        </button>
    )
}
