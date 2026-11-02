// Status pemasangan PWA. `beforeinstallprompt` bisa terpicu sebelum halaman mana pun siap,
// jadi event ditangkap sejak modul ini dimuat (diimpor di main.tsx) lalu dibaca lewat usePwaInstall.

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type PwaInstallState = {
    // Chrome/Edge/Samsung Internet (Android & desktop): bisa memunculkan dialog pasang bawaan browser.
    canPrompt: boolean
    // iOS/iPadOS tidak punya dialog pasang; pengguna perlu "Bagikan → Tambah ke Layar Utama".
    isIos: boolean
    isInstalled: boolean
}

function detectStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function detectIos() {
    const { userAgent, maxTouchPoints } = navigator
    // iPadOS 13+ mengaku sebagai Mac; bedakan lewat layar sentuh.
    return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let state: PwaInstallState = { canPrompt: false, isIos: detectIos(), isInstalled: detectStandalone() }
const listeners = new Set<() => void>()

function setState(next: Partial<PwaInstallState>) {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
}

window.addEventListener('beforeinstallprompt', (event) => {
    // Tahan mini-infobar bawaan browser; aplikasi menampilkan ajakan pasangnya sendiri.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    setState({ canPrompt: true })
})

window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    setState({ canPrompt: false, isInstalled: true })
})

export function subscribePwaInstall(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function getPwaInstallState() {
    return state
}

// Memunculkan dialog pasang bawaan browser. Event hanya bisa dipakai sekali.
export async function promptPwaInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt) {
        return 'unavailable'
    }

    const event = deferredPrompt
    deferredPrompt = null
    setState({ canPrompt: false })

    await event.prompt()
    const { outcome } = await event.userChoice

    return outcome
}
