import { useState } from 'react'
import { Check, UserRoundPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DummyChild } from '@/lib/dummy-ui'
import { cn } from '@/lib/utils'

type ChildSwitcherProps = {
    items: DummyChild[]
    activeId: string
    onSelect: (id: string) => void
    variant?: 'header' | 'compact'
}

// Pengganti tombol notifikasi di Beranda saat wali punya lebih dari satu anak.
export function ChildSwitcher({ items, activeId, onSelect, variant = 'header' }: ChildSwitcherProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                aria-label="Ganti profil anak"
                className={cn(
                    'flex shrink-0 items-center justify-center rounded-full',
                    variant === 'header' ? 'size-12 bg-card shadow-chip' : 'size-10 bg-white/[0.18]'
                )}>
                <UsersRound className={variant === 'header' ? 'size-[22px]' : 'size-5'} />
            </SheetTrigger>
            <SheetContent side="bottom" className="mx-auto max-w-md gap-0 rounded-t-[28px] border-0 bg-background px-5 pb-8 pt-3 [&>button:last-child]:hidden">
                <span aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#C3CEC5]" />
                <SheetTitle className="font-display text-xl font-bold">Ganti Profil Anak</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-subtle">Pilih anak yang datanya ingin ditampilkan.</SheetDescription>

                <div role="radiogroup" aria-label="Daftar anak" className="mt-4 flex flex-col gap-2">
                    {items.map((child) => {
                        const isActive = child.id === activeId

                        return (
                            <button
                                key={child.id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => {
                                    onSelect(child.id)
                                    setOpen(false)
                                }}
                                className={cn('flex items-center gap-3 rounded-[20px] border-2 bg-card p-3 text-left transition-colors', isActive ? 'border-primary' : 'border-card')}>
                                <span aria-hidden="true" className={cn('flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-white font-display text-base font-bold', child.avatarClassName)}>
                                    {child.initials}
                                </span>
                                <span className="flex min-w-0 flex-grow flex-col">
                                    <span className="truncate text-[15px] font-extrabold">{child.name}</span>
                                    <span className="truncate text-[13px] text-subtle">Kelas {child.className} · {child.school}</span>
                                </span>
                                <span aria-hidden="true" className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', isActive ? 'bg-primary text-white' : 'border-2 border-[#B5C2B8]')}>
                                    {isActive ? <Check className="size-4" strokeWidth={3} /> : null}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <Link to="/hubungkan-anak" className="mt-3 flex h-[50px] items-center justify-center gap-2 rounded-full border-2 border-border bg-card text-[15px] font-extrabold">
                    <UserRoundPlus className="size-[18px]" />
                    Hubungkan Anak Lain
                </Link>
            </SheetContent>
        </Sheet>
    )
}
