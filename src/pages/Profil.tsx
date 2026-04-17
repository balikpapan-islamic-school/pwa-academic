import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { StudentProfileCard } from '@/components/profil/student-profile-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'

export default function Profil() {
    const { activeStudent } = useStudent()

    if (!activeStudent) {
        return null
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Profil</PageHeaderHeading>
                <PageHeaderDescription>Informasi identitas akademik siswa aktif dalam satu tampilan yang ringkas.</PageHeaderDescription>
            </PageHeader>

            <StudentProfileCard student={activeStudent} />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Konteks Akademik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><span className="text-muted-foreground">Semester aktif:</span> {activeStudent.semesterLabel}</p>
                        <p><span className="text-muted-foreground">Unit sekolah:</span> {activeStudent.unit}</p>
                        <p><span className="text-muted-foreground">Kelas/rombel:</span> {activeStudent.className}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Catatan UI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>Halaman ini disiapkan sebagai profil akademik read-only.</p>
                        <p>Pada integrasi backend nanti, data tambahan seperti foto atau kontak wali kelas bisa ditambahkan tanpa mengubah struktur dasar halaman.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
