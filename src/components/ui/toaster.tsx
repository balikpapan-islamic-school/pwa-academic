import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

// Toast bergaya UI kit: pil gelap di atas navigasi bawah. Panggil dengan `toast.success()` / `toast.error()` / `toast.info()` dari 'sonner'.
export function Toaster() {
    return (
        <Sonner
            position="bottom-center"
            // Navigasi bawah setinggi ~90px; toast muncul tepat di atasnya.
            offset={{ bottom: 104 }}
            mobileOffset={{ bottom: 104, left: 20, right: 20 }}
            duration={3200}
            icons={{
                success: <CircleCheck className="size-5" strokeWidth={2.4} />,
                error: <CircleAlert className="size-5" strokeWidth={2.4} />,
                info: <Info className="size-5" strokeWidth={2.4} />,
            }}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: 'group flex w-full items-center gap-3 rounded-[20px] bg-ink py-3 pl-3 pr-4 font-sans text-white shadow-float',
                    icon: 'flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.14] [&>svg]:size-5 group-data-[type=success]:bg-primary group-data-[type=error]:bg-[#C2413A] group-data-[type=info]:bg-[#2F6FD6]',
                    content: 'flex min-w-0 flex-col gap-0.5',
                    title: 'text-sm font-extrabold leading-snug',
                    description: 'text-[13px] leading-snug text-[#C8D8CD]',
                },
            }}
        />
    )
}
