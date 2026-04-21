import { mockGradesByStudentId, mockReportDetailsByReportId, mockReportSummariesByStudentId } from '@/lib/mock-data'
import { AcademicService } from '@/services/academic-service'
import { apiRequest, setAccessToken } from '@/services/api-client'
import { AuthUser, DashboardData, ScheduleItem, StudentProfile, StudentSummary } from '@/types/academic'

type LoginResponse = {
    token?: string
    access_token?: string
    user?: LoginUserPayload
    data?: LoginResponseData
}

type LoginUserPayload = {
    id?: string | number
    name?: string
    full_name?: string
    email?: string
    role?: string
}

type LoginResponseData = {
    token?: string
    access_token?: string
    user?: LoginUserPayload
    id?: string | number
    name?: string
    full_name?: string
    email?: string
    role?: string
}

type MeResponse = {
    message?: string
    data?: LoginUserPayload
}

type StudentProfileResponse = {
    message?: string
    data?: {
        id?: string
        nipd?: string | null
        nisn?: string | null
        nama_lengkap?: string
        nama_panggilan?: string
        tempat_lahir?: string
        tanggal_lahir?: string
        jenis_kelamin?: string
        agama?: string
        status_aktif?: boolean
        sekolah?: {
            nama?: string
            jenis?: string
        }
        alamat?: {
            jalan?: string | null
        }
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
    data?: Array<{
        relation_id?: string
        relationship?: string
        student?: {
            id?: string
            name?: string
            nickname?: string
            nis?: string
            nisn?: string
            school?: string
            school_unit?: string
        }
    }>
}

function buildAvatarInitials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'US'
}

function normalizeRole(rawRole: unknown, username: string): AuthUser['role'] {
    if (typeof rawRole === 'string') {
        const normalized = rawRole.toLowerCase()

        if (normalized.includes('wali') || normalized.includes('parent') || normalized.includes('ortu')) {
            return 'wali_siswa'
        }

        if (normalized.includes('siswa') || normalized.includes('student')) {
            return 'siswa'
        }
    }

    return username.toLowerCase().includes('siswa') ? 'siswa' : 'wali_siswa'
}

function getMockCompatibleUserId(role: AuthUser['role']) {
    return role === 'siswa' ? 'user-siswa-1' : 'user-wali-1'
}

function mapLoginResponseToAuthUser(response: LoginResponse, username: string): AuthUser {
    const token = response.token ?? response.access_token ?? response.data?.token ?? response.data?.access_token

    if (!token) {
        throw new Error('Login succeeded but access token was not found in response')
    }

    setAccessToken(token)

    const rawUser: LoginUserPayload = response.user ?? response.data?.user ?? response.data ?? {}
    const role = normalizeRole(rawUser.role, username)
    const fallbackName = role === 'siswa' ? 'Ahmad Fauzan' : 'Aisyah Rahma'
    const fallbackEmail = role === 'siswa' ? 'siswa@bis.test' : 'wali@bis.test'

    return {
        // Temporary mock-compatible ID so student context and downstream pages keep working
        // while linked-student and dashboard endpoints are still using local dummy data.
        id: getMockCompatibleUserId(role),
        name: typeof rawUser.name === 'string' ? rawUser.name : typeof rawUser.full_name === 'string' ? rawUser.full_name : fallbackName,
        email: typeof rawUser.email === 'string' ? rawUser.email : fallbackEmail,
        role,
        avatarInitials: buildAvatarInitials(typeof rawUser.name === 'string' ? rawUser.name : fallbackName),
    }
}

function mapMeResponseToAuthUser(response: MeResponse): AuthUser {
    const rawUser = response.data ?? {}
    const name = typeof rawUser.name === 'string' ? rawUser.name : typeof rawUser.full_name === 'string' ? rawUser.full_name : 'Pengguna BIS'
    const role = normalizeRole(rawUser.role, typeof rawUser.name === 'string' ? rawUser.name : '')

    return {
        // Temporary mock-compatible ID so the rest of the app can continue using
        // fallback mock services until profile/dashboard/student endpoints are real.
        id: getMockCompatibleUserId(role),
        name,
        email: typeof rawUser.email === 'string' ? rawUser.email : 'user@bis.test',
        role,
        avatarInitials: buildAvatarInitials(name),
    }
}

function mapStudentProfileResponse(response: StudentProfileResponse): StudentProfile {
    const data = response.data ?? {}

    return {
        id: data.id ?? 'student-1',
        name: data.nama_lengkap ?? 'Siswa BIS',
        nickname: data.nama_panggilan ?? data.nama_lengkap ?? 'Siswa',
        nis: data.nisn ?? data.nipd ?? '-',
        unit: data.sekolah?.jenis ?? 'BIS',
        className: '-',
        semesterLabel: '-',
        homeroomTeacher: '-',
        avatarInitials: buildAvatarInitials(data.nama_lengkap ?? 'Siswa BIS'),
        birthplace: data.tempat_lahir ?? undefined,
        birthDate: data.tanggal_lahir ?? undefined,
        gender: data.jenis_kelamin ?? undefined,
        religion: data.agama ?? undefined,
        statusActive: data.status_aktif ?? undefined,
        addressLine: data.alamat?.jalan ?? undefined,
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
    return (response.data ?? []).map((item) => {
        const student = item.student ?? {}
        const name = student.name ?? 'Siswa BIS'

        return {
            id: student.id ?? item.relation_id ?? crypto.randomUUID(),
            name,
            nickname: student.nickname ?? name,
            nis: student.nis ?? '-',
            nisn: student.nisn ?? undefined,
            unit: student.school_unit ?? 'BIS',
            schoolName: student.school ?? undefined,
            className: '-',
            semesterLabel: '-',
            homeroomTeacher: '-',
            avatarInitials: buildAvatarInitials(name),
        }
    })
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
    async login(identity, password) {
        const response = await apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { username: identity, password },
        })

        return mapLoginResponseToAuthUser(response, identity)
    },

    async getCurrentUser() {
        const response = await apiRequest<MeResponse>('/auth/me', {
            headers: {
                Accept: 'application/json',
            },
        })

        return mapMeResponseToAuthUser(response)
    },

    async logout() {
        await apiRequest('/auth/logout', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
        })
    },

    async getStudentProfile() {
        const response = await apiRequest<StudentProfileResponse>('/me', {
            headers: {
                Accept: 'application/json',
            },
        })

        return mapStudentProfileResponse(response)
    },

    getLinkedStudents(_userId) {
        return apiRequest<ChildrenResponse>('/children').then(mapChildrenResponse)
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
