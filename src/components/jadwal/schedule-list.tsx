import { Clock3, MapPin, User2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScheduleItem } from '@/types/academic'

type ScheduleListProps = {
    items: ScheduleItem[]
}

export function ScheduleList({ items }: ScheduleListProps) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Card key={item.id}>
                    <CardContent className="space-y-3 py-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-primary">{item.day}</p>
                                <h3 className="text-base font-semibold">{item.subject}</h3>
                            </div>
                            <div className="rounded-xl bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                                {item.startTime} - {item.endTime}
                            </div>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                            <p className="inline-flex items-center gap-2"><User2 className="size-4" />{item.teacher}</p>
                            <p className="inline-flex items-center gap-2"><MapPin className="size-4" />{item.room}</p>
                            <p className="inline-flex items-center gap-2 sm:col-span-2"><Clock3 className="size-4" />Sesi belajar {item.startTime} sampai {item.endTime}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
