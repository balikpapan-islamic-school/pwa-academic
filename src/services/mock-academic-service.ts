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
    mockStudents,
    mockUsers,
} from '@/lib/mock-data'
import { ChildLinkRequest, childRelationshipLabels, childRequestStatusLabels, dummyChildRequests, dummyStudent } from '@/lib/dummy-ui'
import { AcademicService } from '@/services/academic-service'
import { ApiError } from '@/services/api-client'

let mockChildRequests: ChildLinkRequest[] = [...dummyChildRequests]

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

    async loginWithGoogle() {
        return wait(mockUsers.wali_siswa, 450)
    },

    async getCurrentUser() {
        return wait(mockUsers.wali_siswa, 200)
    },

    async updateProfile({ name }) {
        mockUsers.wali_siswa = { ...mockUsers.wali_siswa, name }
        return wait(mockUsers.wali_siswa, 400)
    },

    async updatePassword() {
        mockUsers.wali_siswa = { ...mockUsers.wali_siswa, hasPassword: true }
        return wait(undefined, 400)
    },

    async logout() {
        return wait(undefined, 100)
    },

    async getStudentProfile(studentId) {
        const student = mockStudents.find((item) => item.id === studentId) ?? mockStudents[0]

        return wait({
            id: student.id,
            name: student.name,
            nickname: student.nickname,
            nis: student.nis,
            nisn: student.nisn ?? null,
            className: student.className,
            statusActive: true,
            birthplace: 'Balikpapan',
            birthDate: '2010-05-14',
            gender: 'perempuan',
            email: 'naura.aulia@bis.sch.id',
            phone: '0812-xxxx-2210',
            homeroomTeacher: student.homeroomTeacher,
            photoUrl: null,
        }, 200)
    },

    async getLinkedStudents(userId) {
        return wait(mockLinkedStudentsByUserId[userId] ?? [], 250)
    },

    async getChildRequests() {
        return wait(mockChildRequests, 250)
    },

    // Meniru aturan backend POST /children/requests (error 422 di errors.nik).
    async createChildRequest({ nik, birthDate, nisn, relationship }) {
        await wait(undefined, 600)

        if (nik === dummyStudent.nik) {
            throw new ApiError(422, 'Anak ini sudah terhubung dengan akun Anda.', { nik: ['Anak ini sudah terhubung dengan akun Anda.'] })
        }
        if (mockChildRequests.some((request) => request.nik === nik && request.status === 'PENDING')) {
            throw new ApiError(422, 'Pengajuan untuk anak ini masih menunggu verifikasi.', { nik: ['Pengajuan untuk anak ini masih menunggu verifikasi.'] })
        }

        const request: ChildLinkRequest = {
            id: `req-${Date.now()}`,
            nik,
            birthDate,
            nisn,
            relationship: childRelationshipLabels[relationship],
            status: 'PENDING',
            statusLabel: childRequestStatusLabels.PENDING,
            note: null,
            submittedAt: new Date().toISOString(),
            processedAt: null,
            student: null,
        }
        mockChildRequests = [request, ...mockChildRequests]

        return request
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
