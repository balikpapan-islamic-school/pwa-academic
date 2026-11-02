import { lazy, Suspense, useState } from 'react'
import { ChevronDown, Eye, FileText } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ScreenHeader } from '@/components/kit/screen-header'
import { SegmentedTabs } from '@/components/kit/segmented-tabs'
import { toneAt } from '@/components/kit/tones'
import { FileGradeEntry, GradeEntry, isNewGrade, PASSING_SCORE, dummyClassmates, dummyGradeEntries, dummySchedule, dummyScheduleDays, dummyStudent, dummySubjects } from '@/lib/dummy-ui'
import { formatDate, monthNames, parseIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type AkademikTab = 'nilai' | 'mapel' | 'kelas'

const tabOptions: Array<{ value: AkademikTab, label: string }> = [
    { value: 'nilai', label: 'Nilai' },
    { value: 'mapel', label: 'Mapel' },
    { value: 'kelas', label: 'Kelas' },
]

function isAkademikTab(value: string | null): value is AkademikTab {
    return value === 'nilai' || value === 'mapel' || value === 'kelas'
}

const PdfViewerDialog = lazy(() => import('@/components/pdf-viewer/pdf-viewer-dialog'))

function byNewest(a: GradeEntry, b: GradeEntry) {
    return b.publishedAt.localeCompare(a.publishedAt)
}

// Warna tetap per mapel mengikuti urutan daftar mapel kelas.
function subjectTone(subject: string) {
    const index = dummySubjects.findIndex((item) => item.name === subject)
    return toneAt(index === -1 ? 0 : index)
}

function teacherOf(subject: string) {
    return dummySubjects.find((item) => item.name === subject)?.teacher
}

function countLabel(entries: GradeEntry[]) {
    const files = entries.filter((entry) => entry.kind === 'file').length
    const scores = entries.length - files
    return [scores > 0 ? `${scores} nilai` : null, files > 0 ? `${files} file` : null].filter(Boolean).join(' · ')
}

function NewBadge() {
    return <span className="shrink-0 rounded-full bg-cta px-2 py-0.5 text-[11px] font-extrabold normal-case tracking-normal text-ink">Baru</span>
}

// Hanya nilai angka yang punya hasil di kolom kanan; nilai file tampil sebagai lampiran.
function EntryResult({ entry }: { entry: GradeEntry }) {
    if (entry.kind === 'file') {
        return null
    }

    const isBelow = entry.score < PASSING_SCORE

    return (
        <span className="flex shrink-0 flex-col items-end">
            <span className={cn('font-display text-[22px] font-bold leading-none', isBelow ? 'text-pastel-coral-fg' : 'text-ink')}>{entry.score}</span>
            {isBelow ? <span className="mt-1 text-[11px] font-extrabold text-pastel-coral-fg">&lt; KKM {PASSING_SCORE}</span> : null}
        </span>
    )
}

function EntryDetail({ entry, onOpenFile }: { entry: GradeEntry, onOpenFile: (entry: FileGradeEntry) => void }) {
    return (
        <>
            {entry.note ? <span className="text-[13px] leading-snug text-[#44544A]">{entry.note}</span> : null}
            {entry.kind === 'file' ? (
                <button
                    type="button"
                    onClick={() => onOpenFile(entry)}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-2xl border-2 border-border bg-card p-2 pr-3 text-left transition-colors hover:border-primary">
                    <span aria-hidden="true" className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-pastel-coral text-pastel-coral-fg">
                        <FileText className="size-[18px]" />
                        <span className="text-[8px] font-extrabold leading-none">PDF</span>
                    </span>
                    <span className="flex min-w-0 flex-grow flex-col">
                        <span className="truncate text-[13px] font-extrabold">{entry.fileName}</span>
                        <span className="text-xs text-subtle">{entry.fileSize}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] font-extrabold text-primary">
                        <Eye className="size-4" />
                        Lihat
                    </span>
                </button>
            ) : null}
        </>
    )
}

