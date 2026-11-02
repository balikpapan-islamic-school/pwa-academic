import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationList } from '@/components/notifications/notification-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState, LoadErrorState } from '@/components/shared/empty-state'
import { LoadingRegion } from '@/components/shared/skeletons'
import { repeat } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useStudent } from '@/contexts/StudentContext'
import { NotificationItem } from '@/types/academic'

export default function Notifikasi() {
    const { notifications, unreadCount, isLoading, hasError, markAsRead, markAllAsRead, refresh } = useNotifications()
    const { activeStudent, linkedStudents, setActiveStudentId } = useStudent()
    const [isMarkingAll, setIsMarkingAll] = useState(false)

    // Notifikasi milik anak lain: ganti anak aktif dulu agar halaman tujuan menampilkan data yang benar.
    function openNotification(item: NotificationItem) {
        markAsRead(item.id)
        if (item.studentId && item.studentId !== activeStudent?.id && linkedStudents.some((student) => student.id === item.studentId)) {
            setActiveStudentId(item.studentId)
        }
    }

    async function handleMarkAll() {
        setIsMarkingAll(true)
        try {
            await markAllAsRead()
        } catch (caughtError) {
            toast.error(caughtError instanceof Error ? caughtError.message : 'Notifikasi gagal ditandai dibaca.')
        } finally {
            setIsMarkingAll(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Notifikasi</PageHeaderHeading>
                <PageHeaderDescription>Kabar nilai, absensi, izin, dan pengumuman sekolah.</PageHeaderDescription>
            </PageHeader>

            {isLoading ? (
                <LoadingRegion label="Memuat notifikasi" className="gap-3">
                    {repeat(4, (index) => (
                        <Card key={index}>
                            <CardContent className="flex flex-col gap-3 py-5">
                                <div className="flex items-start gap-3">
                                    <Skeleton className="size-8 shrink-0 rounded-xl" />
                                    <div className="flex flex-grow flex-col gap-2.5 pt-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-3/4" />
                                    </div>
                                </div>
                                <Skeleton className="h-2.5 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </LoadingRegion>
            ) : unreadCount > 0 ? (
                <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isMarkingAll}>
                    <CheckCheck className="size-4" />
                    Tandai semua dibaca
                </Button>
            ) : null}

            {isLoading ? null : hasError ? (
                <LoadErrorState title="Notifikasi belum dapat dimuat" onRetry={refresh} />
            ) : notifications.length > 0 ? (
                <NotificationList items={notifications} onOpen={openNotification} />
            ) : (
                <EmptyState icon={BellOff} tone="sky" title="Belum ada notifikasi" description="Kabar nilai, absensi, dan pengumuman sekolah akan muncul di sini." />
            )}
        </div>
    )
}
