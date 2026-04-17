import { BellOff } from 'lucide-react'
import { NotificationList } from '@/components/notifications/notification-list'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { useNotifications } from '@/contexts/NotificationsContext'

export default function Notifikasi() {
    const { notifications, isLoading, markAsRead } = useNotifications()

    if (isLoading) {
        return <PageSkeleton />
    }

    return (
        <div className="space-y-6">
            <PageHeader>
                <PageHeaderHeading>Notifikasi</PageHeaderHeading>
                <PageHeaderDescription>Pembaruan akademik penting untuk siswa aktif atau anak yang dipilih wali siswa.</PageHeaderDescription>
            </PageHeader>

            {notifications.length > 0 ? (
                <NotificationList items={notifications} onRead={markAsRead} />
            ) : (
                <EmptyState title="Belum ada notifikasi" description="Notifikasi akademik akan muncul di sini saat tersedia." icon={BellOff} />
            )}
        </div>
    )
}
