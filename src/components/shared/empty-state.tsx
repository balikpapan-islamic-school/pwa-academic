import { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
    title: string
    description: string
    icon: LucideIcon
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
