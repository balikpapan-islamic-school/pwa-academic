import { mockLinkedStudentsByUserId, mockReportDetailsByReportId, mockReportSummariesByStudentId, mockStudents, mockUsers } from '@/lib/mock-data'
import {
    ChildLinkRequest,
    childRelationshipLabels,
    childRequestStatusLabels,
    dummyAttendanceHistory,
    dummyAttendanceSpecialDays,
    dummyAttendanceSummary,
    dummyChildRequests,
    dummyClassmates,
    dummyClassroom,
    dummyGradeEntries,
    dummyGuardians,
    dummyLeaveRequests,
    dummyLessonsForDay,
    dummyNews,
    dummyNotifications,
    dummySemesters,
    dummyStudent,
    dummySubjects,
} from '@/lib/dummy-ui'
import { isNewGrade } from '@/lib/grades'
import { parseIsoDate, startOfWeek, toIsoDate } from '@/lib/format'
import { AcademicService, PageParams } from '@/services/academic-service'
import { ApiError } from '@/services/api-client'
import { AttendanceStatus, LeaveRequest, NotificationItem, Paginated } from '@/types/academic'

let mockChildRequests: ChildLinkRequest[] = [...dummyChildRequests]
let mockLeaveRequests: LeaveRequest[] = [...dummyLeaveRequests]
let mockNotifications: NotificationItem[] = [...dummyNotifications]
let mockPushNotifications = true

function wait<T>(data: T, timeout = 300): Promise<T> {
    return new Promise((resolve) => {
        window.setTimeout(() => resolve(data), timeout)
    })
}

function paginate<T>(items: T[], params?: PageParams): Paginated<T> {
    const perPage = params?.perPage ?? 20
    const currentPage = params?.page ?? 1

    return {
        items: items.slice((currentPage - 1) * perPage, currentPage * perPage),
        meta: { currentPage, perPage, total: items.length, lastPage: Math.max(1, Math.ceil(items.length / perPage)) },
    }
}

// 1 = Senin ... 7 = Minggu
function dayOfWeek(date: Date) {
    return ((date.getDay() + 6) % 7) + 1
}

// Hari sekolah yang sudah lewat dianggap hadir, kecuali yang tercatat khusus.
function mockStatusFor(date: Date, today: Date): AttendanceStatus | null {
    if (dayOfWeek(date) > 5 || date > today) {
        return null
    }

    return dummyAttendanceSpecialDays[toIsoDate(date)] ?? 'hadir'
}

