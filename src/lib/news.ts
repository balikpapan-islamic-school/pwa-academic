import { NewsCategory } from '@/types/academic'

export const newsCategoryLabels: Record<NewsCategory, string> = { pengumuman: 'Pengumuman', kegiatan: 'Kegiatan', prestasi: 'Prestasi' }

export const newsCategoryTones: Record<NewsCategory, { bg: string, fg: string }> = {
    pengumuman: { bg: 'bg-pastel-sun', fg: 'text-pastel-sun-fg' },
    kegiatan: { bg: 'bg-pastel-violet', fg: 'text-pastel-violet-fg' },
    prestasi: { bg: 'bg-pastel-coral', fg: 'text-pastel-coral-fg' },
}
