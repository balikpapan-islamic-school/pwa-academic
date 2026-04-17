export type UserRole = 'siswa' | 'wali_siswa'

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa'

export type ReportStatus = 'Draft' | 'Final'

export type AuthUser = {
    id: string
    name: string
    email: string
    role: UserRole
    avatarInitials: string
}

export type StudentSummary = {
    id: string
    name: string
    nickname: string
    nis: string
    unit: string
    className: string
    semesterLabel: string
    homeroomTeacher: string
    avatarInitials: string
}

export type StudentProfile = StudentSummary & {
    birthplace?: string
    birthDate?: string
    gender?: string
    religion?: string
    statusActive?: boolean
    addressLine?: string
}

export type ScheduleItem = {
    id: string
    day: string
    subject: string
    teacher: string
    startTime: string
    endTime: string
    room: string
}

export type AttendanceItem = {
    id: string
    date: string
    status: AttendanceStatus
    note?: string
    subject?: string
}

export type AttendanceSummary = {
    hadir: number
    sakit: number
    izin: number
    alfa: number
}

export type GradeComponentItem = {
    id: string
    name: string
    score: number
    weight: number
}

export type GradeItem = {
    id: string
    subject: string
    teacher: string
    score: number
    predicate: string
    components: GradeComponentItem[]
}

export type ReportSummary = {
    id: string
    semester: string
    status: ReportStatus
    average: number
    publishedAt?: string
}

export type ReportSubject = {
    id: string
    subject: string
    knowledgeScore: number
    skillScore: number
    note: string
}

export type ReportDetail = {
    id: string
    semester: string
    status: ReportStatus
    average: number
    homeroomNote: string
    principalNote?: string
    documentUrl?: string
    subjects: ReportSubject[]
}

export type NotificationItem = {
    id: string
    title: string
    body: string
    time: string
    href: string
    read: boolean
}

export type SchoolAlert = {
    id: string
    title: string
    message: string
    tone: 'info' | 'warning' | 'success'
    actionLabel?: string
    actionHref?: string
}

export type AgendaItem = {
    id: string
    date: string
    title: string
    scope: string
    location?: string
}

export type NewsItem = {
    id: string
    title: string
    summary: string
    date: string
    category: string
}

export type DashboardData = {
    student: StudentSummary
    todaySchedule: ScheduleItem[]
    attendanceSummary: AttendanceSummary
    latestAttendance: AttendanceItem[]
    gradeHighlights: GradeItem[]
    latestReport: ReportSummary
    schoolAlert: SchoolAlert | null
    agendas: AgendaItem[]
    news: NewsItem[]
}
