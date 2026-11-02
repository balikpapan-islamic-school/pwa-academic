import { Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LoadingRegion, RowSkeleton } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, parseIsoDateTime } from '@/lib/format'
import { newsCategoryLabels, newsCategoryTones } from '@/lib/news'
import { cn, repeat } from '@/lib/utils'
import { NewsArticle } from '@/types/academic'

function newsMeta(item: NewsArticle) {
    return [formatDate(parseIsoDateTime(item.publishedAt)), item.author].filter(Boolean).join(' · ')
}

// Berita pertama tampil sebagai kartu besar, sisanya baris ringkas. Dipakai di Beranda dan halaman Berita.
export function NewsList({ items }: { items: NewsArticle[] }) {
    const [featured, ...rest] = items
    const featuredTone = newsCategoryTones[featured.category]

    return (
        <>
            <Link to={`/berita/${featured.id}`} className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft">
                {featured.coverImageUrl ? (
                    <div className="relative h-[150px]">
                        <img src={featured.coverImageUrl} alt="" className="size-full object-cover" />
                        <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-extrabold text-white">{newsCategoryLabels[featured.category]}</span>
                    </div>
                ) : (
                    <div role="img" aria-label="Ilustrasi berita" className={cn('relative flex h-[150px] items-center justify-center', featuredTone.bg, featuredTone.fg)}>
                        <Newspaper aria-hidden="true" className="size-12" strokeWidth={1.6} />
                        <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-extrabold text-white">{newsCategoryLabels[featured.category]}</span>
                    </div>
                )}
                <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3.5">
                    <h3 className="text-base font-extrabold leading-[1.35]">{featured.title}</h3>
                    <p className="text-[13px] text-subtle">{newsMeta(featured)}</p>
                </div>
            </Link>

            {rest.map((item) => <NewsRow key={item.id} item={item} />)}
        </>
    )
}

export function NewsRow({ item }: { item: NewsArticle }) {
    const tone = newsCategoryTones[item.category]

    return (
        <Link to={`/berita/${item.id}`} className="flex items-center gap-3 rounded-[20px] bg-card p-3">
            {item.coverImageUrl ? (
                <img src={item.coverImageUrl} alt="" className="size-[72px] shrink-0 rounded-2xl object-cover" />
            ) : (
                <span aria-hidden="true" className={cn('flex size-[72px] shrink-0 items-center justify-center rounded-2xl', tone.bg, tone.fg)}>
                    <Newspaper className="size-7" strokeWidth={1.8} />
                </span>
            )}
            <span className="flex min-w-0 flex-grow flex-col gap-1">
                <span className={cn('text-[11px] font-extrabold uppercase tracking-[0.4px]', tone.fg)}>{newsCategoryLabels[item.category]}</span>
                <span className="text-sm font-extrabold leading-[1.35]">{item.title}</span>
                <span className="text-xs text-subtle">{newsMeta(item)}</span>
            </span>
        </Link>
    )
}

export function NewsListSkeleton({ rows = 2 }: { rows?: number }) {
    return (
        <LoadingRegion label="Memuat berita" className="gap-3">
            <div className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft">
                <Skeleton className="h-[150px] rounded-none" />
                <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            {repeat(rows, (index) => <NewsRowSkeleton key={index} />)}
        </LoadingRegion>
    )
}

export function NewsRowSkeleton() {
    return <RowSkeleton tile="size-[72px] rounded-2xl" lines={['h-2.5 w-20', 'h-4 w-48', 'h-3 w-28']} className="p-3" />
}
