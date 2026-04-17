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
        }
    }

    return mockAcademicService
}

export const academicService = resolveAcademicService()
