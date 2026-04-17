import { cn } from '@/lib/utils'

type StatusBadgeProps = {
    label: string
    tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}

const toneClassMap: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    neutral: 'bg-muted text-muted-foreground',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', toneClassMap[tone])}>
            {label}
        </span>
    )
}
