import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EntryDetail, EntryResult, GradeFileViewer, NewBadge } from '@/components/akademik/grade-entry'
import { FocusPage } from '@/components/kit/focus-page'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { LoadingRegion } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudent } from '@/contexts/StudentContext'
import { useApiData } from '@/hooks/use-api-data'
import { useGoBack } from '@/hooks/use-go-back'
import { formatDate, monthNames, parseIsoDateTime } from '@/lib/format'
import { byNewest, countLabel, isNewGrade, subjectTone } from '@/lib/grades'
import { cn, repeat } from '@/lib/utils'
import { academicService } from '@/services'
import { FileGradeEntry, GradeEntry } from '@/types/academic'

function groupByMonth(entries: GradeEntry[]) {
    const groups: Array<{ label: string, entries: GradeEntry[] }> = []

    for (const entry of [...entries].sort(byNewest)) {
        const date = parseIsoDateTime(entry.publishedAt)
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        const group = groups.at(-1)

        if (group?.label === label) {
            group.entries.push(entry)
        } else {
            groups.push({ label, entries: [entry] })
        }
    }

    return groups
}

function HeaderChip({ children }: { children: string }) {
    return <span className="rounded-full bg-white/[0.18] px-3 py-1.5 text-xs font-extrabold text-white">{children}</span>
}

// Semua nilai satu mapel pada satu semester. GET /grades/entries belum punya filter mapel,
// jadi entry semester dimuat lalu disaring di sini (cukup kecil, satu semester dikirim sekaligus).
export default function NilaiMapel() {
    const { subjectId = '' } = useParams()
    const [searchParams] = useSearchParams()
    const semesterId = searchParams.get('semester') ?? undefined
    const goBack = useGoBack(`/akademik${semesterId ? `?semester=${encodeURIComponent(semesterId)}` : ''}`)
    const { activeStudent } = useStudent()
    const studentId = activeStudent?.id ?? ''
    const [viewedFile, setViewedFile] = useState<FileGradeEntry | null>(null)
    const data = useApiData(
        studentId
            ? () => Promise.all([
                academicService.getGradeEntries(studentId, semesterId),
                academicService.getSubjects(studentId, semesterId),
                academicService.getSemesters(studentId),
            ])
            : null,
        [studentId, semesterId]
    )

    const [allEntries, subjects, semesters] = data.data ?? [[], [], []]
    const entries = allEntries.filter((entry) => entry.subject.id === subjectId)
    const subject = entries[0]?.subject
    const listedSubject = subjects.find((item) => item.id === subjectId)
    const semester = semesters.find((item) => (semesterId ? item.id === semesterId : item.isActive))
    const title = subject?.name ?? listedSubject?.name ?? 'Nilai Mapel'
    const teacher = subject?.teacherName ?? listedSubject?.teacherName
    const tone = subjectTone(subjects, subjectId)

    return (
        <FocusPage
            title={title}
            subtitle={[teacher, semester ? `Semester ${semester.name} ${semester.schoolYear}` : null].filter(Boolean).join(' · ') || undefined}
            onBack={goBack}
            headerExtra={entries.length > 0 ? (
                <div className="relative mt-3.5 flex flex-wrap gap-2">
                    <HeaderChip>{countLabel(entries)}</HeaderChip>
                </div>
            ) : undefined}>
            <div className="relative -mt-9 flex flex-col gap-4 px-5">
                {data.status === 'loading' ? (
                    <LoadingRegion label="Memuat nilai">
                        <Skeleton tone="inverse" className="my-1 ml-1 h-3 w-28" />
                        {repeat(3, (index) => (
                            <div key={index} className="flex gap-3 rounded-[20px] bg-card p-3.5 shadow-soft">
                                <Skeleton className="w-1.5 shrink-0 self-stretch rounded-full" />
                                <div className="flex flex-grow flex-col gap-2.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-9 self-center rounded-lg" />
                            </div>
                        ))}
                    </LoadingRegion>
                ) : data.status === 'error' ? (
                    <LoadErrorState title="Nilai belum dapat dimuat" onRetry={data.reload} className="shadow-soft" />
                ) : entries.length === 0 ? (
                    <EmptyState icon={ClipboardList} tone="violet" title="Belum ada nilai" description="Nilai mapel ini akan muncul setelah guru menginput penilaian semester ini." className="shadow-soft" />
                ) : groupByMonth(entries).map((group, groupIndex) => (
                    <section key={group.label} aria-label={group.label} className="flex flex-col gap-2.5">
                        <h2 className={cn('ml-1 text-[13px] font-extrabold uppercase tracking-[0.4px]', groupIndex === 0 ? 'text-brand-soft' : 'text-subtle')}>{group.label}</h2>
                        {group.entries.map((entry) => (
                            <div key={entry.id} className="flex gap-3 rounded-[20px] bg-card p-3.5 shadow-soft">
                                <span aria-hidden="true" className={cn('w-1.5 shrink-0 self-stretch rounded-full', entry.kind === 'file' ? 'bg-[#F0827A]' : tone.bar)} />
                                <span className="flex min-w-0 flex-grow flex-col gap-1">
                                    <span className="flex min-w-0 items-center gap-1.5">
                                        <span className="truncate text-[15px] font-extrabold">{entry.assessment}</span>
                                        {isNewGrade(entry) ? <NewBadge /> : null}
                                    </span>
                                    <span className="text-xs text-subtle">{formatDate(parseIsoDateTime(entry.publishedAt))}</span>
                                    <EntryDetail entry={entry} onOpenFile={setViewedFile} />
                                </span>
                                <span className="flex items-center">
                                    <EntryResult entry={entry} />
                                </span>
                            </div>
                        ))}
                    </section>
                ))}
            </div>

            <GradeFileViewer entry={viewedFile} onClose={() => setViewedFile(null)} />
        </FocusPage>
    )
}
