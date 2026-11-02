import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type HeroTone = 'primary' | 'ink'

const toneClasses: Record<HeroTone, { card: string, blobA: string, blobB: string }> = {
    primary: { card: 'bg-primary text-white', blobA: 'bg-brand-mid', blobB: 'bg-brand-dark' },
    ink: { card: 'bg-ink text-white', blobA: 'bg-[#2B2B2B]', blobB: 'bg-transparent' },
}

export function HeroCard({ tone = 'primary', className, children }: { tone?: HeroTone, className?: string, children: ReactNode }) {
    const classes = toneClasses[tone]

    return (
        <section className={cn('relative overflow-hidden rounded-[28px] p-5', classes.card, className)}>
            <div aria-hidden="true" className={cn('absolute -right-12 -top-12 size-[170px] rounded-full', classes.blobA)} />
            <div aria-hidden="true" className={cn('absolute -bottom-16 right-16 size-[120px] rounded-full', classes.blobB)} />
            <div className="relative">{children}</div>
        </section>
    )
}
