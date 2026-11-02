import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { DummyNewsCategory, dummyNews } from '@/lib/dummy-ui'
import { cn } from '@/lib/utils'

const categories: Array<'Semua' | DummyNewsCategory> = ['Semua', 'Pengumuman', 'Kegiatan', 'Prestasi']

const categoryTones: Record<DummyNewsCategory, { bg: string, fg: string }> = {
    Pengumuman: { bg: 'bg-pastel-sun', fg: 'text-pastel-sun-fg' },
    Kegiatan: { bg: 'bg-pastel-violet', fg: 'text-pastel-violet-fg' },
    Prestasi: { bg: 'bg-pastel-coral', fg: 'text-pastel-coral-fg' },
}

export function SchoolNews() {
    const [category, setCategory] = useState<'Semua' | DummyNewsCategory>('Semua')
    const filtered = dummyNews.filter((item) => category === 'Semua' || item.category === category)
    const list = filtered.length > 0 ? filtered : dummyNews
    const [featured, ...rest] = list

    return (
        <section aria-labelledby="berita-h" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 id="berita-h" className="font-display text-xl font-semibold">Berita Sekolah</h2>
                <button type="button" className="flex min-h-11 items-center text-sm font-bold text-subtle">Lihat semua</button>
            </div>
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
                {categories.map((name) => {
                    const isActive = name === category

                    return (
                        <button
                            key={name}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setCategory(name)}
                            className={cn('h-[38px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-extrabold', isActive ? 'bg-ink text-white' : 'border-2 border-border bg-card text-[#44544A]')}>
                            {name}
                        </button>
                    )
                })}
            </div>

            <article className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft">
                <div role="img" aria-label="Foto berita" className="relative flex h-[150px] items-center justify-center bg-pastel-sun text-[#7A5000]">
                    <Newspaper aria-hidden="true" className="size-12" strokeWidth={1.6} />
                    <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-extrabold text-white">{featured.category}</span>
                </div>
                <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3.5">
                    <h3 className="text-base font-extrabold leading-[1.35]">{featured.title}</h3>
                    <p className="text-[13px] text-subtle">{featured.date}</p>
                </div>
            </article>

            {rest.slice(0, 2).map((item) => {
                const tone = categoryTones[item.category]

                return (
                    <article key={item.id} className="flex items-center gap-3 rounded-[20px] bg-card p-3">
                        <span aria-hidden="true" className={cn('flex size-[72px] shrink-0 items-center justify-center rounded-2xl', tone.bg, tone.fg)}>
                            <Newspaper className="size-7" strokeWidth={1.8} />
                        </span>
                        <span className="flex min-w-0 flex-grow flex-col gap-1">
                            <span className={cn('text-[11px] font-extrabold uppercase tracking-[0.4px]', tone.fg)}>{item.category}</span>
                            <span className="text-sm font-extrabold leading-[1.35]">{item.title}</span>
                            <span className="text-xs text-subtle">{item.date}</span>
                        </span>
                    </article>
                )
            })}
        </section>
    )
}
