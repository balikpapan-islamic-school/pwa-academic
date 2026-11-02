import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Pembungkus area yang sedang dimuat: diumumkan ke pembaca layar, tulang di dalamnya disembunyikan.
export function LoadingRegion({ label, className, children }: { label: string, className?: string, children: ReactNode }) {
    return (
        <div aria-busy="true" aria-label={label} className={cn('flex flex-col gap-2.5', className)}>
            {children}
        </div>
    )
}

type RowSkeletonProps = {
    // Kelas ukuran & radius ubin ikon di kiri; null bila baris tanpa ubin.
    tile?: string | null
    // Satu kelas tinggi + lebar per baris teks, dari judul ke bawah.
    lines?: string[]
    trailing?: 'chevron' | 'badge' | 'score'
    className?: string
}

// Meniru baris kartu putih yang dipakai di daftar (mapel, riwayat, berita, absensi).
export function RowSkeleton({ tile = 'size-11 rounded-[14px]', lines = ['h-4 w-32', 'h-3 w-44'], trailing, className }: RowSkeletonProps) {
    return (
        <div className={cn('flex items-center gap-3 rounded-[20px] bg-card p-3.5', className)}>
            {tile ? <Skeleton className={cn('shrink-0', tile)} /> : null}
            <div className="flex min-w-0 flex-grow flex-col gap-2.5">
                {lines.map((line, index) => <Skeleton key={index} className={cn('max-w-full', line)} />)}
            </div>
            {trailing === 'chevron' ? <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-border" strokeWidth={2.4} /> : null}
            {trailing === 'badge' ? <Skeleton className="h-7 w-[70px] shrink-0 rounded-full" /> : null}
            {trailing === 'score' ? <Skeleton className="h-6 w-9 shrink-0 rounded-lg" /> : null}
        </div>
    )
}
