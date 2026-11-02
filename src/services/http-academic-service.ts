import { mockReportDetailsByReportId, mockReportSummariesByStudentId } from '@/lib/mock-data'
import { ChildLinkRequest } from '@/lib/dummy-ui'
import { AcademicService, PageParams } from '@/services/academic-service'
import { apiRequest, buildQuery, setAccessToken } from '@/services/api-client'
import {
    AttendanceRecord,
    AttendanceStatus,
    AuthUser,
    FileAttachment,
    GradeEntry,
    LeaveRequest,
    Lesson,
    NewsArticle,
    NewsArticleDetail,
    NotificationItem,
    NotificationType,
    Paginated,
    PaginationMeta,
    Semester,
    StudentProfile,
    StudentSummary,
} from '@/types/academic'

const DEVICE_NAME = 'PWA BIS'

type UserPayload = {
    id: string
    name: string
    email: string
    role: string
    avatar_url: string | null
    has_password: boolean
    linked_students_count: number
}

type LoginResponse = {
    message?: string
    data: {
        token: string
        expires_at: string
        user: UserPayload
    }
}

type GoogleLoginResponse = LoginResponse & {
    data: LoginResponse['data'] & { is_new_account: boolean }
}

type UserResponse = {
    message?: string
    data: UserPayload
}

type StudentProfileResponse = {
    message?: string
    data: {
        id: string
        nama_lengkap: string
        nama_panggilan: string | null
        nis: string | null
        nisn: string | null
        kelas: string | null
        status_aktif: boolean
        tempat_lahir: string | null
        tanggal_lahir: string | null
        jenis_kelamin: 'laki-laki' | 'perempuan' | null
        email: string | null
        no_hp: string | null
        wali_kelas: string | null
        foto_url: string | null
    }
}

type DataResponse<T> = {
    message?: string
    data: T
}

