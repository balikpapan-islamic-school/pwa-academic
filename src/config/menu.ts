import {
    BookOpen,
    CalendarCheck,
    House,
    LucideIcon,
    UserRound,
    Wallet,
} from 'lucide-react'
import { features } from '@/config/app'

type MenuItemType = {
    title: string
    url: string
    icon?: LucideIcon
    // Menu yang butuh data peserta didik dinonaktifkan saat belum ada yang terhubung.
    requiresStudent?: boolean
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

export const mainMenu: MenuType = [
    {
        title: 'Beranda',
        url: '/',
        icon: House,
    },
    {
        title: 'Akademik',
        url: '/akademik',
        icon: BookOpen,
        requiresStudent: true,
    },
    {
        title: 'Absensi',
        url: '/absensi',
        icon: CalendarCheck,
        requiresStudent: true,
    },
    ...(features.payments ? [{
        title: 'Bayar',
        url: '/pembayaran',
        icon: Wallet,
        requiresStudent: true,
    }] : []),
    {
        title: 'Profil',
        url: '/profil',
        icon: UserRound,
    },
]
