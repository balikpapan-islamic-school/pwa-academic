import { buttonVariants } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function NotMatch() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <div className="space-y-4 text-center">
                <h2 className="text-7xl font-semibold">404</h2>
                <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
                <p className="text-sm text-muted-foreground">Route yang kamu buka belum tersedia di PWA akademik.</p>
                <Link to="/" className={buttonVariants()}>Kembali ke Beranda</Link>
            </div>
        </div>
    )
}