type MetaPayload = {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

type PaginatedResponse<T, Meta = MetaPayload> = {
    message?: string
    data: T[]
    meta: Meta
}

type FilePayload = {
    name: string
    mime_type: string
    size_bytes: number
    page_count?: number | null
    url: string
    expires_at?: string | null
}

type SemesterPayload = {
    id: string
    name: string
    school_year: string
    is_active?: boolean
}

type LessonPayload = {
    id: string
    subject: { id: string, name: string }
    teacher_name?: string | null
    start_time: string
    end_time: string
    room: string | null
}

type DashboardPayload = {
    student: {
        id: string
        name: string
        nickname: string | null
        class_name: string | null
        semester: SemesterPayload | null
        photo_url: string | null
    }
    unread_notifications_count: number
    new_grades_count: number
    attendance_rate: number
    today: {
        date: string
        is_school_day: boolean
        lessons: LessonPayload[]
    }
}

type NewsPayload = {
    id: string
    category: NewsArticle['category']
    title: string
    summary: string | null
    cover_image_url: string | null
    author: string | null
    published_at: string
}

type NewsDetailPayload = NewsPayload & {
    content: string | null
}

type GradeEntryPayload = {
    id: string
    type: 'score' | 'file'
    subject: {
        id: string | null
        name: string | null
        teacher_name: string | null
    }
    assessment: string
    score: number | null
    note: string | null
    file: FilePayload | null
    published_at: string
}

type SubjectPayload = {
    id: string
    name: string
    teacher_name: string | null
    hours_per_week: number | null
}

type ClassmatePayload = {
    id: string
    name: string
    initials: string
    photo_url?: string | null
}

type ClassroomPayload = {
    id: string
    name: string
    grade_level: string | null
    room: string | null
    location: string | null
    homeroom_teacher: string | null
    student_count: number
    classmates_preview: ClassmatePayload[]
}

type SchedulePayload = {
    week_start: string
    days: Array<{
        date: string
        day_of_week: number
        is_school_day: boolean
        holiday_name: string | null
        lessons: LessonPayload[]
    }>
}

type AttendanceTodayPayload = {
    date: string
    is_school_day: boolean
    status: AttendanceStatus | null
    check_in_at: string | null
    check_out_at: string | null
    punctuality: 'tepat_waktu' | 'terlambat' | null
}

type AttendanceSummaryPayload = Record<AttendanceStatus, number> & {
    attendance_rate: number
}

type AttendanceCalendarPayload = {
    month: string
    days: Array<{ date: string, status: AttendanceStatus }>
    holidays?: Array<{ date: string, name: string }> | null
}

type AttendanceRecordPayload = {
    id: string
    date: string
    status: AttendanceStatus
    check_in_at: string | null
    check_out_at: string | null
    note: string | null
    attachment: FilePayload | null
}

type LeaveRequestPayload = {
    id: string
    type: LeaveRequest['type']
    start_date: string
    end_date: string
    reason: string
    attachment: FilePayload | null
    status: LeaveRequest['status']
    reviewed_by: string | null
    reviewed_at: string | null
    review_note: string | null
    created_at: string
}

type PreferencesPayload = {
    push_notifications: boolean
}

type GuardianPayload = {
    relation: string
    name: string
    phone: string | null
    email: string | null
    has_app_account: boolean
}

type NotificationPayload = {
    id: string
    type: NotificationType
    title: string
    body: string
    student_id: string | null
    target: { page: string, params?: Record<string, string> | null } | null
    is_read: boolean
    created_at: string
}

type UnreadCountPayload = {
    unread_count: number
}

type ChildrenResponse = {
    message?: string
    data: Array<{
        id: string
        name: string
        nickname: string | null
        nis: string | null
        nisn: string | null
        school: { id: string, name: string, level: string } | null
        class_name: string | null
        relation: string | null
        status_active: boolean
        photo_url: string | null
    }>
}

type ChildRequestPayload = {
    id: string
    nik: string
    tanggal_lahir: string
    nisn: string | null
    relationship: string
    status: ChildLinkRequest['status']
    status_label: string
    note: string | null
    submitted_at: string
    processed_at: string | null
    student: { id: string, name: string } | null
}

type ChildRequestsResponse = {
    message?: string
    data: ChildRequestPayload[]
}

type ChildRequestResponse = {
    message?: string
    data: ChildRequestPayload
}

function buildAvatarInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'US'
}

function getMockCompatibleUserId(role: AuthUser['role']) {
    return role === 'siswa' ? 'user-siswa-1' : 'user-wali-1'
}

function mapUserPayload(payload: UserPayload): AuthUser {
    const role: AuthUser['role'] = payload.role === 'siswa' ? 'siswa' : 'wali_siswa'

    return {
        // `GET /auth/me` tidak memakai ID ini di frontend; nilai mock tetap dipakai agar halaman Rapor lama
        // (data contoh) dan mode mock memakai kunci yang sama.
        id: getMockCompatibleUserId(role),
        name: payload.name,
        email: payload.email,
        role,
        avatarInitials: buildAvatarInitials(payload.name),
        avatarUrl: payload.avatar_url,
        hasPassword: payload.has_password,
        linkedStudentsCount: payload.linked_students_count,
    }
}

function mapLoginResponseToAuthUser(response: LoginResponse): AuthUser {
    setAccessToken(response.data.token)

    return mapUserPayload(response.data.user)
}

function mapStudentProfileResponse(response: StudentProfileResponse): StudentProfile {
    const data = response.data

    return {
        id: data.id,
        name: data.nama_lengkap,
        nickname: data.nama_panggilan ?? data.nama_lengkap,
        nis: data.nis ?? '-',
        nisn: data.nisn,
        className: data.kelas ?? '-',
        statusActive: data.status_aktif,
        birthplace: data.tempat_lahir,
        birthDate: data.tanggal_lahir,
        gender: data.jenis_kelamin,
        email: data.email,
        phone: data.no_hp,
        homeroomTeacher: data.wali_kelas,
        photoUrl: data.foto_url,
    }
}

