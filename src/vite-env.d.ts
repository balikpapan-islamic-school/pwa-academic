/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DATA_SOURCE?: 'mock' | 'api'
    readonly VITE_API_BASE_URL?: string
    readonly VITE_GOOGLE_CLIENT_ID?: string
}
