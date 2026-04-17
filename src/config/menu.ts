import {
    Bell,
    BookOpen,
    ClipboardCheck,
    Gauge,
    LucideIcon,
    NotebookText,
    UserRound,
} from 'lucide-react'

type MenuItemType = {
    title: string
    url: string
    icon?: LucideIcon
    items?: MenuItemType[]
}
type MenuType = MenuItemType[]

export const mainMenu: MenuType = [
    {
        title: 'Beranda',
        url: '/',
        icon: Gauge
    },
    {
        title: 'Jadwal',
        url: '/jadwal',
        icon: BookOpen,
    },
    {
        title: 'Absensi',
        url: '/absensi',
        icon: ClipboardCheck,
    },
    {
        title: 'Nilai',
        url: '/nilai',
        icon: NotebookText,
    },
    {
        title: 'Rapor',
        url: '/rapor',
        icon: Bell,
    },
]

export const secondaryMenu: MenuType = [
    {
        title: 'Notifikasi',
        url: '/notifikasi',
        icon: Bell,
    },
    {
        title: 'Profil',
        url: '/profil',
        icon: UserRound,
    },
]