function mapMeta(meta: MetaPayload): PaginationMeta {
    return {
        currentPage: meta.current_page,
        perPage: meta.per_page,
        total: meta.total,
        lastPage: meta.last_page,
    }
}

function mapPaginated<T, R>(response: PaginatedResponse<T>, mapItem: (item: T) => R): Paginated<R> {
    return { items: response.data.map(mapItem), meta: mapMeta(response.meta) }
}

function mapFile(file: FilePayload | null): FileAttachment | null {
    if (!file) {
        return null
    }

    return {
        name: file.name,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        pageCount: file.page_count ?? null,
        url: file.url,
        expiresAt: file.expires_at ?? null,
    }
}

function mapSemester(semester: SemesterPayload): Semester {
    return {
        id: semester.id,
        name: semester.name,
        schoolYear: semester.school_year,
        isActive: semester.is_active ?? false,
    }
}

function mapLesson(lesson: LessonPayload): Lesson {
    return {
        id: lesson.id,
        subject: lesson.subject,
        teacherName: lesson.teacher_name ?? null,
        startTime: lesson.start_time,
        endTime: lesson.end_time,
        room: lesson.room,
    }
}

function mapNews(item: NewsPayload): NewsArticle {
    return {
        id: item.id,
        category: item.category,
        title: item.title,
        summary: item.summary ?? '',
        coverImageUrl: item.cover_image_url,
        author: item.author,
        publishedAt: item.published_at,
    }
}

// Baris nilai yang belum diisi guru (tanpa angka, file, maupun keterangan) tidak ditampilkan.
function mapGradeEntries(items: GradeEntryPayload[]): GradeEntry[] {
    return items.flatMap((item): GradeEntry[] => {
        const file = mapFile(item.file)

        if (item.score === null && !file && !item.note) {
            return []
        }

        const base = {
            id: item.id,
            subject: {
                id: item.subject.id ?? 'tanpa-mapel',
                name: item.subject.name ?? 'Tanpa mapel',
                teacherName: item.subject.teacher_name,
            },
            assessment: item.assessment,
            score: item.score,
            note: item.note,
            publishedAt: item.published_at,
        }

        return [file ? { ...base, kind: 'file', file } : { ...base, kind: 'score' }]
    })
}

function mapClassmate(item: ClassmatePayload) {
    return { id: item.id, name: item.name, initials: item.initials, photoUrl: item.photo_url ?? null }
}

function mapAttendanceRecord(item: AttendanceRecordPayload): AttendanceRecord {
    return {
        id: item.id,
        date: item.date,
        status: item.status,
        checkInAt: item.check_in_at,
        checkOutAt: item.check_out_at,
        note: item.note,
        attachment: mapFile(item.attachment),
    }
}

function mapLeaveRequest(item: LeaveRequestPayload): LeaveRequest {
    return {
        id: item.id,
        type: item.type,
        startDate: item.start_date,
        endDate: item.end_date,
        reason: item.reason,
        attachment: mapFile(item.attachment),
        status: item.status,
        reviewedBy: item.reviewed_by,
        reviewedAt: item.reviewed_at,
        reviewNote: item.review_note,
        createdAt: item.created_at,
    }
}

// Halaman frontend yang bisa dituju dari `target.page` notifikasi.
const notificationPages: Record<string, string> = {
    beranda: '/',
    dashboard: '/',
    akademik: '/akademik',
    nilai: '/akademik',
    jadwal: '/akademik?tab=kelas',
    absensi: '/absensi',
    profil: '/profil',
    notifikasi: '/notifikasi',
}

function mapNotificationTarget(target: NotificationPayload['target']) {
    const path = target ? notificationPages[target.page] ?? '/' : '/'
    const params = new URLSearchParams(target?.params ?? {}).toString()

    if (!params) {
        return path
    }

    return `${path}${path.includes('?') ? '&' : '?'}${params}`
}

