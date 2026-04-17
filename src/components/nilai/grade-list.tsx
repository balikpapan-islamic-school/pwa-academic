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
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                            <CardTitle className="text-base">{item.subject}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">{item.teacher}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold">{item.score}</p>
                            <StatusBadge label={item.predicate} tone="info" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {item.components.map((component) => (
                            <div key={component.id} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
                                <div>
                                    <p className="font-medium">{component.name}</p>
                                    <p className="text-muted-foreground">Bobot {component.weight}%</p>
                                </div>
                                <div className="inline-flex items-center gap-2 font-semibold">
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
