import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Seberapa sering aplikasi yang terbuka lama (mis. tidak pernah ditutup di HP) memeriksa versi baru.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000
const UPDATE_TOAST_ID = 'pwa-update'

// Mendaftarkan service worker dan menampilkan toast saat versi baru aplikasi sudah terunduh.
// Versi baru baru dipakai setelah pengguna menekan "Perbarui", agar isian form yang sedang diketik tidak hilang.
export function PwaUpdatePrompt() {
    const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
        onRegisteredSW(_swUrl, registration) {
            if (!registration) {
                return
            }

            const checkForUpdate = () => {
                if (navigator.onLine && document.visibilityState === 'visible') {
                    registration.update().catch(() => {})
                }
            }

            window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL)
            // Saat aplikasi dibuka kembali dari latar belakang.
            document.addEventListener('visibilitychange', checkForUpdate)
        },
    })

    useEffect(() => {
        if (!needRefresh) {
            return
        }

        toast.info('Versi baru tersedia', {
            id: UPDATE_TOAST_ID,
            description: 'Perbarui untuk memakai fitur dan perbaikan terbaru.',
            duration: Infinity,
            action: {
                label: 'Perbarui',
                onClick: () => {
                    updateServiceWorker(true)
                },
            },
            // Toast bisa menutupi tombol form; "Nanti" menyembunyikannya sampai aplikasi dibuka lagi.
            cancel: {
                label: 'Nanti',
                onClick: () => {},
            },
        })
    }, [needRefresh, updateServiceWorker])

    return null
}
