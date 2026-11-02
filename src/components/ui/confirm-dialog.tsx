import { ReactNode } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    icon: LucideIcon
    title: string
    description: ReactNode
    confirmLabel: string
    cancelLabel?: string
    // `danger` untuk aksi yang menghapus/membatalkan sesuatu.
    tone?: 'primary' | 'danger'
    onConfirm: () => void
    children?: ReactNode
}

const toneStyles = {
    primary: { icon: 'bg-brand-soft text-primary', button: 'bg-primary text-white' },
    danger: { icon: 'bg-pastel-coral text-[#B3362F]', button: 'bg-[#C2413A] text-white' },
}

// Modal konfirmasi bergaya UI kit. Fokus awal di tombol batal agar aksi tidak terpicu tanpa sengaja.
export function ConfirmDialog({ open, onOpenChange, icon: Icon, title, description, confirmLabel, cancelLabel = 'Batal', tone = 'primary', onConfirm, children }: ConfirmDialogProps) {
    return (
        <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-[#0B1F12]/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-40px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[28px] bg-card px-5 pb-5 pt-6 text-center text-ink shadow-float outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                    <span aria-hidden="true" className={cn('flex size-14 items-center justify-center rounded-full', toneStyles[tone].icon)}>
                        <Icon className="size-7" strokeWidth={2.2} />
                    </span>
                    <AlertDialog.Title className="mt-3.5 font-display text-xl font-bold">{title}</AlertDialog.Title>
                    <AlertDialog.Description className="mt-1.5 text-sm leading-normal text-subtle">{description}</AlertDialog.Description>
                    {children}
                    <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
                        <AlertDialog.Cancel className="h-[52px] rounded-full border-2 border-border bg-card text-[15px] font-extrabold">
                            {cancelLabel}
                        </AlertDialog.Cancel>
                        <AlertDialog.Action onClick={onConfirm} className={cn('h-[52px] rounded-full text-[15px] font-extrabold', toneStyles[tone].button)}>
                            {confirmLabel}
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}
