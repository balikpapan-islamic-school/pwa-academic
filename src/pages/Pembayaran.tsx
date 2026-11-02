import { useState } from 'react'
import { ArrowRight, CircleCheck, CircleHelp, Wallet } from 'lucide-react'
import { CompactBarIconButton } from '@/components/kit/compact-top-bar'
import { HeroCard } from '@/components/kit/hero-card'
import { ScreenHeader } from '@/components/kit/screen-header'
import { SegmentedTabs } from '@/components/kit/segmented-tabs'
import { dummyBills, dummyPaidBills, dummyPaymentMethods } from '@/lib/dummy-ui'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

type PaymentTab = 'tagihan' | 'riwayat'

function scrollToMethods() {
    document.getElementById('metode')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Pembayaran() {
    const [tab, setTab] = useState<PaymentTab>('tagihan')
    const [method, setMethod] = useState(dummyPaymentMethods[0].id)
    const totalBills = dummyBills.reduce((sum, bill) => sum + bill.amount, 0)

    return (
        <div className="flex flex-col gap-[18px]">
            <ScreenHeader
                title="Pembayaran"
                action={(
                    <button type="button" aria-label="Bantuan pembayaran" className="flex size-11 items-center justify-center rounded-full bg-card shadow-chip">
                        <CircleHelp className="size-[22px]" />
                    </button>
                )}
                compactAction={<CompactBarIconButton label="Bantuan pembayaran"><CircleHelp className="size-5" /></CompactBarIconButton>}
            />

            <HeroCard>
                <p className="text-sm font-bold text-brand-soft">Total Tagihan Aktif</p>
                <p className="mt-1.5 font-display text-[34px] font-bold">{formatCurrency(totalBills)}</p>
                <p className="mt-1 text-[13px] text-brand-soft">{dummyBills.length} tagihan · jatuh tempo terdekat {dummyBills[0].due}</p>
                <button type="button" onClick={scrollToMethods} className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white text-base font-extrabold text-brand-dark">
                    Bayar Semua
                    <ArrowRight className="size-5" strokeWidth={2.4} />
                </button>
            </HeroCard>

            <SegmentedTabs
                label="Daftar pembayaran"
                value={tab}
                options={[{ value: 'tagihan', label: 'Tagihan' }, { value: 'riwayat', label: 'Riwayat' }]}
                onChange={setTab}
                activeClassName="bg-ink text-white"
            />

            <div className="flex flex-col gap-2.5">
                {tab === 'tagihan' ? dummyBills.map((bill) => (
                    <div key={bill.id} className="flex flex-col gap-3 rounded-[22px] bg-card p-4">
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className={cn('flex size-[46px] shrink-0 items-center justify-center rounded-[14px]', bill.tone)}>
                                <Wallet className="size-[22px]" />
                            </span>
                            <span className="flex min-w-0 flex-grow flex-col gap-0.5">
                                <span className="text-[15px] font-extrabold">{bill.title}</span>
                                <span className="text-[13px] text-subtle">Jatuh tempo {bill.due}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-pastel-sun px-2.5 py-1.5 text-xs font-extrabold text-[#6B4A00]">Belum Bayar</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-[#D3DED5] pt-3">
                            <span className="font-display text-[19px] font-semibold">{formatCurrency(bill.amount)}</span>
                            <button type="button" onClick={scrollToMethods} className="flex h-11 items-center rounded-full bg-primary px-[18px] text-sm font-extrabold text-white">Bayar</button>
                        </div>
                    </div>
                )) : dummyPaidBills.map((bill) => (
                    <div key={bill.id} className="flex flex-col gap-3 rounded-[22px] bg-card p-4">
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="flex size-[46px] shrink-0 items-center justify-center rounded-[14px] bg-pastel-mint text-[#0F7A73]">
                                <CircleCheck className="size-[22px]" />
                            </span>
                            <span className="flex min-w-0 flex-grow flex-col gap-0.5">
                                <span className="text-[15px] font-extrabold">{bill.title}</span>
                                <span className="text-[13px] text-subtle">Dibayar {bill.paidAt} · {bill.method}</span>
                            </span>
                            <span className="shrink-0 rounded-full bg-pastel-mint px-2.5 py-1.5 text-xs font-extrabold text-pastel-mint-fg">Lunas</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed border-[#D3DED5] pt-3">
                            <span className="font-display text-[19px] font-semibold">{formatCurrency(bill.amount)}</span>
                            <button type="button" className="flex h-11 items-center rounded-full bg-background px-[18px] text-sm font-extrabold text-brand-dark">Lihat Kuitansi</button>
                        </div>
                    </div>
                ))}
            </div>

            <section id="metode" aria-labelledby="metode-h" className="flex scroll-mt-6 flex-col gap-2.5">
                <h2 id="metode-h" className="font-display text-[19px] font-semibold">Metode Pembayaran</h2>
                <div role="radiogroup" aria-labelledby="metode-h" className="flex flex-col gap-2">
                    {dummyPaymentMethods.map((item) => {
                        const isSelected = item.id === method

                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setMethod(item.id)}
                                className={cn('flex min-h-[68px] w-full items-center gap-3 rounded-[20px] border-2 bg-card px-3.5 py-2.5 transition-colors', isSelected ? 'border-primary' : 'border-card')}>
                                <span aria-hidden="true" className={cn('flex size-[42px] items-center justify-center rounded-xl font-display text-sm font-bold', item.className)}>{item.short}</span>
                                <span className="flex flex-grow flex-col gap-0.5 text-left">
                                    <span className="text-[15px] font-extrabold">{item.name}</span>
                                    <span className="text-xs text-subtle">{item.description}</span>
                                </span>
                                <span aria-hidden="true" className={cn('flex size-6 items-center justify-center rounded-full border-2', isSelected ? 'border-primary' : 'border-[#B5C2B8]')}>
                                    <span className={cn('size-3 rounded-full', isSelected ? 'bg-primary' : 'bg-transparent')} />
                                </span>
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
