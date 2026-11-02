import { DependencyList, useEffect, useState } from 'react'

type ApiDataState<T> =
    | { status: 'loading' }
    | { status: 'ready', data: T }
    | { status: 'error', error: unknown }

// Memuat data dari service dan mengabaikan hasil permintaan lama saat `deps` berubah.
// `load` bernilai null berarti belum ada yang perlu dimuat (mis. anak aktif belum tersedia).
export function useApiData<T>(load: (() => Promise<T>) | null, deps: DependencyList) {
    const [state, setState] = useState<ApiDataState<T>>({ status: 'loading' })
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        if (!load) {
            return
        }

        let cancelled = false
        setState({ status: 'loading' })

        load()
            .then((data) => {
                if (!cancelled) {
                    setState({ status: 'ready', data })
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({ status: 'error', error })
                }
            })

        return () => {
            cancelled = true
        }
        // `load` dibuat ulang tiap render; pemicunya cukup `deps` dari pemanggil.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reloadKey])

    return {
        status: state.status,
        data: state.status === 'ready' ? state.data : null,
        error: state.status === 'error' ? state.error : null,
        reload: () => setReloadKey((key) => key + 1),
        // Untuk pembaruan lokal setelah aksi tulis (mis. kartu dihapus setelah dibatalkan).
        setData: (update: (current: T) => T) => setState((current) => (current.status === 'ready' ? { status: 'ready', data: update(current.data) } : current)),
    }
}
