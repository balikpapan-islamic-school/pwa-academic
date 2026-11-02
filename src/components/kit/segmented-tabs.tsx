import { cn } from '@/lib/utils'

type SegmentedTabsProps<T extends string> = {
    label: string
    value: T
    options: Array<{ value: T, label: string }>
    onChange: (value: T) => void
    activeClassName?: string
}

export function SegmentedTabs<T extends string>({ label, value, options, onChange, activeClassName = 'bg-primary text-white' }: SegmentedTabsProps<T>) {
    return (
        <div role="tablist" aria-label={label} className="grid gap-1.5 rounded-full bg-card p-[5px]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            {options.map((option) => {
                const isActive = option.value === value

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.value)}
                        className={cn('h-[42px] rounded-full text-sm font-extrabold transition-colors', isActive ? activeClassName : 'text-subtle hover:text-ink')}>
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
