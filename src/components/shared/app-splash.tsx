import { BisLogo } from '@/components/bis-logo'

// Layar awal saat sesi masih diperiksa: logo di atas latar aplikasi, tanpa kerangka halaman yang belum tentu dibuka.
export function AppSplash() {
    return (
        <div role="status" aria-label="Memuat aplikasi" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
            <BisLogo className="h-16 motion-safe:animate-pulse" />
            <span aria-hidden="true" className="relative h-1 w-24 overflow-hidden rounded-full bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-linear-to-r before:from-transparent before:via-primary before:to-transparent motion-reduce:before:hidden" />
        </div>
    )
}
