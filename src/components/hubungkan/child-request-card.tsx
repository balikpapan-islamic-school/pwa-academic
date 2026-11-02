import { ArrowRight, CircleCheck, Clock3, CircleX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ChildLinkRequest, ChildRequestStatus } from '@/lib/dummy-ui'
import { formatDate, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const statusStyles: Record<ChildRequestStatus, { icon: typeof Clock3, iconClassName: string, badgeClassName: string }> = {
    PENDING: { icon: Clock3, iconClassName: 'bg-pastel-sun text-pastel-sun-fg', badgeClassName: 'bg-pastel-sun text-[#6B4A00]' },
    APPROVED: { icon: CircleCheck, iconClassName: 'bg-pastel-mint text-pastel-mint-fg', badgeClassName: 'bg-pastel-mint text-pastel-mint-fg' },
    REJECTED: { icon: CircleX, iconClassName: 'bg-pastel-coral text-[#B3362F]', badgeClassName: 'bg-pastel-coral text-[#7A2E29]' },
}

const resubmitClassName = 'flex h-10 items-center gap-1.5 self-start rounded-full border-2 border-border px-4 text-[13px] font-extrabold text-primary'

// "6471000000000001" -> "6471 •••• •••• 0001"; NIK lengkap tidak perlu tampil ulang.
function maskNik(nik: string) {
    return `${nik.slice(0, 4)} •••• •••• ${nik.slice(-4)}`
}

type ChildRequestCardProps = {
    request: ChildLinkRequest
    // Tanpa onResubmit, "Ajukan Ulang" membuka halaman Hubungkan Peserta Didik.
    onResubmit?: (request: ChildLinkRequest) => void
    // `false` menyembunyikan "Ajukan Ulang", mis. selama pengajuan pertama masih menunggu verifikasi.
    canResubmit?: boolean
}

export function ChildRequestCard({ request, onResubmit, canResubmit = true }: ChildRequestCardProps) {
    const style = statusStyles[request.status]
    const Icon = style.icon

    return (
        <article className="flex flex-col gap-2.5 rounded-[20px] bg-card p-3.5">
            <div className="flex items-start gap-3">
                <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[14px]', style.iconClassName)}>
                    <Icon className="size-[22px]" />
                </span>
                <div className="flex min-w-0 flex-grow flex-col gap-0.5">
                    <h3 className="truncate text-[15px] font-extrabold">
                        {request.student ? request.student.name : `NIK ${maskNik(request.nik)}`}
                    </h3>
                    <p className="text-[13px] text-subtle">
                        Lahir {formatDate(parseIsoDate(request.birthDate))} · {request.relationship}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-extrabold', style.badgeClassName)}>{request.statusLabel}</span>
                        <span className="text-xs text-subtle">Diajukan {formatDate(new Date(request.submittedAt))}</span>
                    </div>
                </div>
            </div>
            {request.status === 'REJECTED' ? (
                <>
                    {request.note ? (
                        <p className="rounded-xl bg-[#FDF1F0] px-3 py-2 text-[13px] leading-snug text-[#7A2E29]">
                            <span className="font-extrabold">Catatan admin:</span> {request.note}
                        </p>
                    ) : null}
                    {!canResubmit ? null : onResubmit ? (
                        <button type="button" onClick={() => onResubmit(request)} className={resubmitClassName}>
                            Ajukan Ulang
                            <ArrowRight className="size-4" strokeWidth={2.4} />
                        </button>
                    ) : (
                        <Link to="/hubungkan-anak" state={{ resubmit: request }} className={resubmitClassName}>
                            Ajukan Ulang
                            <ArrowRight className="size-4" strokeWidth={2.4} />
                        </Link>
                    )}
                </>
            ) : null}
        </article>
    )
}
