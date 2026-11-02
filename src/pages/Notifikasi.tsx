import { useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationList } from '@/components/notifications/notification-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { Button } from '@/components/ui/button'
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

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Notifikasi</PageHeaderHeading>
                <PageHeaderDescription>Kabar nilai, absensi, izin, dan pengumuman sekolah.</PageHeaderDescription>
            </PageHeader>

            {unreadCount > 0 ? (
                <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isMarkingAll}>
                    <CheckCheck className="size-4" />
                    Tandai semua dibaca
                </Button>
            ) : null}

            {hasError ? (
                <div className="space-y-3">
                    <EmptyState title="Notifikasi belum dapat dimuat" description="Periksa koneksi internet, lalu coba lagi." icon={BellOff} />
                    <Button variant="outline" onClick={refresh}>Coba lagi</Button>
                </div>
            ) : notifications.length > 0 ? (
                <NotificationList items={notifications} onOpen={openNotification} />
            ) : (
                <EmptyState title="Belum ada notifikasi" description="Notifikasi akademik akan muncul di sini saat tersedia." icon={BellOff} />
            )}
        </div>
    )
}
