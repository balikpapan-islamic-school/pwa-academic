import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Bingkai input bergaya UI kit: border tebal, cincin hijau saat fokus, merah saat tidak valid.
export function FieldShell({ invalid, children }: { invalid?: boolean, children: ReactNode }) {
    return (
        <div className={cn(
            'flex h-[54px] items-center gap-2.5 rounded-2xl border-2 bg-card pl-3.5 pr-1.5 text-[#5F6E64] transition-shadow focus-within:border-primary focus-within:shadow-[0_0_0_4px_#DCFCE7]',
            invalid ? 'border-destructive' : 'border-border'
        )}>
            {children}
        </div>
    )
}
