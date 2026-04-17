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

export interface AcademicService {
    login(identity: string, password: string): Promise<AuthUser>
    getCurrentUser(): Promise<AuthUser>
    logout(): Promise<void>
    getLinkedStudents(userId: string): Promise<StudentSummary[]>
    getDashboard(studentId: string): Promise<DashboardData>
    getSchedule(studentId: string): Promise<ScheduleItem[]>
    getAttendance(studentId: string): Promise<AttendanceItem[]>
    getAttendanceSummary(studentId: string): Promise<AttendanceSummary>
    getGrades(studentId: string): Promise<GradeItem[]>
    getReportSummaries(studentId: string): Promise<ReportSummary[]>
    getReportDetail(reportId: string): Promise<ReportDetail>
    getNotifications(userId: string): Promise<NotificationItem[]>
}
