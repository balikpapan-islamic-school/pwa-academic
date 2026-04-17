import { AttendanceItem } from '@/types/academic'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'

type AttendanceListProps = {
    items: AttendanceItem[]
}

function toneForStatus(status: AttendanceItem['status']) {
    if (status === 'Hadir') return 'success'
    if (status === 'Sakit' || status === 'Izin') return 'warning'
    return 'danger'
}

export function AttendanceList({ items }: AttendanceListProps) {
    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <Card key={item.id}>
                    <CardContent className="py-5">
                        <div className="flex gap-4">
                            <div className="flex shrink-0 flex-col items-center">
                                <div className="flex min-h-14 min-w-14 flex-col items-center justify-center rounded-2xl bg-muted/70 px-2 text-center">
                                    <p className="text-[11px] font-medium uppercase text-muted-foreground">Hari</p>
                                    <p className="text-sm font-semibold">{item.date.split(' ')[0]}</p>
                                </div>
                                {index !== items.length - 1 ? <div className="mt-2 h-full w-px bg-border" /> : null}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground">{item.date}</p>
                                    <h3 className="mt-1 text-base font-semibold tracking-tight">{item.subject ?? 'Kehadiran Harian'}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.note ?? 'Tercatat oleh sistem akademik utama.'}</p>
                                </div>
                                <StatusBadge label={item.status} tone={toneForStatus(item.status)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
