import { useState } from 'react'
import { ChevronDown, LoaderCircle, Newspaper } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { FocusPage } from '@/components/kit/focus-page'
import { NewsList, NewsListSkeleton, NewsRowSkeleton } from '@/components/news/news-list'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { newsCategoryLabels, newsCategoryOptions } from '@/lib/news'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { NewsArticle, NewsCategory, Paginated } from '@/types/academic'

const PER_PAGE = 10

function isNewsCategory(value: string | null): value is NewsCategory {
    return value !== null && value in newsCategoryLabels
}

// Daftar berita per kategori: halaman pertama lewat useApiData (ikut tarik-untuk-muat-ulang), halaman berikutnya ditambahkan di bawah.
function NewsFeed({ category }: { category: NewsCategory | null }) {
    const firstPage = useApiData(() => academicService.getNews({ category: category ?? undefined, perPage: PER_PAGE }), [category])
    // Halaman tambahan terikat ke hasil halaman pertama yang dilanjutkannya; bila halaman pertama dimuat ulang
    // (ganti kategori / tarik layar), halaman tambahan lama otomatis diabaikan.
    const [loadedMore, setLoadedMore] = useState<{ source: Paginated<NewsArticle>, items: NewsArticle[], page: number, lastPage: number } | null>(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const more = loadedMore && loadedMore.source === firstPage.data ? loadedMore : null

    if (!firstPage.data) {
        return firstPage.status === 'error'
            ? <LoadErrorState title="Berita belum dapat dimuat" onRetry={firstPage.reload} className="shadow-soft" />
            : <NewsListSkeleton rows={3} />
    }

    const source = firstPage.data
    const items = [...source.items, ...(more?.items ?? [])]
    const page = more?.page ?? source.meta.currentPage
    const lastPage = more?.lastPage ?? source.meta.lastPage
    const total = source.meta.total

    if (items.length === 0) {
        return (
            <EmptyState
                icon={Newspaper}
                tone="sky"
                title="Belum ada berita"
                description={category ? `Belum ada berita ${newsCategoryLabels[category].toLowerCase()} untuk saat ini.` : 'Kabar terbaru dari sekolah akan tampil di sini.'}
                className="shadow-soft"
            />
        )
    }

    async function loadMore() {
        setIsLoadingMore(true)
        try {
            const result = await academicService.getNews({ category: category ?? undefined, page: page + 1, perPage: PER_PAGE })
            setLoadedMore({ source, items: [...(more?.items ?? []), ...result.items], page: result.meta.currentPage, lastPage: result.meta.lastPage })
        } catch (caughtError) {
            toast.error(caughtError instanceof Error ? caughtError.message : 'Berita berikutnya gagal dimuat.')
        } finally {
            setIsLoadingMore(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <NewsList items={items} />
            {isLoadingMore ? <NewsRowSkeleton /> : null}
            {page < lastPage ? (
                <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="mt-1 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-border bg-card text-sm font-extrabold text-primary disabled:opacity-70">
                    {isLoadingMore ? <LoaderCircle className="size-4 animate-spin" /> : <ChevronDown className="size-4" strokeWidth={2.6} />}
                    {isLoadingMore ? 'Memuat…' : 'Muat lebih banyak'}
                </button>
            ) : (
                <p className="mt-1 text-center text-xs text-subtle">{total} berita · semua sudah ditampilkan</p>
            )}
        </div>
    )
}

// Semua berita sekolah (GET /news), dibuka dari "Lihat semua" di Beranda. Kategori disimpan di `?kategori=`
// agar tetap terpilih saat kembali dari detail berita.
export default function Berita() {
    const goBack = useGoBack('/')
    const [searchParams, setSearchParams] = useSearchParams()
    const categoryParam = searchParams.get('kategori')
    const category = isNewsCategory(categoryParam) ? categoryParam : null

    function selectCategory(next: NewsCategory | null) {
        setSearchParams(next ? { kategori: next } : {}, { replace: true })
    }

    return (
        <FocusPage
            title="Berita Sekolah"
            subtitle="Pengumuman, kegiatan, dan prestasi dari sekolah."
            onBack={goBack}
            headerExtra={(
                <div role="group" aria-label="Kategori berita" className="relative -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
                    {newsCategoryOptions.map((item) => {
                        const isActive = item.value === category

                        return (
                            <button
                                key={item.label}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => selectCategory(item.value)}
                                className={cn(
                                    'h-[38px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-extrabold transition-colors',
                                    isActive ? 'bg-white text-brand-dark' : 'bg-white/[0.18] text-white'
                                )}>
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            )}>
            <div className="relative -mt-9 flex flex-col px-5">
                <NewsFeed category={category} />
            </div>
        </FocusPage>
    )
}
