import { Link } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationItem } from '@/types/academic'
import { cn } from '@/lib/utils'

type NotificationListProps = {
    items: NotificationItem[]
    onRead: (notificationId: string) => void
}

export function NotificationList({ items, onRead }: NotificationListProps) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Card key={item.id} className={cn(!item.read && 'border-primary/40 bg-primary/5')}>
                    <CardContent className="py-5">
                        <Link to={item.href} className="block space-y-3" onClick={() => onRead(item.id)}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-muted p-2">
                                        <BellRing className="size-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                                    </div>
                                </div>
                                {!item.read ? <span className="mt-1 size-2.5 rounded-full bg-primary" /> : null}
                            </div>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
