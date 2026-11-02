import { FileText, Newspaper, SearchX } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { FocusPage } from '@/components/kit/focus-page'
import { NewsContent } from '@/components/news/news-content'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { LoadingRegion } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { formatLongDate, parseIsoDateTime } from '@/lib/format'
import { hasNewsText, newsCategoryLabels, newsCategoryTones } from '@/lib/news'
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
                {news.status === 'error' ? (
                    isNotFound ? (
                        <EmptyState icon={SearchX} tone="sky" title="Berita tidak ditemukan" description="Berita ini mungkin sudah dihapus atau dipindahkan." className="relative mx-5 -mt-9 rounded-[28px] shadow-float" />
                    ) : (
                        <LoadErrorState title="Berita belum dapat dimuat" onRetry={news.reload} className="relative mx-5 -mt-9 rounded-[28px] shadow-float" />
                    )
                ) : (
                    // Bentuk sama dengan artikel: sampul selebar kartu lalu paragraf.
                    <LoadingRegion label="Memuat berita" className="relative mx-5 -mt-9 gap-4 overflow-hidden rounded-[28px] bg-card pb-[22px] shadow-float">
                        <Skeleton className="h-[150px] rounded-none" />
                        <div className="flex flex-col gap-3 px-5">
                            {['w-full', 'w-11/12', 'w-full', 'w-3/4', 'w-full', 'w-2/3'].map((width, index) => <Skeleton key={index} className={cn('h-3.5', width)} />)}
                        </div>
                    </LoadingRegion>
                )}
            </FocusPage>
        )
    }

    const tone = newsCategoryTones[article.category]
    const summary = article.summary.trim()
    const hasContent = hasNewsText(article.content)

    return (
        <FocusPage
            title={article.title}
            subtitle={[formatLongDate(parseIsoDateTime(article.publishedAt)), article.author].filter(Boolean).join(' · ')}
            onBack={goBack}
            backgroundImageUrl={article.coverImageUrl}
            headerExtra={(
                <span className="relative mt-3 self-start inline-block rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-brand-dark">
                    {newsCategoryLabels[article.category]}
                </span>
            )}>
            <article className={cn('relative mx-5 -mt-9 flex flex-col gap-4 overflow-hidden rounded-[28px] bg-card pb-[22px] shadow-float', article.coverImageUrl && 'pt-[22px]')}>
                {/* Sampul sudah menjadi latar header; tanpa sampul, kartu memakai ilustrasi kategori. */}
                {article.coverImageUrl ? null : (
                    <div aria-hidden="true" className={cn('flex h-[150px] items-center justify-center', tone.bg, tone.fg)}>
                        <Newspaper className="size-12" strokeWidth={1.6} />
                    </div>
                )}
                <div className="flex flex-col gap-4 px-5">
                    {/* Ringkasan tampil sebagai paragraf pembuka; tanpa isi lengkap, ringkasan menjadi seluruh isi berita. */}
                    {summary ? (
                        <p className={cn('whitespace-pre-line leading-relaxed', hasContent ? 'border-l-4 border-primary pl-3.5 text-base font-bold text-[#44544A]' : 'text-[15px]')}>
                            {summary}
                        </p>
                    ) : null}
                    {hasContent ? <NewsContent content={article.content} /> : null}
                    {!summary && !hasContent ? (
                        <EmptyState layout="inline" icon={FileText} tone="sky" title="Isi berita belum tersedia" description="Sekolah belum menuliskan detail untuk berita ini." className="bg-[#F1F6F1]" />
                    ) : null}
                </div>
            </article>
        </FocusPage>
    )
}
