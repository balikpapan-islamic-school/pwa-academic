import { ArrowLeft, Copy, Landmark, ShieldCheck, TimerReset } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { SectionHeading } from '@/components/shared/section-heading'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getUpcomingPaymentById } from '@/lib/mock-payments'

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export default function PembayaranVirtualAccount() {
    const { paymentId } = useParams()
    const payment = getUpcomingPaymentById(paymentId)

    if (!payment) {
        return <Navigate to="/pembayaran" replace />
    }

    const summaryItems = [
        { title: 'Nomor VA', value: payment.virtualAccountNumber, helper: payment.bank, icon: Landmark },
        { title: 'Jatuh Tempo', value: payment.dueDate, helper: 'pastikan dibayar sebelum tanggal ini', icon: TimerReset },
        { title: 'Status', value: 'Menunggu Pembayaran', helper: 'akan diperbarui setelah verifikasi', icon: ShieldCheck },
    ]

    return (
        <div className="space-y-6">
            <PageHeader>
                <Button variant="ghost" asChild className="mb-2 w-fit px-0 text-muted-foreground hover:bg-transparent">
                    <Link to="/pembayaran">
                        <ArrowLeft className="size-4" />
                        Kembali ke pembayaran
                    </Link>
                </Button>
                <PageHeaderHeading>Pembayaran Virtual Account</PageHeaderHeading>
                <PageHeaderDescription>Gunakan nomor virtual account di bawah ini untuk menyelesaikan pembayaran tagihan yang dipilih.</PageHeaderDescription>
            </PageHeader>

            <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-lg">
                <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:p-8">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge label="Belum Dibayar" tone="warning" />
                            <span className="text-xs text-slate-300">{payment.period}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">{payment.title}</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">{payment.description}</p>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm sm:p-5">
                        <p className="text-xs uppercase tracking-wide text-slate-300">Total pembayaran</p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{formatCurrency(payment.amount)}</p>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:mt-5 sm:p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-300">Virtual Account</p>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="break-all text-base font-semibold tracking-[0.16em] sm:text-lg sm:tracking-[0.2em]">{payment.virtualAccountNumber}</p>
                                <Button variant="secondary" size="sm" type="button" className="w-full sm:w-auto">
                                    <Copy className="size-4" />
                                    Salin
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                {summaryItems.map((item) => (
                    <Card key={item.title}>
                        <CardContent className="py-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">{item.title}</p>
                                    <p className="mt-2 break-all text-base font-semibold tracking-tight sm:text-lg">{item.value}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                                </div>
                                <div className="rounded-2xl bg-muted/70 p-3">
                                    <item.icon className="size-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <section className="space-y-4">
                    <SectionHeading title="Rincian Tagihan" description="Komponen pembayaran yang termasuk dalam total tagihan ini." />
                    <Card>
                        <CardContent className="space-y-4 py-5">
                            {payment.items.map((item) => (
                                <div key={item.label} className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                                </div>
                            ))}

                            <div className="flex items-center justify-between gap-4 border-t pt-4 text-base font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(payment.amount)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <SectionHeading title="Instruksi Pembayaran" description="Langkah sederhana untuk menyelesaikan pembayaran melalui virtual account." />
                    <Card>
                        <CardContent className="space-y-4 py-5">
                            {payment.instructions.map((item, index) => (
                                <div key={`${payment.id}-${index}`} className="flex items-start gap-4">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <p className="pt-1 text-sm leading-6 text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
