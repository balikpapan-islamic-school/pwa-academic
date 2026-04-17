import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type DashboardSummaryCardProps = {
    title: string
    description: string
    value: string
    helper: string
    icon: LucideIcon
}

export function DashboardSummaryCard({ title, description, value, helper, icon: Icon }: DashboardSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <div className="rounded-xl bg-muted p-2">
                    <Icon className="size-4 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
            </CardContent>
        </Card>
    )
}
