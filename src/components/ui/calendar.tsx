import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { DayPicker, getDefaultClassNames, type DayButton } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = 'label',
    buttonVariant = 'ghost',
    formatters,
    components,
    ...props
}: React.ComponentProps<typeof DayPicker> & {
    buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
    const defaultClassNames = getDefaultClassNames()

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn(
                'group/calendar bg-background p-3 [--cell-size:2.85rem] md:[--cell-size:3.15rem]',
                className
            )}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
                ...formatters,
            }}
            classNames={{
                root: cn('w-full', defaultClassNames.root),
                months: cn('relative flex flex-col gap-4', defaultClassNames.months),
                month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
                nav: cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', defaultClassNames.nav),
                button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
                    defaultClassNames.button_next
                ),
                month_caption: cn('flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)', defaultClassNames.month_caption),
                caption_label: cn('text-sm font-medium select-none', defaultClassNames.caption_label),
                table: 'w-full border-collapse',
                weekdays: cn('flex', defaultClassNames.weekdays),
                weekday: cn('flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none', defaultClassNames.weekday),
                week: cn('mt-2 flex w-full', defaultClassNames.week),
                day: cn(
                    'group/day relative aspect-square h-full w-full p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
                    defaultClassNames.day
                ),
                today: cn('rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none', defaultClassNames.today),
                outside: cn('text-muted-foreground opacity-50 aria-selected:text-muted-foreground', defaultClassNames.outside),
                disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
                hidden: cn('invisible', defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ className, orientation, ...iconProps }) => {
                    if (orientation === 'left') {
                        return <ChevronLeftIcon className={cn('size-4', className)} {...iconProps} />
                    }

                    return <ChevronRightIcon className={cn('size-4', className)} {...iconProps} />
                },
                DayButton: CalendarDayButton,
                ...components,
            }}
            {...props}
        />
    )
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames()
    const ref = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
        if (modifiers.focused) {
            ref.current?.focus()
        }
    }, [modifiers.focused])

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={modifiers.selected}
            className={cn(
                'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-xl leading-none font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70',
                defaultClassNames.day,
                className
            )}
            {...props}
        />
    )
}

export { Calendar }
