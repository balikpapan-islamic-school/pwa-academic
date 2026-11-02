import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/protected-route'
import { features } from './config/app'
import { useAuth } from './contexts/AuthContext'
import Absensi from './pages/Absensi'
import AjukanIzin from './pages/AjukanIzin'
import Akademik from './pages/Akademik'
import Dashboard from './pages/Dashboard'
import EditProfil from './pages/EditProfil'
import HubungkanAnak from './pages/HubungkanAnak'
import KataSandi from './pages/KataSandi'
import Login from './pages/Login'
import NotMatch from './pages/NotMatch'
import Notifikasi from './pages/Notifikasi'
import Onboarding, { ONBOARDING_STORAGE_KEY } from './pages/Onboarding'
import Pembayaran from './pages/Pembayaran'
import PembayaranVirtualAccount from './pages/PembayaranVirtualAccount'
import PilihAnak from './pages/PilihAnak'
import Profil from './pages/Profil'
import Rapor from './pages/Rapor'
import RaporDetail from './pages/RaporDetail'

function hasSeenOnboarding() {
    try {
        return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1'
    } catch {
        return true
    }
}

function PublicRoute({ page }: { page: 'login' | 'onboarding' }) {
    const { user, isReady } = useAuth()
    const location = useLocation()

    if (!isReady) {
        return null
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    if (page === 'login' && !hasSeenOnboarding()) {
        return <Navigate to="/onboarding" replace state={location.state} />
    }

    return page === 'login' ? <Login /> : <Onboarding />
}

export default function Router() {
    return (
        <Routes>
            <Route path="/onboarding" element={<PublicRoute page="onboarding" />} />
            <Route path="/login" element={<PublicRoute page="login" />} />

            <Route element={<ProtectedRoute />}>
                {/* Alur fokus tanpa navigasi bawah. */}
                <Route path="/hubungkan-anak" element={<HubungkanAnak />} />
                <Route path="/absensi/izin" element={<AjukanIzin />} />
                <Route path="/profil/edit" element={<EditProfil />} />
                <Route path="/profil/kata-sandi" element={<KataSandi />} />
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/akademik" element={<Akademik />} />
                    <Route path="/jadwal" element={<Navigate to="/akademik?tab=kelas" replace />} />
                    <Route path="/absensi" element={<Absensi />} />
                    <Route path="/nilai" element={<Navigate to="/akademik" replace />} />
                    {features.payments ? (
                        <>
                            <Route path="/pembayaran" element={<Pembayaran />} />
                            <Route path="/pembayaran/:paymentId" element={<PembayaranVirtualAccount />} />
                        </>
                    ) : null}
                    <Route path="/rapor" element={<Rapor />} />
                    <Route path="/rapor/:reportId" element={<RaporDetail />} />
                    <Route path="/profil" element={<Profil />} />
                    <Route path="/pilih-anak" element={<PilihAnak />} />
                    <Route path="/notifikasi" element={<Notifikasi />} />
                </Route>
            </Route>

            <Route path="*" element={<NotMatch />} />
        </Routes>
    )
}
