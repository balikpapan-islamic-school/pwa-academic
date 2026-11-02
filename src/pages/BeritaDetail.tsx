import { Newspaper } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { FocusPage } from '@/components/kit/focus-page'
import { NewsContent } from '@/components/news/news-content'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { formatLongDate, parseIsoDateTime } from '@/lib/format'
import { newsCategoryLabels, newsCategoryTones } from '@/lib/news'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { ApiError } from '@/services/api-client'

// Detail berita dari GET /news/{id}; dibuka dari kartu Berita Sekolah di Beranda.
export default function BeritaDetail() {
    const { newsId = '' } = useParams()
    const goBack = useGoBack('/')
    const news = useApiData(() => academicService.getNewsDetail(newsId), [newsId])
    const article = news.data

    if (!article) {
        const isNotFound = news.error instanceof ApiError && news.error.status === 404

        return (
            <FocusPage title="Berita Sekolah" onBack={goBack}>
                <div className="relative mx-5 -mt-9 flex flex-col gap-3 rounded-[28px] bg-card px-5 py-[22px] shadow-float">
                    {news.status === 'error' ? (
                        <>
                            <p className="text-center text-sm text-subtle">
                                {isNotFound ? 'Berita tidak ditemukan atau sudah dihapus.' : 'Berita belum dapat dimuat. Periksa koneksi internet, lalu coba lagi.'}
                            </p>
                            {isNotFound ? null : (
                                <button type="button" onClick={news.reload} className="h-11 self-center rounded-full border-2 border-border px-5 text-sm font-extrabold text-primary">
                                    Coba lagi
                                </button>
                            )}
                        </>
                    ) : (
                        <div aria-busy="true" aria-label="Memuat berita" className="flex flex-col gap-3">
                            <Skeleton className="h-[180px] rounded-2xl" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    )}
                </div>
            </FocusPage>
        )
    }

    const tone = newsCategoryTones[article.category]

    return (
        <FocusPage
            title={article.title}
            subtitle={[formatLongDate(parseIsoDateTime(article.publishedAt)), article.author].filter(Boolean).join(' · ')}
            onBack={goBack}
            headerExtra={(
                <span className="relative mt-3 inline-block rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-brand-dark">
                    {newsCategoryLabels[article.category]}
                </span>
            )}>
            <article className="relative mx-5 -mt-9 flex flex-col gap-4 overflow-hidden rounded-[28px] bg-card pb-[22px] shadow-float">
                {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt="" className="h-[200px] w-full object-cover" />
                ) : (
                    <div aria-hidden="true" className={cn('flex h-[150px] items-center justify-center', tone.bg, tone.fg)}>
                        <Newspaper className="size-12" strokeWidth={1.6} />
                    </div>
                )}
                <div className="flex flex-col gap-3 px-5">
                    {article.content ? <NewsContent content={article.content} /> : <p className="text-[15px] leading-relaxed">{article.summary}</p>}
                </div>
            </article>
        </FocusPage>
    )
}
