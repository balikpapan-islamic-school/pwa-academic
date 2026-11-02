import { NewsCategory } from '@/types/academic'

export const newsCategoryLabels: Record<NewsCategory, string> = { pengumuman: 'Pengumuman', kegiatan: 'Kegiatan', prestasi: 'Prestasi' }

export const newsCategoryTones: Record<NewsCategory, { bg: string, fg: string }> = {
    pengumuman: { bg: 'bg-pastel-sun', fg: 'text-pastel-sun-fg' },
    kegiatan: { bg: 'bg-pastel-violet', fg: 'text-pastel-violet-fg' },
    prestasi: { bg: 'bg-pastel-coral', fg: 'text-pastel-coral-fg' },
}

export const newsCategoryOptions: Array<{ value: NewsCategory | null, label: string }> = [
    { value: null, label: 'Semua' },
    { value: 'pengumuman', label: 'Pengumuman' },
    { value: 'kegiatan', label: 'Kegiatan' },
    { value: 'prestasi', label: 'Prestasi' },
]

// True bila konten punya teks yang bisa dibaca; `<p></p>` atau spasi saja dianggap kosong.
export function hasNewsText(content: string | null | undefined) {
    if (!content?.trim()) {
        return false
    }

    return Boolean(new DOMParser().parseFromString(content, 'text/html').body.textContent?.trim())
}
