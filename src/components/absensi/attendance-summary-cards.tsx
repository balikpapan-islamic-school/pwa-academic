import { AttendanceSummary } from '@/types/academic'
import { DashboardSummaryCard } from '@/components/dashboard/dashboard-summary-card'
import { CheckCircle2, CircleSlash2, FileClock, HeartPulse } from 'lucide-react'

type AttendanceSummaryCardsProps = {
    summary: AttendanceSummary
}

export function AttendanceSummaryCards({ summary }: AttendanceSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardSummaryCard title="Hadir" description="Kehadiran aktif" value={String(summary.hadir)} helper="Hari efektif tercatat" icon={CheckCircle2} />
            <DashboardSummaryCard title="Sakit" description="Tidak hadir" value={String(summary.sakit)} helper="Perlu pemantauan" icon={HeartPulse} />
            <DashboardSummaryCard title="Izin" description="Tidak hadir dengan izin" value={String(summary.izin)} helper="Sesuai keterangan" icon={FileClock} />
            <DashboardSummaryCard title="Alfa" description="Tidak hadir tanpa keterangan" value={String(summary.alfa)} helper="Perlu perhatian" icon={CircleSlash2} />
        </div>
    )
}
