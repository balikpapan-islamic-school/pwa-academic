import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GradeItem } from '@/types/academic'
import { StatusBadge } from '@/components/shared/status-badge'

type GradeListProps = {
    items: GradeItem[]
}

export function GradeList({ items }: GradeListProps) {
    return (
        <div className="space-y-4">
            {items.map((item) => (
                <Card key={item.id}>
                    <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-base">{item.subject}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">{item.teacher}</p>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                            <p className="text-xl font-semibold sm:text-2xl">{item.score}</p>
                            <StatusBadge label={item.predicate} tone="info" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {item.components.map((component) => (
                            <div key={component.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm">
                                <div>
                                    <p className="font-medium">{component.name}</p>
                                    <p className="text-muted-foreground">Bobot {component.weight}%</p>
                                </div>
                                <div className="inline-flex shrink-0 items-center gap-2 font-semibold">
                                    {component.score}
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
