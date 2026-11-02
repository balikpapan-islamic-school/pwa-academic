type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: HeadersInit
}

type ApiErrorResponse = {
    message?: string
    errors?: Record<string, string[]>
}

export class ApiError extends Error {
    status: number
    errors?: Record<string, string[]>

    constructor(status: number, message: string, errors?: Record<string, string[]>) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.errors = errors
    }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const ACCESS_TOKEN_KEY = 'pwa-academic-access-token'
const NOT_GUARDIAN_MESSAGE = 'Akun bukan wali siswa.'

export function getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// Dipanggil saat token habis/dicabut (401) atau akun bukan wali siswa (403), agar sesi diakhiri dari satu tempat.
let unauthorizedHandler: ((error: ApiError) => void) | null = null

export function setUnauthorizedHandler(handler: ((error: ApiError) => void) | null) {
    unauthorizedHandler = handler
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
    const accessToken = getAccessToken()

    // FormData (multipart, mis. lampiran izin) dikirim apa adanya agar browser mengisi boundary sendiri.
    const isFormData = options.body instanceof FormData

    const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            Accept: 'application/json',
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
        body: isFormData ? options.body as FormData : options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
        let errorPayload: ApiErrorResponse | null = null

        try {
            errorPayload = await response.json() as ApiErrorResponse
        } catch {
            errorPayload = null
        }

        const error = new ApiError(
            response.status,
            errorPayload?.message ?? `API request failed with status ${response.status}`,
            errorPayload?.errors
        )

        // Hanya untuk request yang membawa token: 401 dari /auth/google berarti token Google tidak valid, bukan sesi habis.
        const isNotGuardianAccount = response.status === 403 && error.message === NOT_GUARDIAN_MESSAGE

        if (accessToken && (response.status === 401 || isNotGuardianAccount)) {
            unauthorizedHandler?.(error)
        }

        throw error
    }

    return response.json() as Promise<T>
}

// `{ student_id: 'x', page: 2, category: undefined }` -> `?student_id=x&page=2`; nilai kosong diabaikan.
export function buildQuery(params: Record<string, string | number | null | undefined>) {
    const search = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value))
        }
    }

    const query = search.toString()
    return query ? `?${query}` : ''
}

export function getApiBaseUrl() {
    return API_BASE_URL
}
