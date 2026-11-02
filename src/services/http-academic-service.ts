import { mockGradesByStudentId, mockReportDetailsByReportId, mockReportSummariesByStudentId } from '@/lib/mock-data'
import { ChildLinkRequest } from '@/lib/dummy-ui'
import { AcademicService } from '@/services/academic-service'
import { apiRequest, setAccessToken } from '@/services/api-client'
import { AuthUser, DashboardData, ScheduleItem, StudentProfile, StudentSummary } from '@/types/academic'

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

type DashboardResponse = {
    message?: string
    data?: {
        student?: {
            id?: string
            name?: string
            nickname?: string
            nis?: string
            unit?: string
            class_name?: string
            semester_label?: string
            homeroom_teacher?: string
        }
        today_schedule?: Array<{
            id?: string
            day?: string
            subject?: string
            teacher?: string | null
            start_time?: string
            end_time?: string
            room?: string
        }>
        attendance_summary?: {
            hadir?: number
            sakit?: number
            izin?: number
            alfa?: number
        }
        latest_report?: {
            id?: string
            semester?: string
            status?: 'Draft' | 'Final'
            average?: number
            published_at?: string | null
        }
    }
}

type ScheduleResponse = {
    message?: string
    data?: Array<{
        id?: string
        date?: string
        day?: string
        subject?: string
        teacher?: string | null
        start_time?: string
        end_time?: string
        room?: string
    }>
}

type AttendanceResponse = {
    message?: string
    data?: Array<{
        id?: string
        date?: string
        status?: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa'
        subject?: string | null
        note?: string | null
    }>
}

type AttendanceSummaryResponse = {
    message?: string
    data?: {
        hadir?: number
        sakit?: number
        izin?: number
        alfa?: number
    }
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
        // Temporary mock-compatible ID so notifications and other pages that still read
        // local dummy data keep working until their endpoints are integrated.
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

function mapStudentSummary(input?: {
    id?: string
    name?: string
    nickname?: string
    nis?: string
    unit?: string
    class_name?: string
    semester_label?: string
    homeroom_teacher?: string
}): StudentSummary {
    const name = input?.name ?? 'Siswa BIS'

    return {
        id: input?.id ?? 'student-1',
        name,
        nickname: input?.nickname ?? name,
        nis: input?.nis ?? '-',
        unit: input?.unit ?? 'BIS',
        className: input?.class_name ?? '-',
        semesterLabel: input?.semester_label ?? '-',
        homeroomTeacher: input?.homeroom_teacher ?? '-',
        avatarInitials: buildAvatarInitials(name),
    }
}

function mapDashboardResponse(response: DashboardResponse): DashboardData {
    const data = response.data ?? {}

    return {
        student: mapStudentSummary(data.student),
        todaySchedule: (data.today_schedule ?? []).map((item) => ({
            id: item.id ?? crypto.randomUUID(),
            day: item.day ?? '-',
            subject: item.subject ?? '-',
            teacher: item.teacher ?? '-',
            startTime: item.start_time ?? '-',
            endTime: item.end_time ?? '-',
            room: item.room ?? '-',
        })),
        attendanceSummary: {
            hadir: data.attendance_summary?.hadir ?? 0,
            sakit: data.attendance_summary?.sakit ?? 0,
            izin: data.attendance_summary?.izin ?? 0,
            alfa: data.attendance_summary?.alfa ?? 0,
        },
        latestAttendance: [],
        gradeHighlights: [],
        latestReport: {
            id: data.latest_report?.id ?? 'report-latest',
            semester: data.latest_report?.semester ?? '-',
            status: data.latest_report?.status ?? 'Draft',
            average: data.latest_report?.average ?? 0,
            publishedAt: data.latest_report?.published_at ?? undefined,
        },
        schoolAlert: null,
        agendas: [],
        news: [],
    }
}

function mapScheduleResponse(response: ScheduleResponse): ScheduleItem[] {
    return (response.data ?? []).map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        date: item.date ?? undefined,
        day: item.day ?? '-',
        subject: item.subject ?? '-',
        teacher: item.teacher ?? '-',
        startTime: item.start_time ?? '-',
        endTime: item.end_time ?? '-',
        room: item.room ?? '-',
    }))
}

function mapAttendanceResponse(response: AttendanceResponse) {
    return (response.data ?? []).map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        date: item.date ?? '-',
        status: item.status ?? 'Hadir',
        subject: item.subject ?? undefined,
        note: item.note ?? undefined,
    }))
}

function mapAttendanceSummaryResponse(response: AttendanceSummaryResponse) {
    return {
        hadir: response.data?.hadir ?? 0,
        sakit: response.data?.sakit ?? 0,
        izin: response.data?.izin ?? 0,
        alfa: response.data?.alfa ?? 0,
    }
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
    if (mockGradesByStudentId[studentId] || mockReportSummariesByStudentId[studentId]) {
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

    getDashboard(studentId) {
        void studentId
        return apiRequest<DashboardResponse>('/dashboard').then(mapDashboardResponse)
    },

    getSchedule(_studentId) {
        return apiRequest<ScheduleResponse>('/schedule').then(mapScheduleResponse)
    },

    getAttendance(_studentId) {
        return apiRequest<AttendanceResponse>('/attendance').then(mapAttendanceResponse)
    },

    getAttendanceSummary(_studentId) {
        return apiRequest<AttendanceSummaryResponse>('/attendance/summary').then(mapAttendanceSummaryResponse)
    },

    getGrades(studentId) {
        return Promise.resolve(mockGradesByStudentId[resolveMockStudentId(studentId)] ?? [])
    },

    getReportSummaries(studentId) {
        return Promise.resolve(mockReportSummariesByStudentId[resolveMockStudentId(studentId)] ?? [])
    },

    getReportDetail(reportId) {
        return Promise.resolve(resolveMockReportDetail(reportId))
    },

    getNotifications(userId) {
        return apiRequest(`/users/${userId}/notifications`)
    },
}
