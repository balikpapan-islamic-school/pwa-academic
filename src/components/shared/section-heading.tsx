type SectionHeadingProps = {
    title: string
    description?: string
    action?: React.ReactNode
}

export function SectionHeading({ title, description, action }: SectionHeadingProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {action}
        </div>
    )
}
