import { useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// Akun wali tanpa peserta didik terhubung (mis. akun Google baru) hanya boleh membuka Beranda & Profil.
export function useHasLinkedStudent() {
    const { user } = useAuth()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    // Pratinjau tampilan akun tanpa peserta didik: buka "/?state=kosong".
    const isEmptyPreview = location.pathname === '/' && searchParams.get('state') === 'kosong'

    return Boolean(user && user.linkedStudentsCount > 0) && !isEmptyPreview
}
