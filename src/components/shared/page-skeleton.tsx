import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
            </div>
            <Skeleton className="h-52 rounded-2xl" />
        </div>
    )
}
