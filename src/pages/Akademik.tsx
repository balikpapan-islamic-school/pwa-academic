import { ReactNode, useState } from 'react'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EntryDetail, EntryResult, GradeFileViewer, NewBadge } from '@/components/akademik/grade-entry'
import { ScreenHeader } from '@/components/kit/screen-header'
import { SegmentedTabs } from '@/components/kit/segmented-tabs'
import { toneAt } from '@/components/kit/tones'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudent } from '@/contexts/StudentContext'
import { useApiData } from '@/hooks/use-api-data'
import { byNewest, countLabel, isNewGrade, subjectTone } from '@/lib/grades'
import { dayNames, formatClock, monthNames, parseIsoDate, parseIsoDateTime, toIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { academicService } from '@/services'
import { Classmate, Classroom, FileGradeEntry, GradeEntry, Semester, Subject } from '@/types/academic'

type AkademikTab = 'nilai' | 'mapel' | 'kelas'

const tabOptions: Array<{ value: AkademikTab, label: string }> = [
    { value: 'nilai', label: 'Nilai' },
    { value: 'mapel', label: 'Mapel' },
    { value: 'kelas', label: 'Kelas' },
]

function isAkademikTab(value: string | null): value is AkademikTab {
    return value === 'nilai' || value === 'mapel' || value === 'kelas'
}

function TabMessage({ children }: { children: ReactNode }) {
    return <p className="rounded-[20px] bg-card p-4 text-center text-sm text-subtle">{children}</p>
}

function ListSkeleton({ count = 4, className = 'h-[72px] rounded-[20px]' }: { count?: number, className?: string }) {
    return (
        <div aria-busy="true" aria-label="Memuat" className="flex flex-col gap-2.5">
            {Array.from({ length: count }, (_, index) => <Skeleton key={index} className={className} />)}
        </div>
    )
}

type SubjectRowProps = {
    subject: GradeEntry['subject']
    subjects: Subject[]
    entries: GradeEntry[]
    to: string
}

// Ringkasan satu mapel; daftar nilai lengkapnya ada di halaman detail mapel.
function SubjectRow({ subject, subjects, entries, to }: SubjectRowProps) {
    const tone = subjectTone(subjects, subject.id)
    const hasNew = entries.some((entry) => isNewGrade(entry))
    const latest = [...entries].sort(byNewest)[0]

    return (
        <Link to={to} className="flex items-center gap-3 rounded-[20px] bg-card p-3.5">
            <span aria-hidden="true" className={cn('flex size-11 shrink-0 items-center justify-center rounded-[14px] font-display text-lg font-bold', tone.bg, tone.fg)}>
                {subject.name.charAt(0)}
            </span>
            <span className="flex min-w-0 flex-grow flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-[15px] font-extrabold">{subject.name}</span>
                    {hasNew ? <NewBadge /> : null}
                </span>
                <span className="truncate text-xs text-subtle">{[subject.teacherName, countLabel(entries)].filter(Boolean).join(' · ')}</span>
                {latest ? (
                    <span className="truncate text-xs text-[#44544A]">
                        Terakhir: {latest.assessment}{latest.score !== null ? ` · ${latest.score}` : latest.kind === 'file' ? ' · file' : ''}
                    </span>
                ) : null}
            </span>
            <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-subtle" strokeWidth={2.4} />
        </Link>
    )
}

function GradeHistory({ entries, subjects, onOpenFile }: { entries: GradeEntry[], subjects: Subject[], onOpenFile: (entry: FileGradeEntry) => void }) {
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

    return (
        <div className="flex flex-col gap-4">
            {groups.map((group) => (
                <section key={group.label} aria-label={group.label} className="flex flex-col gap-2.5">
                    <h3 className="ml-1 text-[13px] font-extrabold uppercase tracking-[0.4px] text-subtle">{group.label}</h3>
                    {group.entries.map((entry) => {
                        const tone = subjectTone(subjects, entry.subject.id)
                        const date = parseIsoDateTime(entry.publishedAt)

                        return (
                            <div key={entry.id} className="flex gap-3 rounded-[20px] bg-card p-3.5">
                                <span className={cn('flex size-[46px] shrink-0 flex-col items-center justify-center rounded-[14px] leading-none', tone.bg, tone.fg)}>
                                    <span className="font-display text-[17px] font-bold">{date.getDate()}</span>
                                    <span className="mt-0.5 text-[10px] font-extrabold uppercase">{monthNames[date.getMonth()].slice(0, 3)}</span>
                                </span>
                                <span className="flex min-w-0 flex-grow flex-col gap-1">
                                    <span className={cn('flex min-w-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.4px]', tone.fg)}>
                                        <span className="truncate">{entry.subject.name}</span>
                                        {isNewGrade(entry) ? <NewBadge /> : null}
                                    </span>
                                    <span className="truncate text-[15px] font-extrabold">{entry.assessment}</span>
                                    <EntryDetail entry={entry} onOpenFile={onOpenFile} />
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

type TabProps = {
    studentId: string
    semesterId: string | undefined
}

// Urutan mapel mengikuti GET /subjects; mapel yang tidak ada di daftar ditaruh di akhir.
function groupBySubject(entries: GradeEntry[], subjects: Subject[]) {
    const groups = new Map<string, { subject: GradeEntry['subject'], entries: GradeEntry[] }>()
    const order = (id: string) => {
        const index = subjects.findIndex((subject) => subject.id === id)
        return index === -1 ? subjects.length : index
    }

    for (const entry of entries) {
        const group = groups.get(entry.subject.id)
        if (group) {
            group.entries.push(entry)
        } else {
            groups.set(entry.subject.id, { subject: entry.subject, entries: [entry] })
        }
    }

    return [...groups.values()].sort((a, b) => order(a.subject.id) - order(b.subject.id))
}

function NilaiTab({ studentId, semesterId }: TabProps) {
    const [mode, setMode] = useState<NilaiMode>('mapel')
    const [viewedFile, setViewedFile] = useState<FileGradeEntry | null>(null)
    const grades = useApiData(
        () => Promise.all([academicService.getGradeEntries(studentId, semesterId), academicService.getSubjects(studentId, semesterId)]),
        [studentId, semesterId]
    )
    const [entries, subjects] = grades.data ?? [[], []]
    const subjectGroups = groupBySubject(entries, subjects)

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[19px] font-semibold">{mode === 'mapel' ? 'Nilai per Mapel' : 'Riwayat Nilai'}</h2>
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

            {grades.status === 'loading' ? (
                <ListSkeleton />
            ) : grades.status === 'error' ? (
                <TabMessage>Nilai belum dapat dimuat. Coba lagi nanti.</TabMessage>
            ) : entries.length === 0 ? (
                <TabMessage>Belum ada nilai pada semester ini.</TabMessage>
            ) : mode === 'mapel' ? (
                <div className="flex flex-col gap-2.5">
                    {subjectGroups.map((group) => (
                        <SubjectRow
                            key={group.subject.id}
                            subject={group.subject}
                            subjects={subjects}
                            entries={group.entries}
                            to={`/akademik/nilai/${group.subject.id}${semesterId ? `?semester=${encodeURIComponent(semesterId)}` : ''}`}
                        />
                    ))}
                </div>
            ) : (
                <GradeHistory entries={entries} subjects={subjects} onOpenFile={setViewedFile} />
            )}

            <p className="text-center text-xs text-subtle">Nilai tampil setelah diinput oleh guru mapel</p>

            <GradeFileViewer entry={viewedFile} onClose={() => setViewedFile(null)} />
        </div>
    )
}

function MapelTab({ studentId, semesterId }: TabProps) {
    const subjects = useApiData(() => academicService.getSubjects(studentId, semesterId), [studentId, semesterId])

    if (!subjects.data) {
        return subjects.status === 'error'
            ? <TabMessage>Daftar mapel belum dapat dimuat. Coba lagi nanti.</TabMessage>
            : <ListSkeleton count={2} className="h-[150px] rounded-[22px]" />
    }
    if (subjects.data.length === 0) {
        return <TabMessage>Belum ada mata pelajaran pada semester ini.</TabMessage>
    }

    const totalHours = subjects.data.reduce((sum, subject) => sum + subject.hoursPerWeek, 0)

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-subtle">{subjects.data.length} mata pelajaran · {totalHours} jam pelajaran per minggu</p>
            <div className="grid grid-cols-2 gap-3">
                {subjects.data.map((subject, index) => {
                    const tone = toneAt(index)

                    return (
                        <div key={subject.id} className={cn('flex min-h-[150px] flex-col rounded-[22px] p-3.5', tone.bg)}>
                            <span aria-hidden="true" className={cn('flex size-[42px] items-center justify-center rounded-[14px] bg-card font-display text-lg font-bold', tone.fg)}>
                                {subject.name.charAt(0)}
                            </span>
                            <span className="mt-3.5 font-display text-base font-semibold leading-[1.2]">{subject.name}</span>
                            {subject.teacherName ? <span className="mt-1 text-xs text-[#44544A]">{subject.teacherName}</span> : null}
                            <span className="mt-2 text-xs font-extrabold">{subject.hoursPerWeek} JP / minggu</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function ClassmateAvatar({ classmate, index, className }: { classmate: Classmate, index: number, className?: string }) {
    const tone = toneAt(index)

    if (classmate.photoUrl) {
        return <img src={classmate.photoUrl} alt="" className={cn('size-10 shrink-0 rounded-full object-cover', className)} />
    }

    return (
        <span aria-hidden="true" className={cn('flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold', tone.bg, tone.fg, className)}>
            {classmate.initials}
        </span>
    )
}

// Daftar nama teman sekelas (GET /classroom/students), dimuat saat sheet dibuka.
function ClassmatesSheet({ studentId, semesterId, studentCount }: TabProps & { studentCount: number }) {
    const [open, setOpen] = useState(false)
    const classmates = useApiData(open ? () => academicService.getClassmates(studentId, semesterId) : null, [open, studentId, semesterId])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex min-h-11 items-center text-sm font-extrabold text-primary">Lihat {studentCount} siswa</SheetTrigger>
            <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-md gap-0 rounded-t-[28px] border-0 bg-background px-5 pb-8 pt-3 [&>button:last-child]:hidden">
                <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-[#C3CEC5]" />
                <SheetTitle className="font-display text-xl font-bold">Teman Sekelas</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-subtle">{studentCount} siswa di kelas ini.</SheetDescription>
                <div className="mt-4 overflow-y-auto rounded-3xl bg-card px-4 py-1">
                    {classmates.data ? classmates.data.map((classmate, index) => (
                        <div key={classmate.id} className="flex items-center gap-3 border-b border-muted py-2.5 last:border-b-0">
                            <ClassmateAvatar classmate={classmate} index={index} />
                            <span className="text-[15px] font-bold">{classmate.name}</span>
                        </div>
                    )) : classmates.status === 'error' ? (
                        <p className="py-4 text-center text-sm text-subtle">Daftar siswa belum dapat dimuat.</p>
                    ) : (
                        [0, 1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex items-center gap-3 py-2.5">
                                <Skeleton className="size-10 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function ClassroomCard({ classroom }: { classroom: Classroom }) {
    return (
        <section className="flex flex-col gap-3.5 rounded-3xl bg-card p-[18px]">
            <div className="flex items-center gap-3.5">
                <span aria-hidden="true" className="flex size-[60px] items-center justify-center rounded-[18px] bg-pastel-mint font-display text-xl font-bold text-pastel-mint-fg">
                    {classroom.gradeLevel ?? classroom.name.split(' ')[0]}
                </span>
                <div>
                    <p className="font-display text-xl font-bold">{classroom.name}</p>
                    {classroom.room || classroom.location ? <p className="mt-0.5 text-[13px] text-subtle">{[classroom.room, classroom.location].filter(Boolean).join(' · ')}</p> : null}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-[#F1F6F1] p-3">
                    <p className="text-xs font-bold text-subtle">Wali Kelas</p>
                    <p className="mt-0.5 text-sm font-extrabold">{classroom.homeroomTeacher ?? '-'}</p>
                </div>
                <div className="rounded-2xl bg-[#F1F6F1] p-3">
                    <p className="text-xs font-bold text-subtle">Jumlah Siswa</p>
                    <p className="mt-0.5 text-sm font-extrabold">{classroom.studentCount} siswa</p>
                </div>
            </div>
        </section>
    )
}

function ClassmatesSection({ classroom, studentId, semesterId }: TabProps & { classroom: Classroom }) {
    const others = classroom.studentCount - classroom.classmatesPreview.length

    return (
        <>
            <h2 className="mt-1 font-display text-[19px] font-semibold">Teman Sekelas</h2>
            <div className="flex items-center justify-between rounded-3xl bg-card px-4 py-3.5">
                <div className="flex">
                    {classroom.classmatesPreview.map((classmate, index) => (
                        <ClassmateAvatar key={classmate.id} classmate={classmate} index={index} className={cn('border-[3px] border-white', index > 0 && '-ml-2.5')} />
                    ))}
                    {others > 0 ? (
                        <span aria-hidden="true" className={cn('flex size-10 items-center justify-center rounded-full border-[3px] border-white bg-ink text-xs font-extrabold text-white', classroom.classmatesPreview.length > 0 && '-ml-2.5')}>
                            +{others}
                        </span>
                    ) : null}
                </div>
                <ClassmatesSheet studentId={studentId} semesterId={semesterId} studentCount={classroom.studentCount} />
            </div>
        </>
    )
}

function WeekScheduleSection({ studentId }: { studentId: string }) {
    const schedule = useApiData(() => academicService.getSchedule(studentId), [studentId])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const days = schedule.data?.days ?? []
    // Default: hari ini bila ada di minggu ini, selain itu hari pertama.
    const today = toIsoDate(new Date())
    const activeDay = days.find((day) => day.date === selectedDate) ?? days.find((day) => day.date === today) ?? days[0]

    return (
        <>
            <h2 className="mt-1 font-display text-[19px] font-semibold">Jadwal Pelajaran</h2>
            {schedule.status === 'loading' ? (
                <ListSkeleton count={2} className="h-16 rounded-[18px]" />
            ) : !activeDay ? (
                <TabMessage>{schedule.status === 'error' ? 'Jadwal belum dapat dimuat. Coba lagi nanti.' : 'Belum ada jadwal minggu ini.'}</TabMessage>
            ) : (
                <>
                    <div className="flex gap-2">
                        {days.map((day) => {
                            const isActive = day.date === activeDay.date

                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={cn('flex h-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-[18px]', isActive ? 'bg-ink text-white' : 'bg-card text-ink')}>
                                    <span className="text-xs font-bold">{dayNames[day.dayOfWeek % 7].slice(0, 3)}</span>
                                    <span className="font-display text-lg font-bold">{parseIsoDate(day.date).getDate()}</span>
                                </button>
                            )
                        })}
                    </div>

                    {!activeDay.isSchoolDay || activeDay.lessons.length === 0 ? (
                        <TabMessage>{activeDay.holidayName ?? 'Tidak ada pelajaran pada hari ini.'}</TabMessage>
                    ) : (
                        <div className="rounded-3xl bg-card px-4 py-1.5">
                            {activeDay.lessons.map((lesson, index) => (
                                <div key={lesson.id} className="flex items-center gap-3.5 border-b border-muted py-3 last:border-b-0">
                                    <span className="w-[54px] shrink-0 text-[13px] font-extrabold leading-[1.3] text-subtle">{formatClock(lesson.startTime)}<br />{formatClock(lesson.endTime)}</span>
                                    <span aria-hidden="true" className={cn('w-1.5 self-stretch rounded-full', toneAt(index).bar)} />
                                    <span className="flex flex-grow flex-col gap-0.5">
                                        <span className="text-[15px] font-extrabold">{lesson.subject.name}</span>
                                        <span className="text-xs text-subtle">{[lesson.teacherName, lesson.room].filter(Boolean).join(' · ')}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    )
}

function KelasTab({ studentId, semesterId }: TabProps) {
    const classroom = useApiData(() => academicService.getClassroom(studentId, semesterId), [studentId, semesterId])

    return (
        <div className="flex flex-col gap-3.5">
            {classroom.data ? (
                <ClassroomCard classroom={classroom.data} />
            ) : classroom.status === 'error' ? (
                <TabMessage>Data kelas belum dapat dimuat. Coba lagi nanti.</TabMessage>
            ) : (
                <Skeleton className="h-[180px] rounded-3xl" />
            )}
            <WeekScheduleSection studentId={studentId} />
            {classroom.data ? <ClassmatesSection classroom={classroom.data} studentId={studentId} semesterId={semesterId} /> : null}
        </div>
    )
}

function semesterLabel(semester: Semester) {
    return `${semester.name} ${semester.schoolYear}`
}

type SemesterPickerProps = {
    semesters: Semester[]
    activeId: string | undefined
    onSelect: (semesterId: string) => void
    variant: 'header' | 'compact'
}

function SemesterPicker({ semesters, activeId, onSelect, variant }: SemesterPickerProps) {
    const [open, setOpen] = useState(false)
    const active = semesters.find((semester) => semester.id === activeId)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                disabled={!active}
                className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-extrabold',
                    variant === 'header' ? 'h-11 bg-card shadow-chip' : 'h-10 bg-white/[0.18]'
                )}>
                {active ? semesterLabel(active) : 'Semester'}
                <ChevronDown className="size-4" strokeWidth={2.4} />
            </SheetTrigger>
            <SheetContent side="bottom" className="mx-auto max-w-md gap-0 rounded-t-[28px] border-0 bg-background px-5 pb-8 pt-3 [&>button:last-child]:hidden">
                <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#C3CEC5]" />
                <SheetTitle className="font-display text-xl font-bold">Pilih Semester</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-subtle">Nilai, mapel, dan kelas mengikuti semester yang dipilih.</SheetDescription>
                <div role="radiogroup" aria-label="Daftar semester" className="mt-4 flex flex-col gap-2">
                    {semesters.map((semester) => {
                        const isActive = semester.id === activeId

                        return (
                            <button
                                key={semester.id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => {
                                    onSelect(semester.id)
                                    setOpen(false)
                                }}
                                className={cn('flex items-center gap-3 rounded-[20px] border-2 bg-card p-3.5 text-left transition-colors', isActive ? 'border-primary' : 'border-card')}>
                                <span className="flex min-w-0 flex-grow flex-col">
                                    <span className="text-[15px] font-extrabold">{semesterLabel(semester)}</span>
                                    {semester.isActive ? <span className="text-[13px] text-subtle">Semester berjalan</span> : null}
                                </span>
                                <span aria-hidden="true" className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', isActive ? 'bg-primary text-white' : 'border-2 border-[#B5C2B8]')}>
                                    {isActive ? <Check className="size-4" strokeWidth={3} /> : null}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function Akademik() {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const tab: AkademikTab = isAkademikTab(tabParam) ? tabParam : 'nilai'
    const { activeStudent } = useStudent()
    const studentId = activeStudent?.id ?? ''
    const semesters = useApiData(studentId ? () => academicService.getSemesters(studentId) : null, [studentId])
    const semesterList = semesters.data ?? []
    // Semester disimpan di URL (`?semester=`) agar tetap terpilih saat kembali dari detail mapel.
    // Kosong, atau bukan milik anak aktif (mis. setelah ganti anak) = semester aktif (default backend).
    const semesterParam = searchParams.get('semester')
    const semesterId = semesterParam && semesterList.some((semester) => semester.id === semesterParam) ? semesterParam : undefined
    const shownSemesterId = semesterId ?? semesterList.find((semester) => semester.isActive)?.id ?? semesterList[0]?.id

    function updateParams(next: { tab?: AkademikTab, semester?: string }) {
        const nextTab = next.tab ?? tab
        const nextSemester = 'semester' in next ? next.semester : semesterId
        const params: Record<string, string> = {}
        if (nextTab !== 'nilai') {
            params.tab = nextTab
        }
        if (nextSemester) {
            params.semester = nextSemester
        }
        setSearchParams(params, { replace: true })
    }

    function selectSemester(nextId: string) {
        updateParams({ semester: semesterList.find((semester) => semester.id === nextId)?.isActive ? undefined : nextId })
    }

    return (
        <div className="flex flex-col gap-[18px]">
            <ScreenHeader
                title="Akademik"
                action={<SemesterPicker semesters={semesterList} activeId={shownSemesterId} onSelect={selectSemester} variant="header" />}
                compactAction={<SemesterPicker semesters={semesterList} activeId={shownSemesterId} onSelect={selectSemester} variant="compact" />}
            />

            <SegmentedTabs
                label="Bagian akademik"
                value={tab}
                options={tabOptions}
                onChange={(next) => updateParams({ tab: next })}
            />

            {/* Dengan `?semester=`, tunggu daftar semester agar tab tidak sempat memuat semester aktif lebih dulu. */}
            {studentId && !(semesterParam && semesters.status === 'loading') ? (
                <>
                    {tab === 'nilai' ? <NilaiTab studentId={studentId} semesterId={semesterId} /> : null}
                    {tab === 'mapel' ? <MapelTab studentId={studentId} semesterId={semesterId} /> : null}
                    {tab === 'kelas' ? <KelasTab studentId={studentId} semesterId={semesterId} /> : null}
                </>
            ) : (
                <ListSkeleton />
            )}
        </div>
    )
}
