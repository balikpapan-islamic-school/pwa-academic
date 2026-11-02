/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string
declare const __APP_BUILD_TIME__: string

interface ImportMetaEnv {
    readonly VITE_DATA_SOURCE?: 'mock' | 'api'
    readonly VITE_API_BASE_URL?: string
    readonly VITE_GOOGLE_CLIENT_ID?: string
}
