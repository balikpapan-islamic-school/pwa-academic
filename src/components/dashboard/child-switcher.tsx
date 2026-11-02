import { useState } from 'react'
import { Check, UserRoundPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ChildAvatar } from '@/components/dashboard/child-avatar'
import { cn } from '@/lib/utils'
import { StudentSummary } from '@/types/academic'

type ChildSwitcherProps = {
    items: StudentSummary[]
    activeId: string
    onSelect: (id: string) => void
    variant?: 'header' | 'compact'
}

// Aksi header Beranda: ganti anak aktif dan tambah anak lain.
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
                <SheetTitle className="font-display text-xl font-bold">{items.length > 1 ? 'Ganti Profil Anak' : 'Profil Anak'}</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-subtle">
                    {items.length > 1 ? 'Pilih anak yang datanya ingin ditampilkan.' : 'Punya anak lain di BIS? Hubungkan agar datanya tampil di sini.'}
                </SheetDescription>

                <div role="radiogroup" aria-label="Daftar anak" className="mt-4 flex flex-col gap-2">
                    {items.map((child, index) => {
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
                                <ChildAvatar student={child} index={index} className="size-12 border-[3px] border-white text-base" />
                                <span className="flex min-w-0 flex-grow flex-col">
                                    <span className="truncate text-[15px] font-extrabold">{child.name}</span>
                                    <span className="truncate text-[13px] text-subtle">{[child.className !== '-' ? `Kelas ${child.className}` : null, child.schoolName].filter(Boolean).join(' · ')}</span>
                                </span>
                                <span aria-hidden="true" className={cn('flex size-6 shrink-0 items-center justify-center rounded-full', isActive ? 'bg-primary text-white' : 'border-2 border-[#B5C2B8]')}>
                                    {isActive ? <Check className="size-4" strokeWidth={3} /> : null}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <Link to="/hubungkan-anak" className="mt-3 flex h-[50px] items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-extrabold text-white">
                    <UserRoundPlus className="size-[18px]" />
                    Tambah Anak
                </Link>
            </SheetContent>
        </Sheet>
    )
}
