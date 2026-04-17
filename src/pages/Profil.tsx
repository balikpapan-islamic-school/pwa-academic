import { useEffect, useState } from 'react'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { StudentProfileCard } from '@/components/profil/student-profile-card'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
import { StudentProfile, StudentSummary } from '@/types/academic'

function mapSummaryToProfile(summary: StudentSummary): StudentProfile {
    return {
        ...summary,
        birthplace: undefined,
        birthDate: undefined,
        gender: undefined,
        religion: undefined,
        statusActive: undefined,
        addressLine: undefined,
    }
}

export default function Profil() {
    const { activeStudent } = useStudent()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        academicService.getStudentProfile()
            .then((result) => {
                if (!cancelled) {
                    setProfile(result)
                }
            })
            .catch(() => {
                if (!cancelled && activeStudent) {
                    setProfile(mapSummaryToProfile(activeStudent))
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [activeStudent])

    if (isLoading) {
        return <PageSkeleton />
    }

    const currentProfile = profile ?? (activeStudent ? mapSummaryToProfile(activeStudent) : null)

    if (!currentProfile) {
        return null
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Profil</PageHeaderHeading>
                <PageHeaderDescription>Informasi identitas akademik siswa aktif dalam satu tampilan yang ringkas.</PageHeaderDescription>
            </PageHeader>

            <StudentProfileCard student={currentProfile} />

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Konteks Akademik</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><span className="text-muted-foreground">Semester aktif:</span> {currentProfile.semesterLabel}</p>
                        <p><span className="text-muted-foreground">Unit sekolah:</span> {currentProfile.unit}</p>
                        <p><span className="text-muted-foreground">Kelas/rombel:</span> {currentProfile.className}</p>
                        <p><span className="text-muted-foreground">Tempat lahir:</span> {currentProfile.birthplace ?? '-'}</p>
                        <p><span className="text-muted-foreground">Tanggal lahir:</span> {currentProfile.birthDate ?? '-'}</p>
                        <p><span className="text-muted-foreground">Jenis kelamin:</span> {currentProfile.gender ?? '-'}</p>
                        <p><span className="text-muted-foreground">Agama:</span> {currentProfile.religion ?? '-'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Tambahan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p><span className="text-muted-foreground">Status aktif:</span> {typeof currentProfile.statusActive === 'boolean' ? (currentProfile.statusActive ? 'Aktif' : 'Nonaktif') : '-'}</p>
                        <p><span className="text-muted-foreground">Alamat:</span> {currentProfile.addressLine ?? '-'}</p>
                        <p className="text-muted-foreground">Data profil detail akan terus diperkaya seiring endpoint akademik lain tersedia.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
