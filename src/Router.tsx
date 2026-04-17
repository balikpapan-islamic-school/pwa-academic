import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ProtectedRoute } from './components/protected-route'
import Absensi from './pages/Absensi'
import Dashboard from './pages/Dashboard'
import Jadwal from './pages/Jadwal'
import Login from './pages/Login'
import Nilai from './pages/Nilai'
import NotMatch from './pages/NotMatch'
import Notifikasi from './pages/Notifikasi'
import PilihAnak from './pages/PilihAnak'
import Profil from './pages/Profil'
import Rapor from './pages/Rapor'

export default function Router() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jadwal" element={<Jadwal />} />
                    <Route path="/absensi" element={<Absensi />} />
                    <Route path="/nilai" element={<Nilai />} />
                    <Route path="/rapor" element={<Rapor />} />
                    <Route path="/profil" element={<Profil />} />
                    <Route path="/pilih-anak" element={<PilihAnak />} />
                    <Route path="/notifikasi" element={<Notifikasi />} />
                </Route>
            </Route>

            <Route path="*" element={<NotMatch />} />
        </Routes>
    )
}
