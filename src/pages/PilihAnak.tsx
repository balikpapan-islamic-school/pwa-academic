import { Navigate } from 'react-router-dom'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { StudentSwitcher } from '@/components/siswa/student-switcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useStudent } from '@/contexts/StudentContext'

export default function PilihAnak() {
    const { user } = useAuth()
    const { activeStudent, linkedStudents, setActiveStudentId } = useStudent()

    if (user?.role === 'siswa') {
        return <Navigate to="/profil" replace />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Pilih Anak</PageHeaderHeading>
                <PageHeaderDescription>Ganti konteks anak aktif untuk melihat dashboard, absensi, nilai, dan rapor yang berbeda.</PageHeaderDescription>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>Konteks Saat Ini</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {activeStudent ? `Saat ini kamu sedang melihat data ${activeStudent.name}.` : 'Belum ada siswa aktif yang dipilih.'}
                </CardContent>
            </Card>

            <StudentSwitcher students={linkedStudents} activeStudentId={activeStudent?.id} onSelect={setActiveStudentId} />
        </div>
    )
}
