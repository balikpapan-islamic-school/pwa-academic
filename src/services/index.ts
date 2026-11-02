import { AcademicService } from '@/services/academic-service'
import { getApiBaseUrl } from '@/services/api-client'
import { httpAcademicService } from '@/services/http-academic-service'
import { mockAcademicService } from '@/services/mock-academic-service'

function resolveAcademicService(): AcademicService {
    const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

    // Semua endpoint di docs/API_SPEC_PWA.md sudah tersambung; Rapor lama tetap memakai data contoh di dalam httpAcademicService.
    if (source === 'api' && getApiBaseUrl()) {
        return httpAcademicService
    }

    return mockAcademicService
}

export const academicService = resolveAcademicService()
