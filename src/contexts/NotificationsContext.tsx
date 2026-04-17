import { createContext, ReactNode, use, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { academicService } from '@/services'
import { NotificationItem } from '@/types/academic'

type NotificationsContextType = {
    notifications: NotificationItem[]
    unreadCount: number
    isLoading: boolean
    markAsRead: (notificationId: string) => void
}

const NotificationsContext = createContext<NotificationsContextType | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<NotificationItem[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let cancelled = false

        if (!user) {
            setNotifications([])
            return
        }

        setIsLoading(true)

        academicService.getNotifications(user.id).then((result) => {
            if (cancelled) {
                return
            }

            setNotifications(result)
            setIsLoading(false)
        })

        return () => {
            cancelled = true
        }
    }, [user])

    function markAsRead(notificationId: string) {
        setNotifications((current) => current.map((notification) => (
            notification.id === notificationId
                ? { ...notification, read: true }
                : notification
        )))
    }

    const unreadCount = notifications.filter((notification) => !notification.read).length

    return (
        <NotificationsContext value={{ notifications, unreadCount, isLoading, markAsRead }}>
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
