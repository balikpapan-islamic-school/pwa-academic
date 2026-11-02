import { Mail, Phone, UserRound, UsersRound } from 'lucide-react'
import { FocusPage } from '@/components/kit/focus-page'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { LoadingRegion } from '@/components/shared/skeletons'
import { repeat } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudent } from '@/contexts/StudentContext'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { academicService } from '@/services'

const relationLabels: Record<string, string> = { ayah: 'Ayah', ibu: 'Ibu', wali: 'Wali' }

function relationLabel(relation: string) {
    return relationLabels[relation.toLowerCase()] ?? relation
}

// Data orang tua / wali peserta didik dari GET /me/guardians (hanya baca, diubah lewat Tata Usaha).
export default function DataWali() {
    const goBack = useGoBack('/profil')
    const { activeStudent } = useStudent()
    const studentId = activeStudent?.id ?? ''
    const guardians = useApiData(studentId ? () => academicService.getGuardians(studentId) : null, [studentId])

    return (
        <FocusPage title="Data Orang Tua / Wali" subtitle={activeStudent ? `Untuk ${activeStudent.name}` : undefined} onBack={goBack}>
            <div className="relative -mt-9 flex flex-col gap-3 px-5">
                {guardians.data ? guardians.data.length > 0 ? guardians.data.map((guardian) => (
                    <section key={`${guardian.relation}-${guardian.name}`} className="rounded-3xl bg-card p-4 shadow-soft">
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pastel-violet text-primary">
                                <UserRound className="size-5" />
                            </span>
                            <span className="flex min-w-0 flex-grow flex-col">
                                <span className="text-xs font-extrabold uppercase tracking-[0.4px] text-subtle">{relationLabel(guardian.relation)}</span>
                                <span className="truncate text-[15px] font-extrabold">{guardian.name}</span>
                            </span>
                            <span className={guardian.hasAppAccount
                                ? 'shrink-0 rounded-full bg-pastel-mint px-2.5 py-1 text-xs font-extrabold text-pastel-mint-fg'
                                : 'shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-extrabold text-subtle'}>
                                {guardian.hasAppAccount ? 'Pakai aplikasi' : 'Belum pakai aplikasi'}
                            </span>
                        </div>
                        <dl className="mt-3 flex flex-col rounded-2xl bg-[#F1F6F1] px-3.5 py-1">
                            <div className="flex items-center gap-3 border-b border-[#DDE6DE] py-2.5">
                                <dt className="flex w-24 shrink-0 items-center gap-1.5 text-[13px] font-bold text-subtle"><Phone className="size-4" />No. HP</dt>
                                <dd className="min-w-0 flex-grow break-words text-right text-sm font-bold">{guardian.phone ?? '-'}</dd>
                            </div>
                            <div className="flex items-center gap-3 py-2.5">
                                <dt className="flex w-24 shrink-0 items-center gap-1.5 text-[13px] font-bold text-subtle"><Mail className="size-4" />Email</dt>
                                <dd className="min-w-0 flex-grow break-words text-right text-sm font-bold">{guardian.email ?? '-'}</dd>
                            </div>
                        </dl>
                    </section>
                )) : (
                    <EmptyState icon={UsersRound} tone="violet" title="Belum ada data orang tua / wali" description="Hubungi Tata Usaha sekolah untuk melengkapi data." className="shadow-soft" />
                ) : guardians.status === 'error' ? (
                    <LoadErrorState title="Data orang tua / wali belum dapat dimuat" onRetry={guardians.reload} className="shadow-soft" />
                ) : (
                    <LoadingRegion label="Memuat data orang tua / wali" className="gap-3">
                        {repeat(2, (index) => (
                            <div key={index} className="rounded-3xl bg-card p-4 shadow-soft">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-11 shrink-0 rounded-full" />
                                    <div className="flex flex-grow flex-col gap-2.5">
                                        <Skeleton className="h-2.5 w-12" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                    <Skeleton className="h-6 w-[90px] shrink-0 rounded-full" />
                                </div>
                                <div className="mt-3 rounded-2xl bg-[#F1F6F1] px-3.5 py-1">
                                    {repeat(2, (row) => (
                                        <div key={row} className="flex items-center justify-between gap-3 border-b border-[#DDE6DE] py-3.5 last:border-b-0">
                                            <Skeleton className="h-3 w-16 bg-border" />
                                            <Skeleton className="h-3.5 w-32 bg-border" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </LoadingRegion>
                )}
                <p className="mt-1 text-center text-xs text-subtle">Perubahan data dilakukan melalui Tata Usaha sekolah.</p>
            </div>
        </FocusPage>
    )
}
