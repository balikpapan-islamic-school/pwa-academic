import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewsList, NewsListSkeleton } from '@/components/news/news-list'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { useApiData } from '@/hooks/use-api-data'
import { newsCategoryLabels, newsCategoryOptions } from '@/lib/news'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { NewsCategory } from '@/types/academic'

export function SchoolNews() {
    const [category, setCategory] = useState<NewsCategory | null>(null)
    const news = useApiData(() => academicService.getNews({ category: category ?? undefined, perPage: 3 }), [category])

    return (
        <section aria-labelledby="berita-h" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 id="berita-h" className="font-display text-xl font-semibold">Berita Sekolah</h2>
                <Link to={category ? `/berita?kategori=${category}` : '/berita'} className="flex min-h-11 items-center text-sm font-bold text-subtle">Lihat semua</Link>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
                {newsCategoryOptions.map((item) => {
                    const isActive = item.value === category

                    return (
                        <button
                            key={item.label}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setCategory(item.value)}
                            className={cn('h-[38px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-extrabold', isActive ? 'bg-ink text-white' : 'border-2 border-border bg-card text-[#44544A]')}>
                            {item.label}
                        </button>
                    )
                })}
            </div>

            {news.data && news.data.items.length > 0 ? (
                <NewsList items={news.data.items} />
            ) : news.data ? (
                <EmptyState icon={Newspaper} tone="sky" title="Belum ada berita" description={category ? `Belum ada berita ${newsCategoryLabels[category].toLowerCase()} untuk saat ini.` : 'Kabar terbaru dari sekolah akan tampil di sini.'} />
            ) : news.status === 'error' ? (
                <LoadErrorState layout="inline" title="Berita belum dapat dimuat" onRetry={news.reload} />
            ) : (
                <NewsListSkeleton />
            )}
        </section>
    )
}
