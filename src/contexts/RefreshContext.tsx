import { createContext, ReactNode, use, useCallback, useMemo, useRef, useState } from 'react'

type RefreshContextType = {
    // Naik setiap kali pengguna menarik layar untuk memuat ulang; pemuat data memakainya sebagai dependency.
    refreshKey: number
    // Mendaftarkan permintaan yang sedang berjalan agar indikator menunggu sampai semuanya selesai.
    track: (request: Promise<unknown>) => void
    refresh: () => Promise<void>
}

const RefreshContext = createContext<RefreshContextType | null>(null)

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function RefreshProvider({ children }: { children: ReactNode }) {
    const [refreshKey, setRefreshKey] = useState(0)
    const pending = useRef(new Set<Promise<unknown>>())

    const track = useCallback((request: Promise<unknown>) => {
        const settled = request.catch(() => {})
        pending.current.add(settled)
        settled.finally(() => pending.current.delete(settled))
    }, [])

    const refresh = useCallback(async () => {
        setRefreshKey((key) => key + 1)
        // Beri waktu effect berjalan dan mendaftarkan permintaannya dulu.
        await wait(120)
        // Durasi minimum agar putaran indikator tidak sekadar berkedip.
        await Promise.all([Promise.allSettled([...pending.current]), wait(500)])
    }, [])

    const value = useMemo(() => ({ refreshKey, track, refresh }), [refreshKey, track, refresh])

    return <RefreshContext value={value}>{children}</RefreshContext>
}

export function useRefresh() {
    const context = use(RefreshContext)

    if (!context) {
        throw new Error('useRefresh must be used within RefreshProvider')
    }

    return context
}

// Untuk pemuat data: tambahkan `refreshKey` ke deps effect, lalu panggil `consumeRefresh()` di awal effect.
// Bernilai true bila effect berjalan karena tarik-untuk-muat-ulang, sehingga data lama tetap tampil (tanpa skeleton).
export function useRefreshSignal() {
    const { refreshKey, track } = useRefresh()
    const seenKey = useRef(refreshKey)

    function consumeRefresh() {
        const isRefresh = seenKey.current !== refreshKey
        seenKey.current = refreshKey
        return isRefresh
    }

    return { refreshKey, track, consumeRefresh }
}
