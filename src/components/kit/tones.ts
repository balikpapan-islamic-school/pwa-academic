// Pastel per modul dari UI kit: latar, teks/ikon, dan warna bar progres.
export type Tone = {
    bg: string
    fg: string
    bar: string
}

export const moduleTones: Tone[] = [
    { bg: 'bg-pastel-violet', fg: 'text-pastel-violet-fg', bar: 'bg-[#8F7CF2]' },
    { bg: 'bg-pastel-mint', fg: 'text-pastel-mint-fg', bar: 'bg-[#38B0A5]' },
    { bg: 'bg-pastel-coral', fg: 'text-pastel-coral-fg', bar: 'bg-[#F0827A]' },
    { bg: 'bg-pastel-sun', fg: 'text-pastel-sun-fg', bar: 'bg-[#F2B630]' },
    { bg: 'bg-pastel-sky', fg: 'text-pastel-sky-fg', bar: 'bg-[#5E9BEA]' },
]

export function toneAt(index: number) {
    return moduleTones[index % moduleTones.length]
}
