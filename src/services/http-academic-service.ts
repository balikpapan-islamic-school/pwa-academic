import { AcademicService } from '@/services/academic-service'
import { apiRequest, setAccessToken } from '@/services/api-client'
import { AuthUser } from '@/types/academic'

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
        // Temporary mock-compatible ID so the rest of the app can keep using local dummy data
        // while only login has been moved to the real API.
        id: role === 'siswa' ? 'user-siswa-1' : 'user-wali-1',
        name: typeof rawUser.name === 'string' ? rawUser.name : typeof rawUser.full_name === 'string' ? rawUser.full_name : fallbackName,
        email: typeof rawUser.email === 'string' ? rawUser.email : fallbackEmail,
        role,
        avatarInitials: buildAvatarInitials(typeof rawUser.name === 'string' ? rawUser.name : fallbackName),
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
