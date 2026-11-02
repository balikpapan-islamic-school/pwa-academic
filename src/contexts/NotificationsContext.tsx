import { createContext, ReactNode, use, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { academicService } from '@/services'
import { NotificationItem } from '@/types/academic'

type NotificationsContextType = {
    notifications: NotificationItem[]
    unreadCount: number
    isLoading: boolean
    hasError: boolean
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => Promise<void>
    refresh: () => void
}

const NotificationsContext = createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    // Dari `meta.unread_count`, karena daftar yang dimuat hanya halaman pertama.
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        setIsLoading(true)
        setHasError(false)

        academicService.getNotifications().then((result) => {
            if (cancelled) {
                return
            }

            setNotifications(result.items)
            setUnreadCount(result.unreadCount)
            setIsLoading(false)
        }).catch(() => {
            if (!cancelled) {
                setHasError(true)
                setIsLoading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [user, reloadKey])

    function markAsRead(notificationId: string) {
        const target = notifications.find((notification) => notification.id === notificationId)

        if (!target || target.read) {
            return
        }

        setNotifications((current) => current.map((notification) => (
            notification.id === notificationId
                ? { ...notification, read: true }
                : notification
        )))
        setUnreadCount((count) => Math.max(0, count - 1))

        // Penanda baca bersifat tambahan; bila gagal, status sebenarnya terlihat lagi saat daftar dimuat ulang.
        academicService.markNotificationRead(notificationId).then(setUnreadCount).catch(() => {})
    }

    async function markAllAsRead() {
        const count = await academicService.markAllNotificationsRead()

        setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
        setUnreadCount(count)
    }

    return (
        <NotificationsContext value={{ notifications, unreadCount, isLoading, hasError, markAsRead, markAllAsRead, refresh: () => setReloadKey((key) => key + 1) }}>
            {children}
        </NotificationsContext>
    )
}

export function useNotifications() {
    const context = use(NotificationsContext)

    if (!context) {
        throw new Error('useNotifications must be used within NotificationsProvider')
    }

    return context
}
