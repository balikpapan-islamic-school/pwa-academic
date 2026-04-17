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
import {
    AttendanceItem,
    AttendanceSummary,
    AuthUser,
    DashboardData,
    GradeItem,
    NotificationItem,
    ReportDetail,
    ReportSummary,
    ScheduleItem,
    StudentSummary,
} from '@/types/academic'

function wait<T>(data: T, timeout = 300): Promise<T> {
    return new Promise((resolve) => {
        window.setTimeout(() => resolve(data), timeout)
    })
}

export async function loginWithMock(identity: string, _password: string): Promise<AuthUser> {
    const normalized = identity.trim().toLowerCase()
    const user = normalized.includes('siswa') || normalized.includes('ahmad')
        ? mockUsers.siswa
        : mockUsers.wali_siswa

    return wait(user, 450)
}

export async function getLinkedStudents(userId: string): Promise<StudentSummary[]> {
    return wait(mockLinkedStudentsByUserId[userId] ?? [], 250)
}

export async function getDashboard(studentId: string): Promise<DashboardData> {
    return wait(mockDashboardByStudentId[studentId], 350)
}

export async function getSchedule(studentId: string): Promise<ScheduleItem[]> {
    return wait(mockScheduleByStudentId[studentId] ?? [], 250)
}

export async function getAttendance(studentId: string): Promise<AttendanceItem[]> {
    return wait(mockAttendanceByStudentId[studentId] ?? [], 250)
}

export async function getAttendanceSummary(studentId: string): Promise<AttendanceSummary> {
    return wait(mockAttendanceSummaryByStudentId[studentId] ?? { hadir: 0, sakit: 0, izin: 0, alfa: 0 }, 250)
}

export async function getGrades(studentId: string): Promise<GradeItem[]> {
    return wait(mockGradesByStudentId[studentId] ?? [], 250)
}

export async function getReportSummaries(studentId: string): Promise<ReportSummary[]> {
    return wait(mockReportSummariesByStudentId[studentId] ?? [], 250)
}

export async function getReportDetail(reportId: string): Promise<ReportDetail> {
    return wait(mockReportDetailsByReportId[reportId], 250)
}

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
    return wait(mockNotificationsByUserId[userId] ?? [], 250)
}
