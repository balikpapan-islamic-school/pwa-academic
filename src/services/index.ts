import { AcademicService } from '@/services/academic-service'
import { getApiBaseUrl } from '@/services/api-client'
import { httpAcademicService } from '@/services/http-academic-service'
import { mockAcademicService } from '@/services/mock-academic-service'

function resolveAcademicService(): AcademicService {
    const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

    if (source === 'api' && getApiBaseUrl()) {
        return {
            ...mockAcademicService,
            login: httpAcademicService.login,
            loginWithGoogle: httpAcademicService.loginWithGoogle,
            getCurrentUser: httpAcademicService.getCurrentUser,
            updateProfile: httpAcademicService.updateProfile,
            updatePassword: httpAcademicService.updatePassword,
            logout: httpAcademicService.logout,
            getStudentProfile: httpAcademicService.getStudentProfile,
            getLinkedStudents: httpAcademicService.getLinkedStudents,
            getChildRequests: httpAcademicService.getChildRequests,
            createChildRequest: httpAcademicService.createChildRequest,
            getDashboard: httpAcademicService.getDashboard,
            getSchedule: httpAcademicService.getSchedule,
            getAttendance: httpAcademicService.getAttendance,
            getAttendanceSummary: httpAcademicService.getAttendanceSummary,
            getGrades: httpAcademicService.getGrades,
            getReportSummaries: httpAcademicService.getReportSummaries,
            getReportDetail: httpAcademicService.getReportDetail,
        }
    }

    return mockAcademicService
}

export const academicService = resolveAcademicService()