function mapNotification(item: NotificationPayload): NotificationItem {
    return {
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        studentId: item.student_id,
        href: mapNotificationTarget(item.target),
        read: item.is_read,
        createdAt: item.created_at,
    }
}

function pageQuery(params?: PageParams) {
    return { page: params?.page, per_page: params?.perPage }
}

function mapChildrenResponse(response: ChildrenResponse): StudentSummary[] {
    return response.data.map((child) => ({
        id: child.id,
        name: child.name,
        nickname: child.nickname ?? child.name.split(' ')[0] ?? child.name,
        nis: child.nis ?? '-',
        nisn: child.nisn ?? undefined,
        unit: child.school?.level ?? 'BIS',
        schoolName: child.school?.name,
        className: child.class_name ?? '-',
        semesterLabel: '-',
        homeroomTeacher: '-',
        avatarInitials: buildAvatarInitials(child.name),
        photoUrl: child.photo_url,
        statusActive: child.status_active,
        relation: child.relation ?? undefined,
    }))
}

function mapChildRequest(item: ChildRequestPayload): ChildLinkRequest {
    return {
        id: item.id,
        nik: item.nik,
        birthDate: item.tanggal_lahir,
        nisn: item.nisn,
        relationship: item.relationship,
        status: item.status,
        statusLabel: item.status_label,
        note: item.note,
        submittedAt: item.submitted_at,
        processedAt: item.processed_at,
        student: item.student,
    }
}

function resolveMockStudentId(studentId: string) {
    if (mockReportSummariesByStudentId[studentId]) {
        return studentId
    }

    return 'student-1'
}

function resolveMockReportDetail(reportId: string) {
    return mockReportDetailsByReportId[reportId] ?? mockReportDetailsByReportId['rep-1']
}