function SubjectGroup({ subject, entries, isOpen, onToggle, onOpenFile }: { subject: string, entries: GradeEntry[], isOpen: boolean, onToggle: () => void, onOpenFile: (entry: FileGradeEntry) => void }) {
    const tone = subjectTone(subject)
    const hasNew = entries.some((entry) => isNewGrade(entry))
    const panelId = `nilai-${subject.replace(/\s+/g, '-').toLowerCase()}`

    return (
        <div className="overflow-hidden rounded-[20px] bg-card">
            <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={onToggle} className="flex w-full items-center gap-3 p-3.5 text-left">
                <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[14px] font-display text-lg font-bold', tone.bg, tone.fg)}>
                    {subject.charAt(0)}
                </span>
                <span className="flex min-w-0 flex-grow flex-col gap-0.5">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[15px] font-extrabold">{subject}</span>
                        {hasNew ? <NewBadge /> : null}
                    </span>
                    <span className="truncate text-xs text-subtle">{teacherOf(subject)} · {countLabel(entries)}</span>
                </span>
                <ChevronDown aria-hidden="true" className={cn('size-5 shrink-0 text-subtle transition-transform duration-200', isOpen && 'rotate-180')} strokeWidth={2.4} />
            </button>

            {isOpen ? (
                <div id={panelId} className="mx-3.5 mb-3.5 rounded-2xl bg-[#F1F6F1] px-3.5 py-1">
                    {[...entries].sort(byNewest).map((entry) => (
                        <div key={entry.id} className="flex gap-3 border-b border-[#DDE6DE] py-3 last:border-b-0">
                            <span aria-hidden="true" className={cn('w-1.5 shrink-0 self-stretch rounded-full', entry.kind === 'file' ? 'bg-[#F0827A]' : tone.bar)} />
                            <span className="flex min-w-0 flex-grow flex-col gap-1">
                                <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate text-sm font-extrabold">{entry.assessment}</span>
                                    {isNewGrade(entry) ? <NewBadge /> : null}
                                </span>
                                <span className="text-xs text-subtle">Terbit {formatDate(parseIsoDate(entry.publishedAt))}</span>
                                <EntryDetail entry={entry} onOpenFile={onOpenFile} />
                            </span>
                            <span className="flex items-center">
                                <EntryResult entry={entry} />
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

function GradeHistory({ entries, onOpenFile }: { entries: GradeEntry[], onOpenFile: (entry: FileGradeEntry) => void }) {
    const groups: Array<{ label: string, entries: GradeEntry[] }> = []

    for (const entry of [...entries].sort(byNewest)) {
        const date = parseIsoDate(entry.publishedAt)
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        const group = groups.at(-1)

        if (group?.label === label) {
            group.entries.push(entry)
        } else {
            groups.push({ label, entries: [entry] })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {groups.map((group) => (
                <section key={group.label} aria-label={group.label} className="flex flex-col gap-2.5">
                    <h3 className="ml-1 text-[13px] font-extrabold uppercase tracking-[0.4px] text-subtle">{group.label}</h3>
                    {group.entries.map((entry) => {
                        const tone = subjectTone(entry.subject)
                        const date = parseIsoDate(entry.publishedAt)

                        return (
                            <div key={entry.id} className="flex gap-3 rounded-[20px] bg-card p-3.5">
                                <span className={cn('flex size-[46px] shrink-0 flex-col items-center justify-center rounded-[14px] leading-none', tone.bg, tone.fg)}>
                                    <span className="font-display text-[17px] font-bold">{date.getDate()}</span>
                                    <span className="mt-0.5 text-[10px] font-extrabold uppercase">{monthNames[date.getMonth()].slice(0, 3)}</span>
                                </span>
                                <span className="flex min-w-0 flex-grow flex-col gap-1">
                                    <span className={cn('flex min-w-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.4px]', tone.fg)}>
                                        <span className="truncate">{entry.subject}</span>
                                        {isNewGrade(entry) ? <NewBadge /> : null}
                                    </span>
                                    <span className="truncate text-[15px] font-extrabold">{entry.assessment}</span>
                                    <EntryDetail entry={entry} onOpenFile={onOpenFile} />
                                    <span className="text-xs text-subtle">Diterbitkan oleh {entry.publisher}</span>
                                </span>
                                <span className="flex items-center">
                                    <EntryResult entry={entry} />
                                </span>
                            </div>
                        )
                    })}
                </section>
            ))}
        </div>
    )
}

type NilaiMode = 'mapel' | 'riwayat'

function NilaiTab() {
    const [mode, setMode] = useState<NilaiMode>('mapel')
    const [openSubject, setOpenSubject] = useState<string | null>(null)
    const [viewedFile, setViewedFile] = useState<FileGradeEntry | null>(null)

    const subjectGroups = dummySubjects
        .map((subject) => ({ subject: subject.name, entries: dummyGradeEntries.filter((entry) => entry.subject === subject.name) }))
        .filter((group) => group.entries.length > 0)

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[19px] font-semibold">{mode === 'mapel' ? 'Nilai per Mapel' : 'Riwayat Terbit'}</h2>
                <div role="tablist" aria-label="Tampilan nilai" className="flex gap-1 rounded-full bg-card p-1">
                    {([['mapel', 'Per Mapel'], ['riwayat', 'Riwayat']] as const).map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={mode === value}
                            onClick={() => setMode(value)}
                            className={cn('h-8 rounded-full px-3 text-xs font-extrabold transition-colors', mode === value ? 'bg-ink text-white' : 'text-subtle')}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'mapel' ? (
                <div className="flex flex-col gap-2.5">
                    {subjectGroups.map((group) => (
                        <SubjectGroup
                            key={group.subject}
                            subject={group.subject}
                            entries={group.entries}
                            isOpen={openSubject === group.subject}
                            onToggle={() => setOpenSubject((current) => (current === group.subject ? null : group.subject))}
                            onOpenFile={setViewedFile}
                        />
                    ))}
                </div>
            ) : (
                <GradeHistory entries={dummyGradeEntries} onOpenFile={setViewedFile} />
            )}

            <p className="text-center text-xs text-subtle">Nilai tampil setelah diterbitkan oleh guru mapel</p>

            {viewedFile ? (
                <Suspense fallback={null}>
                    <PdfViewerDialog
                        open
                        onOpenChange={(open) => !open && setViewedFile(null)}
                        url={viewedFile.fileUrl}
                        title={viewedFile.assessment}
                        subtitle={`${viewedFile.subject} · ${viewedFile.publisher}`}
                        fileName={viewedFile.fileName}
                    />
                </Suspense>
            ) : null}
        </div>
    )
}

function MapelTab() {
    const totalHours = dummySubjects.reduce((sum, subject) => sum + subject.hours, 0)

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-subtle">{dummySubjects.length} mata pelajaran · {totalHours} jam pelajaran per minggu</p>
            <div className="grid grid-cols-2 gap-3">
                {dummySubjects.map((subject, index) => {
                    const tone = toneAt(index)

                    return (
                        <div key={subject.name} className={cn('flex min-h-[150px] flex-col rounded-[22px] p-3.5', tone.bg)}>
                            <span aria-hidden="true" className={cn('flex size-[42px] items-center justify-center rounded-[14px] bg-card font-display text-lg font-bold', tone.fg)}>
                                {subject.name.charAt(0)}
                            </span>
                            <span className="mt-3.5 font-display text-base font-semibold leading-[1.2]">{subject.name}</span>
                            <span className="mt-1 text-xs text-[#44544A]">{subject.teacher}</span>
                            <span className="mt-2 text-xs font-extrabold">{subject.hours} JP / minggu</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function KelasTab() {
    const [dayIndex, setDayIndex] = useState(0)

    return (
        <div className="flex flex-col gap-3.5">
            <section className="flex flex-col gap-3.5 rounded-3xl bg-card p-[18px]">
                <div className="flex items-center gap-3.5">
                    <span aria-hidden="true" className="flex size-[60px] items-center justify-center rounded-[18px] bg-pastel-mint font-display text-xl font-bold text-pastel-mint-fg">
                        {dummyStudent.className.split(' ')[0]}
                    </span>
                    <div>
                        <p className="font-display text-xl font-bold">{dummyStudent.className}</p>
                        <p className="mt-0.5 text-[13px] text-subtle">{dummyStudent.room}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-[#F1F6F1] p-3">
                        <p className="text-xs font-bold text-subtle">Wali Kelas</p>
                        <p className="mt-0.5 text-sm font-extrabold">{dummyStudent.homeroomTeacherShort}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F1F6F1] p-3">
                        <p className="text-xs font-bold text-subtle">Jumlah Siswa</p>
                        <p className="mt-0.5 text-sm font-extrabold">{dummyStudent.classSize} siswa</p>
                    </div>
                </div>
            </section>

            <h2 className="mt-1 font-display text-[19px] font-semibold">Jadwal Pelajaran</h2>
            <div className="flex gap-2">
                {dummyScheduleDays.map((day, index) => {
                    const isActive = index === dayIndex

                    return (
                        <button
                            key={day.label}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setDayIndex(index)}
                            className={cn('flex h-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px]', isActive ? 'bg-ink text-white' : 'bg-card text-ink')}>
                            <span className="text-xs font-bold">{day.label}</span>
                            <span className="font-display text-lg font-bold">{day.date}</span>
                        </button>
                    )
                })}
            </div>

            <div className="rounded-3xl bg-card px-4 py-1.5">
                {dummySchedule[dayIndex].map((lesson, index) => (
                    <div key={lesson.start} className="flex items-center gap-3.5 border-b border-muted py-3 last:border-b-0">
                        <span className="w-[54px] shrink-0 text-[13px] font-extrabold leading-[1.3] text-subtle">{lesson.start}<br />{lesson.end}</span>
                        <span aria-hidden="true" className={cn('w-1.5 self-stretch rounded-full', toneAt(index).bar)} />
                        <span className="flex flex-grow flex-col gap-0.5">
                            <span className="text-[15px] font-extrabold">{lesson.subject}</span>
                            <span className="text-xs text-subtle">{lesson.teacher}</span>
                        </span>
                    </div>
                ))}
            </div>

            <h2 className="mt-1 font-display text-[19px] font-semibold">Teman Sekelas</h2>
            <div className="flex items-center justify-between rounded-3xl bg-card px-4 py-3.5">
                <div className="flex">
                    {dummyClassmates.map((initials, index) => {
                        const tone = toneAt(index)

                        return (
                            <span key={initials} aria-hidden="true" className={cn('flex size-10 items-center justify-center rounded-full border-[3px] border-white text-xs font-extrabold', index > 0 && '-ml-2.5', tone.bg, tone.fg)}>
                                {initials}
                            </span>
                        )
                    })}
                    <span aria-hidden="true" className="-ml-2.5 flex size-10 items-center justify-center rounded-full border-[3px] border-white bg-ink text-xs font-extrabold text-white">
                        +{dummyStudent.classSize - dummyClassmates.length}
                    </span>
                </div>
                <button type="button" className="flex min-h-11 items-center text-sm font-extrabold text-primary">Lihat {dummyStudent.classSize} siswa</button>
            </div>
        </div>
    )
}

export default function Akademik() {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const tab: AkademikTab = isAkademikTab(tabParam) ? tabParam : 'nilai'

    return (
        <div className="flex flex-col gap-[18px]">
            <ScreenHeader
                title="Akademik"
                action={(
                    <button type="button" className="flex h-11 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-extrabold shadow-chip">
                        {dummyStudent.semester} {dummyStudent.schoolYear}
                        <ChevronDown className="size-4" strokeWidth={2.4} />
                    </button>
                )}
                compactAction={(
                    <button type="button" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/[0.18] px-3.5 text-[13px] font-extrabold">
                        {dummyStudent.semester} {dummyStudent.schoolYear}
                        <ChevronDown className="size-4" strokeWidth={2.4} />
                    </button>
                )}
            />

            <SegmentedTabs
                label="Bagian akademik"
                value={tab}
                options={tabOptions}
                onChange={(next) => setSearchParams(next === 'nilai' ? {} : { tab: next }, { replace: true })}
            />

            {tab === 'nilai' ? <NilaiTab /> : null}
            {tab === 'mapel' ? <MapelTab /> : null}
            {tab === 'kelas' ? <KelasTab /> : null}
        </div>
    )
}
