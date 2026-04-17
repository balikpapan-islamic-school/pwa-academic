import { Clock3, MapPin, User2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ScheduleItem } from '@/types/academic'

type ScheduleListProps = {
    items: ScheduleItem[]
}

export function ScheduleList({ items }: ScheduleListProps) {
    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <Card key={item.id}>
                    <CardContent className="py-5">
                        <div className="flex gap-4">
                            <div className="flex shrink-0 flex-col items-center">
                                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                                    {index + 1}
                                </div>
                                {index !== items.length - 1 ? <div className="mt-2 h-full w-px bg-border" /> : null}
                            </div>

                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-primary">{item.day}</p>
                                        <h3 className="text-base font-semibold tracking-tight md:text-lg">{item.subject}</h3>
                                    </div>
                                    <div className="inline-flex w-fit rounded-xl bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                                        {item.startTime} - {item.endTime}
                                    </div>
                                </div>

                                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                    <p className="inline-flex items-center gap-2"><User2 className="size-4" />{item.teacher}</p>
                                    <p className="inline-flex items-center gap-2"><MapPin className="size-4" />{item.room}</p>
                                    <p className="inline-flex items-center gap-2 sm:col-span-2"><Clock3 className="size-4" />Sesi belajar {item.startTime} sampai {item.endTime}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
