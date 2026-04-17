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
            {items.map((item) => (
                <Card key={item.id}>
                    <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{item.date}</p>
                            <h3 className="text-base font-semibold">{item.subject ?? 'Kehadiran Harian'}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{item.note ?? 'Tercatat oleh sistem akademik utama.'}</p>
                        </div>
                        <StatusBadge label={item.status} tone={toneForStatus(item.status)} />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
