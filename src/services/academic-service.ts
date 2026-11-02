import { ChildLinkRequest, ChildRelationship } from '@/lib/dummy-ui'
import {
    AttendanceCalendar,
    AttendanceRecord,
    AttendanceSummary,
    AttendanceToday,
    AuthUser,
    Classmate,
    Classroom,
    DashboardSummary,
    GradeEntry,
    Guardian,
    LeaveRequest,
    LeaveType,
    NewsArticle,
    NewsArticleDetail,
    NewsCategory,
    NotificationPage,
    NotificationPreferences,
    Paginated,
    ReportDetail,
    ReportSummary,
    Semester,
    StudentProfile,
    StudentSummary,
    Subject,
    WeekSchedule,
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

export type CreateLeaveRequestInput = {
    studentId: string
    type: LeaveType
    // YYYY-MM-DD
    startDate: string
    endDate: string
    reason: string
    attachment: File | null
}

export type PageParams = {
    page?: number
    perPage?: number
}

export type NewsParams = PageParams & {
    category?: NewsCategory
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
    getDashboard(studentId: string): Promise<DashboardSummary>
    getNews(params?: NewsParams): Promise<Paginated<NewsArticle>>
    getNewsDetail(newsId: string): Promise<NewsArticleDetail>
    getSemesters(studentId: string): Promise<Semester[]>
    getGradeEntries(studentId: string, semesterId?: string): Promise<GradeEntry[]>
    getSubjects(studentId: string, semesterId?: string): Promise<Subject[]>
    getClassroom(studentId: string, semesterId?: string): Promise<Classroom>
    getClassmates(studentId: string, semesterId?: string): Promise<Classmate[]>
    // `weekStart` = Senin (YYYY-MM-DD); kosong = minggu berjalan.
    getSchedule(studentId: string, weekStart?: string): Promise<WeekSchedule>
    getAttendanceToday(studentId: string): Promise<AttendanceToday>
    getAttendanceSummary(studentId: string, semesterId?: string): Promise<AttendanceSummary>
    // `month` = YYYY-MM
    getAttendanceCalendar(studentId: string, month: string): Promise<AttendanceCalendar>
    getAttendanceHistory(studentId: string, params?: PageParams): Promise<Paginated<AttendanceRecord>>
    getLeaveRequests(studentId: string, params?: PageParams): Promise<Paginated<LeaveRequest>>
    createLeaveRequest(input: CreateLeaveRequestInput): Promise<LeaveRequest>
    cancelLeaveRequest(leaveRequestId: string): Promise<void>
    getNotificationPreferences(): Promise<NotificationPreferences>
    updateNotificationPreferences(input: NotificationPreferences): Promise<NotificationPreferences>
    getGuardians(studentId: string): Promise<Guardian[]>
    getNotifications(params?: PageParams): Promise<NotificationPage>
    // Mengembalikan jumlah notifikasi belum dibaca setelah ditandai.
    markNotificationRead(notificationId: string): Promise<number>
    markAllNotificationsRead(): Promise<number>
    getReportSummaries(studentId: string): Promise<ReportSummary[]>
    getReportDetail(reportId: string): Promise<ReportDetail>
}
