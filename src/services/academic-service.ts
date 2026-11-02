import { ChildLinkRequest, ChildRelationship } from '@/lib/dummy-ui'
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
    StudentProfile,
    StudentSummary,
} from '@/types/academic'

export type UpdatePasswordInput = {
    // Wajib bila akun sudah punya kata sandi; dikosongkan saat akun Google membuat kata sandi pertama.
    currentPassword?: string
    password: string
    passwordConfirmation: string
}

export type CreateChildRequestInput = {
    nik: string
    // YYYY-MM-DD
    birthDate: string
    nisn: string | null
    relationship: ChildRelationship
}

export interface AcademicService {
    login(email: string, password: string): Promise<AuthUser>
    loginWithGoogle(idToken: string): Promise<AuthUser>
    getCurrentUser(): Promise<AuthUser>
    updateProfile(input: { name: string }): Promise<AuthUser>
    updatePassword(input: UpdatePasswordInput): Promise<void>
    logout(): Promise<void>
    getStudentProfile(studentId: string): Promise<StudentProfile>
    getLinkedStudents(userId: string): Promise<StudentSummary[]>
    getChildRequests(): Promise<ChildLinkRequest[]>
    createChildRequest(input: CreateChildRequestInput): Promise<ChildLinkRequest>
    getDashboard(studentId: string): Promise<DashboardData>
    getSchedule(studentId: string): Promise<ScheduleItem[]>
    getAttendance(studentId: string): Promise<AttendanceItem[]>
    getAttendanceSummary(studentId: string): Promise<AttendanceSummary>
    getGrades(studentId: string): Promise<GradeItem[]>
    getReportSummaries(studentId: string): Promise<ReportSummary[]>
    getReportDetail(reportId: string): Promise<ReportDetail>
    getNotifications(userId: string): Promise<NotificationItem[]>
}
