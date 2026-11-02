export type UserRole = 'siswa' | 'wali_siswa'

export type ReportStatus = 'Draft' | 'Final'

export type AuthUser = {
    id: string
    name: string
    email: string
    role: UserRole
    avatarInitials: string
    avatarUrl: string | null
    // `false` untuk akun Google yang belum membuat kata sandi.
    hasPassword: boolean
    linkedStudentsCount: number
}

export type StudentSummary = {
    id: string
    name: string
    nickname: string
    nis: string
    nisn?: string
    unit: string
    schoolName?: string
    className: string
    semesterLabel: string
    homeroomTeacher: string
    avatarInitials: string
    photoUrl?: string | null
    statusActive?: boolean
    // Hubungan wali dengan anak: `ayah` | `ibu` | `wali`.
    relation?: string
}

// Profil peserta didik dari GET /me?student_id= (halaman Profil).
export type StudentProfile = {
    id: string
    name: string
    nickname: string
    nis: string
    nisn: string | null
    className: string
    statusActive: boolean
    birthplace: string | null
    birthDate: string | null
    gender: 'laki-laki' | 'perempuan' | null
    // Email & no. HP sudah disamarkan oleh backend.
    email: string | null
    phone: string | null
    homeroomTeacher: string | null
    photoUrl: string | null
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

// Objek file dari backend (lembar nilai PDF, lampiran izin). `url` adalah signed URL berumur pendek.
export type FileAttachment = {
    name: string
    mimeType: string
    sizeBytes: number
    pageCount: number | null
    url: string
    expiresAt: string | null
}

export type PaginationMeta = {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
}

export type Paginated<T> = {
    items: T[]
    meta: PaginationMeta
}

export type Semester = {
    id: string
    name: string
    schoolYear: string
    isActive: boolean
}

export type Lesson = {
    id: string
    subject: { id: string, name: string }
    teacherName: string | null
    // HH:mm
    startTime: string
    endTime: string
    room: string | null
}

// GET /dashboard
export type DashboardSummary = {
    student: {
        id: string
        name: string
        nickname: string
        className: string | null
        semester: Omit<Semester, 'isActive'> | null
        photoUrl: string | null
    }
    unreadNotificationsCount: number
    newGradesCount: number
    attendanceRate: number
    today: {
        date: string
        isSchoolDay: boolean
        lessons: Lesson[]
    }
}

export type NewsCategory = 'pengumuman' | 'kegiatan' | 'prestasi'

export type NewsArticle = {
    id: string
    category: NewsCategory
    title: string
    summary: string
    coverImageUrl: string | null
    author: string | null
    publishedAt: string
}

// GET /news/{id}: `content` berupa HTML terbatas (p, h2–h4, ul/ol, a, strong, em, blockquote).
export type NewsArticleDetail = NewsArticle & {
    content: string
}

export type GradeSubject = {
    id: string
    name: string
    teacherName: string | null
}

type GradeEntryBase = {
    id: string
    subject: GradeSubject
    assessment: string
    // Bisa kosong: penilaian berupa file, atau guru hanya memberi keterangan.
    score: number | null
    note: string | null
    // ISO 8601 (WITA). Backend belum punya status terbit, jadi ini waktu nilai diinput guru.
    publishedAt: string
}

// Guru menginput nilai sebagai angka, atau mengunggah file (PDF/JPG) lembar penilaian.
export type ScoreGradeEntry = GradeEntryBase & {
    kind: 'score'
}

export type FileGradeEntry = GradeEntryBase & {
    kind: 'file'
    file: FileAttachment
}

export type GradeEntry = ScoreGradeEntry | FileGradeEntry

export type Subject = {
    id: string
    name: string
    teacherName: string | null
    hoursPerWeek: number
}

export type Classmate = {
    id: string
    name: string
    initials: string
    photoUrl: string | null
}

export type Classroom = {
    id: string
    name: string
    gradeLevel: string | null
    room: string | null
    location: string | null
    homeroomTeacher: string | null
    studentCount: number
    classmatesPreview: Classmate[]
}

export type ScheduleDay = {
    date: string
    // 1 = Senin ... 7 = Minggu
    dayOfWeek: number
    isSchoolDay: boolean
    holidayName: string | null
    lessons: Lesson[]
}

export type WeekSchedule = {
    weekStart: string
    days: ScheduleDay[]
}

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alfa'

export type AttendanceToday = {
    date: string
    isSchoolDay: boolean
    status: AttendanceStatus | null
    checkInAt: string | null
    checkOutAt: string | null
    punctuality: 'tepat_waktu' | 'terlambat' | null
}

export type AttendanceSummary = Record<AttendanceStatus, number> & {
    attendanceRate: number
}

export type AttendanceCalendar = {
    // YYYY-MM
    month: string
    days: Array<{ date: string, status: AttendanceStatus }>
    holidays: Array<{ date: string, name: string }>
}

export type AttendanceRecord = {
    id: string
    date: string
    status: AttendanceStatus
    checkInAt: string | null
    checkOutAt: string | null
    note: string | null
    attachment: FileAttachment | null
}

export type LeaveType = 'izin' | 'sakit'
export type LeaveStatus = 'menunggu' | 'disetujui' | 'ditolak'

export type LeaveRequest = {
    id: string
    type: LeaveType
    startDate: string
    endDate: string
    reason: string
    attachment: FileAttachment | null
    status: LeaveStatus
    reviewedBy: string | null
    reviewedAt: string | null
    reviewNote: string | null
    createdAt: string
}

export type NotificationPreferences = {
    pushNotifications: boolean
}

export type Guardian = {
    relation: string
    name: string
    phone: string | null
    email: string | null
    hasAppAccount: boolean
}

export type NotificationType = 'grade_published' | 'attendance' | 'announcement' | 'leave_request' | 'payment'

export type NotificationItem = {
    id: string
    type: NotificationType
    title: string
    body: string
    studentId: string | null
    // URL frontend hasil terjemahan `target` dari backend.
    href: string
    read: boolean
    createdAt: string
}

export type NotificationPage = Paginated<NotificationItem> & {
    unreadCount: number
}
