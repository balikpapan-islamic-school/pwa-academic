import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/status-badge'
import { ReportSummary } from '@/types/academic'

type ReportListProps = {
    items: ReportSummary[]
    onSelect: (reportId: string) => void
}

export function ReportList({ items, onSelect }: ReportListProps) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Card key={item.id}>
                    <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold">{item.semester}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Rata-rata {item.average} {item.publishedAt ? `· Terbit ${item.publishedAt}` : '· Menunggu finalisasi'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge label={item.status} tone={item.status === 'Final' ? 'success' : 'warning'} />
                            <Button variant="outline" asChild>
                                <Link to="/rapor" onClick={() => onSelect(item.id)}>Lihat Detail</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