function unreadNotificationCount() {
    return mockNotifications.filter((notification) => !notification.read).length
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
        const student = mockStudents.find((item) => item.id === studentId) ?? mockStudents[0]
        const today = new Date()
        const lessons = dummyLessonsForDay(dayOfWeek(today))
        const activeSemester = dummySemesters.find((semester) => semester.isActive) ?? null

        return wait({
            student: {
                id: student.id,
                name: student.name,
                nickname: student.nickname,
                className: student.className,
                semester: activeSemester ? { id: activeSemester.id, name: activeSemester.name, schoolYear: activeSemester.schoolYear } : null,
                photoUrl: student.photoUrl ?? null,
            },
            unreadNotificationsCount: unreadNotificationCount(),
            newGradesCount: dummyGradeEntries.filter((entry) => isNewGrade(entry)).length,
            attendanceRate: dummyAttendanceSummary.attendanceRate,
            today: { date: toIsoDate(today), isSchoolDay: lessons.length > 0, lessons },
        }, 350)
    },

    async getNews(params) {
        const items = dummyNews.filter((item) => !params?.category || item.category === params.category)
        return wait(paginate(items, params), 250)
    },

    async getNewsDetail(newsId) {
        const article = dummyNews.find((item) => item.id === newsId)

        if (!article) {
            await wait(undefined, 250)
            throw new ApiError(404, 'Data tidak ditemukan.')
        }

        return wait(article, 300)
    },

    async getSemesters() {
        return wait(dummySemesters, 200)
    },

    async getGradeEntries(_studentId, semesterId) {
        const isActive = !semesterId || dummySemesters.find((semester) => semester.id === semesterId)?.isActive
        return wait(isActive ? dummyGradeEntries : [], 250)
    },

    async getSubjects() {
        return wait(dummySubjects, 200)
    },

    async getClassroom() {
        return wait(dummyClassroom, 200)
    },

    async getClassmates() {
        return wait(dummyClassmates, 250)
    },

    async getSchedule(_studentId, weekStart) {
        const monday = weekStart ? parseIsoDate(weekStart) : startOfWeek(new Date())
        const days = [1, 2, 3, 4, 5].map((day) => {
            const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day - 1)

            return { date: toIsoDate(date), dayOfWeek: day, isSchoolDay: true, holidayName: null, lessons: dummyLessonsForDay(day) }
        })

        return wait({ weekStart: toIsoDate(monday), days }, 250)
    },

    async getAttendanceToday() {
        const today = new Date()
        const date = toIsoDate(today)
        const isSchoolDay = dayOfWeek(today) <= 5

        return wait({
            date,
            isSchoolDay,
            status: isSchoolDay ? 'hadir' : null,
            checkInAt: isSchoolDay ? `${date}T06:52:00+08:00` : null,
            checkOutAt: null,
            punctuality: isSchoolDay ? 'tepat_waktu' : null,
        }, 250)
    },

    async getAttendanceSummary() {
        return wait(dummyAttendanceSummary, 250)
    },

    async getAttendanceCalendar(_studentId, month) {
        const [year, monthNumber] = month.split('-').map(Number)
        const today = new Date()
        const daysInMonth = new Date(year, monthNumber, 0).getDate()
        const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthNumber - 1, index + 1))
            .map((date) => ({ date: toIsoDate(date), status: mockStatusFor(date, today) }))
            .filter((day): day is { date: string, status: AttendanceStatus } => day.status !== null)

        return wait({ month, days, holidays: [] }, 250)
    },

    async getAttendanceHistory(_studentId, params) {
        return wait(paginate(dummyAttendanceHistory, params), 250)
    },

    async getLeaveRequests(_studentId, params) {
        return wait(paginate(mockLeaveRequests, params), 250)
    },

    // Meniru aturan backend: 409 bila tanggal bertumpuk dengan pengajuan menunggu/disetujui.
    async createLeaveRequest({ type, startDate, endDate, reason, attachment }) {
        await wait(undefined, 700)

        const overlaps = mockLeaveRequests.some((request) => request.status !== 'ditolak' && request.startDate <= endDate && startDate <= request.endDate)
        if (overlaps) {
            throw new ApiError(409, 'Sudah ada pengajuan izin pada tanggal tersebut.')
        }

        const request: LeaveRequest = {
            id: `izin-${Date.now()}`,
            type,
            startDate,
            endDate,
            reason,
            attachment: attachment
                ? { name: attachment.name, mimeType: attachment.type, sizeBytes: attachment.size, pageCount: null, url: '', expiresAt: null }
                : null,
            status: 'menunggu',
            reviewedBy: null,
            reviewedAt: null,
            reviewNote: null,
            createdAt: new Date().toISOString(),
        }
        mockLeaveRequests = [request, ...mockLeaveRequests]

        return request
    },

    async cancelLeaveRequest(leaveRequestId) {
        await wait(undefined, 400)

        const request = mockLeaveRequests.find((item) => item.id === leaveRequestId)
        if (request && request.status !== 'menunggu') {
            throw new ApiError(409, 'Pengajuan yang sudah diproses tidak bisa dibatalkan.')
        }
        mockLeaveRequests = mockLeaveRequests.filter((item) => item.id !== leaveRequestId)
    },

    async getNotificationPreferences() {
        return wait({ pushNotifications: mockPushNotifications }, 200)
    },

    async updateNotificationPreferences({ pushNotifications }) {
        mockPushNotifications = pushNotifications
        return wait({ pushNotifications }, 300)
    },

    async getGuardians() {
        return wait(dummyGuardians, 250)
    },

    async getNotifications(params) {
        return wait({ ...paginate(mockNotifications, params), unreadCount: unreadNotificationCount() }, 250)
    },

    async markNotificationRead(notificationId) {
        mockNotifications = mockNotifications.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
        return wait(unreadNotificationCount(), 150)
    },

    async markAllNotificationsRead() {
        mockNotifications = mockNotifications.map((item) => ({ ...item, read: true }))
        return wait(0, 200)
    },

    async getReportSummaries(studentId) {
        return wait(mockReportSummariesByStudentId[studentId] ?? [], 250)
    },

    async getReportDetail(reportId) {
        return wait(mockReportDetailsByReportId[reportId], 250)
    },
}
