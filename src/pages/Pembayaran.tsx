import { ArrowRight, CalendarClock, CreditCard, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paymentHistory, upcomingPayments } from '@/lib/mock-payments'

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export default function Pembayaran() {
    const totalUpcoming = upcomingPayments.reduce((sum, item) => sum + item.amount, 0)
    const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0)
    const nearestPayment = upcomingPayments[0]

    const summaryCards = [
        {
            title: 'Tagihan Aktif',
            value: `${upcomingPayments.length}`,
            helper: nearestPayment ? `jatuh tempo terdekat ${nearestPayment.dueDate}` : 'tidak ada tagihan aktif',
            icon: CalendarClock,
        },
        {
            title: 'Total Tagihan',
            value: formatCurrency(totalUpcoming),
            helper: 'pembayaran yang akan datang',
            icon: CreditCard,
        },
        {
            title: 'Pembayaran Selesai',
            value: formatCurrency(totalPaid),
            helper: `${paymentHistory.length} transaksi tercatat`,
            icon: ReceiptText,
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Pembayaran</PageHeaderHeading>
                <PageHeaderDescription>Pantau tagihan aktif, cek riwayat pembayaran, dan lanjutkan pembayaran melalui virtual account.</PageHeaderDescription>
            </PageHeader>

            <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg">
                <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:p-8">
                    <div className="space-y-3 sm:space-y-4">
                        <p className="text-xs font-medium text-emerald-50/90 sm:text-sm">Ringkasan Keuangan Siswa</p>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Pembayaran lebih ringkas dan terpantau</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 lg:text-base">
                                Gunakan halaman ini untuk melihat tagihan yang belum dibayar, membuka instruksi virtual account, dan memantau transaksi yang sudah lunas.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {summaryCards.map((item) => (
                            <div key={item.title} className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm sm:p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-emerald-50/80">{item.title}</p>
                                        <p className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">{item.value}</p>
                                        <p className="mt-1 text-xs text-emerald-50/80">{item.helper}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/15 p-2.5 sm:p-3">
                                        <item.icon className="size-4.5 sm:size-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-4">
                <SectionHeading title="Pembayaran Yang Akan Datang" description="Pilih salah satu tagihan untuk membuka instruksi pembayaran virtual account." />
                <div className="space-y-3">
                    {upcomingPayments.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="py-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge label="Belum Dibayar" tone="warning" />
                                            <span className="text-xs text-muted-foreground">Jatuh tempo {item.dueDate}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold">{item.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                            <span>Periode: {item.period}</span>
                                            <span>Metode: {item.bank}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start gap-3 lg:items-end">
                                        <p className="text-xl font-semibold tracking-tight sm:text-2xl">{formatCurrency(item.amount)}</p>
                                        <Button asChild className="w-full sm:w-auto">
                                            <Link to={`/pembayaran/${item.id}`}>
                                                Bayar via VA
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <SectionHeading title="Riwayat Pembayaran" description="Catatan pembayaran yang sudah diterima dan dinyatakan lunas." />
                <div className="space-y-3">
                    {paymentHistory.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="py-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusBadge label={item.status} tone="success" />
                                            <span className="text-xs text-muted-foreground">{item.paidAt}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold">{item.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">Periode {item.period} · {item.method}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">No. kuitansi: {item.receiptNumber}</p>
                                    </div>

                                    <div className="lg:text-right">
                                        <p className="text-xl font-semibold tracking-tight sm:text-2xl">{formatCurrency(item.amount)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
