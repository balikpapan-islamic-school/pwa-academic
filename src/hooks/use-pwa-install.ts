import { useSyncExternalStore } from 'react'
import { getPwaInstallState, promptPwaInstall, subscribePwaInstall } from '@/lib/pwa-install'

export function usePwaInstall() {
    const state = useSyncExternalStore(subscribePwaInstall, getPwaInstallState)

    return {
        ...state,
        // Ada cara memasang di perangkat ini dan aplikasi belum terpasang.
        isAvailable: !state.isInstalled && (state.canPrompt || state.isIos),
        promptInstall: promptPwaInstall,
    }
}
