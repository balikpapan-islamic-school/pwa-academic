import { ReactNode } from 'react'
import { CompactTopBar } from './compact-top-bar'

type ScreenHeaderProps = {
    title: string
    action?: ReactNode
    // Versi aksi untuk bar hijau ringkas saat di-scroll; kosongkan jika tidak perlu.
    compactAction?: ReactNode
}

export function ScreenHeader({ title, action, compactAction }: ScreenHeaderProps) {
    return (
        <>
            <header className="flex items-center justify-between gap-3">
                <h1 className="font-display text-[26px] font-bold">{title}</h1>
                {action}
            </header>
            <CompactTopBar title={title} action={compactAction} />
        </>
    )
}
