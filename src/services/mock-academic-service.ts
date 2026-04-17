import {
    mockAttendanceByStudentId,
    mockAttendanceSummaryByStudentId,
    mockDashboardByStudentId,
    mockGradesByStudentId,
    mockLinkedStudentsByUserId,
    mockNotificationsByUserId,
    mockReportDetailsByReportId,
    mockReportSummariesByStudentId,
    mockScheduleByStudentId,
    mockUsers,
} from '@/lib/mock-data'
import { AcademicService } from '@/services/academic-service'

function wait<T>(data: T, timeout = 300): Promise<T> {
    return new Promise((resolve) => {
        window.setTimeout(() => resolve(data), timeout)
    })
}

export const mockAcademicService: AcademicService = {
    async login(identity, _password) {
        const normalized = identity.trim().toLowerCase()
        const user = normalized.includes('siswa') || normalized.includes('ahmad')
            ? mockUsers.siswa
            : mockUsers.wali_siswa

        return wait(user, 450)
    },

    async getCurrentUser() {
        return wait(mockUsers.wali_siswa, 200)
    },

    async logout() {
        return wait(undefined, 100)
    },

    async getStudentProfile() {
        const student = mockLinkedStudentsByUserId['user-siswa-1'][0]

        return wait({
            ...student,
            birthplace: 'Balikpapan',
            birthDate: '2019-01-01',
            gender: 'Laki-laki',
            religion: 'Islam',
            statusActive: true,
            addressLine: 'Jl. Pandan Arum, Balikpapan',
        }, 200)
    },

    async getLinkedStudents(userId) {
        return wait(mockLinkedStudentsByUserId[userId] ?? [], 250)
    },

    async getDashboard(studentId) {
        return wait(mockDashboardByStudentId[studentId], 350)
    },

    async getSchedule(studentId) {
        return wait(mockScheduleByStudentId[studentId] ?? [], 250)
    },

    async getAttendance(studentId) {
        return wait(mockAttendanceByStudentId[studentId] ?? [], 250)
    },

    async getAttendanceSummary(studentId) {
        return wait(mockAttendanceSummaryByStudentId[studentId] ?? { hadir: 0, sakit: 0, izin: 0, alfa: 0 }, 250)
    },

    async getGrades(studentId) {
        return wait(mockGradesByStudentId[studentId] ?? [], 250)
    },

    async getReportSummaries(studentId) {
        return wait(mockReportSummariesByStudentId[studentId] ?? [], 250)
    },

    async getReportDetail(reportId) {
        return wait(mockReportDetailsByReportId[reportId], 250)
    },

    async getNotifications(userId) {
        return wait(mockNotificationsByUserId[userId] ?? [], 250)
    },
}
