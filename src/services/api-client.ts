type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    headers?: HeadersInit
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
const ACCESS_TOKEN_KEY = 'pwa-academic-access-token'

export function getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
    const accessToken = getAccessToken()

    const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
    }

    return response.json() as Promise<T>
}

export function getApiBaseUrl() {
    return API_BASE_URL
}