export const httpAcademicService: AcademicService = {
    async login(email, password) {
        const response = await apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { email, password, device_name: DEVICE_NAME },
        })

        return mapLoginResponseToAuthUser(response)
    },

    async loginWithGoogle(idToken) {
        const response = await apiRequest<GoogleLoginResponse>('/auth/google', {
            method: 'POST',
            body: { id_token: idToken, device_name: DEVICE_NAME },
        })

        return mapLoginResponseToAuthUser(response)
    },

    async getCurrentUser() {
        const response = await apiRequest<UserResponse>('/auth/me')

        return mapUserPayload(response.data)
    },

    async updateProfile({ name }) {
        const response = await apiRequest<UserResponse>('/auth/me', {
            method: 'PATCH',
            body: { name },
        })

        return mapUserPayload(response.data)
    },

    async updatePassword({ currentPassword, password, passwordConfirmation }) {
        await apiRequest('/auth/password', {
            method: 'PUT',
            body: {
                ...(currentPassword ? { current_password: currentPassword } : {}),
                password,
                password_confirmation: passwordConfirmation,
            },
        })
    },

    async logout() {
        await apiRequest('/auth/logout', { method: 'POST' })
    },

    getStudentProfile(studentId) {
        return apiRequest<StudentProfileResponse>(`/me?student_id=${encodeURIComponent(studentId)}`).then(mapStudentProfileResponse)
    },

    getLinkedStudents(_userId) {
        return apiRequest<ChildrenResponse>('/children').then(mapChildrenResponse)
    },

    getChildRequests() {
        return apiRequest<ChildRequestsResponse>('/children/requests').then((response) => response.data.map(mapChildRequest))
    },

    async createChildRequest({ nik, birthDate, nisn, relationship }) {
        const response = await apiRequest<ChildRequestResponse>('/children/requests', {
            method: 'POST',
            body: {
                nik,
                tanggal_lahir: birthDate,
                ...(nisn ? { nisn } : {}),
                hubungan: relationship,
            },
        })

        return mapChildRequest(response.data)
    },

    async getDashboard(studentId) {
        const { data } = await apiRequest<DataResponse<DashboardPayload>>(`/dashboard${buildQuery({ student_id: studentId })}`)

        return {
            student: {
                id: data.student.id,
                name: data.student.name,
                nickname: data.student.nickname ?? data.student.name.split(' ')[0] ?? data.student.name,
                className: data.student.class_name,
                semester: data.student.semester ? mapSemester(data.student.semester) : null,
                photoUrl: data.student.photo_url,
            },
            unreadNotificationsCount: data.unread_notifications_count,
            newGradesCount: data.new_grades_count,
            attendanceRate: data.attendance_rate,
            today: {
                date: data.today.date,
                isSchoolDay: data.today.is_school_day,
                lessons: data.today.lessons.map(mapLesson),
            },
        }
    },

    async getNews(params) {
        const response = await apiRequest<PaginatedResponse<NewsPayload>>(`/news${buildQuery({ category: params?.category, ...pageQuery(params) })}`)

        return mapPaginated(response, mapNews)
    },

    async getNewsDetail(newsId): Promise<NewsArticleDetail> {
        const { data } = await apiRequest<DataResponse<NewsDetailPayload>>(`/news/${encodeURIComponent(newsId)}`)

        return { ...mapNews(data), content: data.content ?? '' }
    },

    async getSemesters(studentId) {
        const { data } = await apiRequest<DataResponse<SemesterPayload[]>>(`/semesters${buildQuery({ student_id: studentId })}`)

        return data.map(mapSemester)
    },

    async getGradeEntries(studentId, semesterId) {
        const { data } = await apiRequest<DataResponse<GradeEntryPayload[]>>(`/grades/entries${buildQuery({ student_id: studentId, semester_id: semesterId })}`)

        return mapGradeEntries(data)
    },

    async getSubjects(studentId, semesterId) {
        const { data } = await apiRequest<DataResponse<SubjectPayload[]>>(`/subjects${buildQuery({ student_id: studentId, semester_id: semesterId })}`)

        return data.map((item) => ({
            id: item.id,
            name: item.name,
            teacherName: item.teacher_name,
            hoursPerWeek: item.hours_per_week ?? 0,
        }))
    },

    async getClassroom(studentId, semesterId) {
        const { data } = await apiRequest<DataResponse<ClassroomPayload>>(`/classroom${buildQuery({ student_id: studentId, semester_id: semesterId })}`)

        return {
            id: data.id,
            name: data.name,
            gradeLevel: data.grade_level,
            room: data.room,
            location: data.location,
            homeroomTeacher: data.homeroom_teacher,
            studentCount: data.student_count,
            classmatesPreview: data.classmates_preview.map(mapClassmate),
        }
    },

    async getClassmates(studentId, semesterId) {
        const { data } = await apiRequest<DataResponse<ClassmatePayload[]>>(`/classroom/students${buildQuery({ student_id: studentId, semester_id: semesterId })}`)

        return data.map(mapClassmate)
    },

    async getSchedule(studentId, weekStart) {
        const { data } = await apiRequest<DataResponse<SchedulePayload>>(`/schedule${buildQuery({ student_id: studentId, week_start: weekStart })}`)

        return {
            weekStart: data.week_start,
            days: data.days.map((day) => ({
                date: day.date,
                dayOfWeek: day.day_of_week,
                isSchoolDay: day.is_school_day,
                holidayName: day.holiday_name,
                lessons: day.lessons.map(mapLesson),
            })),
        }
    },

    async getAttendanceToday(studentId) {
        const { data } = await apiRequest<DataResponse<AttendanceTodayPayload>>(`/attendance/today${buildQuery({ student_id: studentId })}`)

        return {
            date: data.date,
            isSchoolDay: data.is_school_day,
            status: data.status,
            checkInAt: data.check_in_at,
            checkOutAt: data.check_out_at,
            punctuality: data.punctuality,
        }
    },

    async getAttendanceSummary(studentId, semesterId) {
        const { data } = await apiRequest<DataResponse<AttendanceSummaryPayload>>(`/attendance/summary${buildQuery({ student_id: studentId, semester_id: semesterId })}`)

        return { hadir: data.hadir, izin: data.izin, sakit: data.sakit, alfa: data.alfa, attendanceRate: data.attendance_rate }
    },

    async getAttendanceCalendar(studentId, month) {
        const { data } = await apiRequest<DataResponse<AttendanceCalendarPayload>>(`/attendance/calendar${buildQuery({ student_id: studentId, month })}`)

        return { month: data.month, days: data.days, holidays: data.holidays ?? [] }
    },

    async getAttendanceHistory(studentId, params) {
        const response = await apiRequest<PaginatedResponse<AttendanceRecordPayload>>(`/attendance${buildQuery({ student_id: studentId, ...pageQuery(params) })}`)

        return mapPaginated(response, mapAttendanceRecord)
    },

    async getLeaveRequests(studentId, params) {
        const response = await apiRequest<PaginatedResponse<LeaveRequestPayload>>(`/attendance/leave-requests${buildQuery({ student_id: studentId, ...pageQuery(params) })}`)

        return mapPaginated(response, mapLeaveRequest)
    },

    async createLeaveRequest({ studentId, type, startDate, endDate, reason, attachment }) {
        const body = new FormData()
        body.append('student_id', studentId)
        body.append('type', type)
        body.append('start_date', startDate)
        body.append('end_date', endDate)
        body.append('reason', reason)
        if (attachment) {
            body.append('attachment', attachment)
        }

        const { data } = await apiRequest<DataResponse<LeaveRequestPayload>>('/attendance/leave-requests', { method: 'POST', body })

        return mapLeaveRequest(data)
    },

    async cancelLeaveRequest(leaveRequestId) {
        await apiRequest(`/attendance/leave-requests/${encodeURIComponent(leaveRequestId)}`, { method: 'DELETE' })
    },

    async getNotificationPreferences() {
        const { data } = await apiRequest<DataResponse<PreferencesPayload>>('/me/preferences')

        return { pushNotifications: data.push_notifications }
    },

    async updateNotificationPreferences({ pushNotifications }) {
        const { data } = await apiRequest<DataResponse<PreferencesPayload>>('/me/preferences', {
            method: 'PATCH',
            body: { push_notifications: pushNotifications },
        })

        return { pushNotifications: data.push_notifications }
    },

    async getGuardians(studentId) {
        const { data } = await apiRequest<DataResponse<GuardianPayload[]>>(`/me/guardians${buildQuery({ student_id: studentId })}`)

        return data.map((item) => ({
            relation: item.relation,
            name: item.name,
            phone: item.phone,
            email: item.email,
            hasAppAccount: item.has_app_account,
        }))
    },

    async getNotifications(params) {
        const response = await apiRequest<PaginatedResponse<NotificationPayload, MetaPayload & UnreadCountPayload>>(`/notifications${buildQuery(pageQuery(params))}`)

        return { ...mapPaginated(response, mapNotification), unreadCount: response.meta.unread_count }
    },

    async markNotificationRead(notificationId) {
        const { data } = await apiRequest<DataResponse<UnreadCountPayload>>(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' })

        return data.unread_count
    },

    async markAllNotificationsRead() {
        const { data } = await apiRequest<DataResponse<UnreadCountPayload>>('/notifications/read-all', { method: 'POST' })

        return data.unread_count
    },

    // GET /reports sudah dihapus dari backend; halaman Rapor lama tetap memakai data contoh.
    getReportSummaries(studentId) {
        return Promise.resolve(mockReportSummariesByStudentId[resolveMockStudentId(studentId)] ?? [])
    },

    getReportDetail(reportId) {
        return Promise.resolve(resolveMockReportDetail(reportId))
    },
}
