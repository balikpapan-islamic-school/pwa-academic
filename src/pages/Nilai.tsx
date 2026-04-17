import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { GradeList } from '@/components/nilai/grade-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { useStudent } from '@/contexts/StudentContext'
import { academicService } from '@/services'
import { GradeItem } from '@/types/academic'

export default function Nilai() {
    const { activeStudent } = useStudent()
    const [items, setItems] = useState<GradeItem[]>([])
    const [semester, setSemester] = useState('Semester Aktif')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        if (!activeStudent) {
            setItems([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        academicService.getGrades(activeStudent.id).then((result) => {
            if (!cancelled) {
                setItems(result)
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

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Nilai</PageHeaderHeading>
                <PageHeaderDescription>Perkembangan hasil belajar siswa berdasarkan mata pelajaran dan komponen penilaian.</PageHeaderDescription>
            </PageHeader>

            <SectionHeading
                title="Semester"
                description="UI ini sudah disiapkan untuk pemilihan semester saat data backend final tersedia."
                action={
                    <div className="flex gap-2">
                        {['Semester Aktif', 'Semester Sebelumnya'].map((item) => (
                            <Button key={item} variant={semester === item ? 'default' : 'outline'} onClick={() => setSemester(item)}>
                                {item}
                            </Button>
                        ))}
                    </div>
                }
            />

            {items.length > 0 ? (
                <GradeList items={items} />
            ) : (
                <EmptyState title="Belum ada nilai" description="Nilai akan muncul setelah guru menyelesaikan input di sistem utama." icon={GraduationCap} />
            )}
        </div>
    )
}
