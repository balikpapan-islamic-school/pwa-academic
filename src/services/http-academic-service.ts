import { AcademicService } from '@/services/academic-service'
import { apiRequest, setAccessToken } from '@/services/api-client'
import { AuthUser, StudentProfile } from '@/types/academic'

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

    getLinkedStudents(userId) {
        return apiRequest(`/users/${userId}/students`)
    },

    getDashboard(studentId) {
        return apiRequest(`/students/${studentId}/dashboard`)
    },

    getSchedule(studentId) {
        return apiRequest(`/students/${studentId}/schedule`)
    },

    getAttendance(studentId) {
        return apiRequest(`/students/${studentId}/attendance`)
    },

    getAttendanceSummary(studentId) {
        return apiRequest(`/students/${studentId}/attendance/summary`)
    },

    getGrades(studentId) {
        return apiRequest(`/students/${studentId}/grades`)
    },

    getReportSummaries(studentId) {
        return apiRequest(`/students/${studentId}/reports`)
    },

    getReportDetail(reportId) {
        return apiRequest(`/reports/${reportId}`)
    },

    getNotifications(userId) {
        return apiRequest(`/users/${userId}/notifications`)
    },
}
