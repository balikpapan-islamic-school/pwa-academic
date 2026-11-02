import { useLocation, useNavigate } from 'react-router-dom'

// Kembali ke halaman sebelumnya bila ada riwayat di aplikasi, jika tidak ke `fallback`.
export function useGoBack(fallback: string) {
    const navigate = useNavigate()
    const location = useLocation()

    return () => {
        if (location.key !== 'default') {
            navigate(-1)
        } else {
            navigate(fallback)
        }
    }
}
