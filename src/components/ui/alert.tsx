import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
    'relative w-full rounded-xl border px-4 py-4 text-sm [&>svg~*]:pl-11 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
    return (
        <h5
            className={cn('mb-1 font-medium leading-none tracking-tight', className)}
            {...props}
        />
    )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('text-muted-foreground text-sm [&_p]:leading-relaxed', className)}
            {...props}
        />
    )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('mt-4 flex items-center gap-2 md:absolute md:right-4 md:top-4 md:mt-0', className)}
            {...props}
        />
    )
}

export { Alert, AlertAction, AlertDescription, AlertTitle }
