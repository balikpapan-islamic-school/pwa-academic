export type UpcomingPaymentItem = {
    id: string
    title: string
    description: string
    period: string
    dueDate: string
    amount: number
    bank: string
    virtualAccountNumber: string
    items: Array<{
        label: string
        amount: number
    }>
    instructions: string[]
}

export type PaymentHistoryItem = {
    id: string
    title: string
    period: string
    paidAt: string
    amount: number
    method: string
    receiptNumber: string
    status: 'Lunas'
}

export const upcomingPayments: UpcomingPaymentItem[] = [
    {
        id: 'inv-apr-2026-spp',
        title: 'SPP April 2026',
        description: 'Tagihan bulanan sekolah untuk biaya pendidikan rutin.',
        period: 'April 2026',
        dueDate: '25 Apr 2026',
        amount: 850000,
        bank: 'BSI Virtual Account',
        virtualAccountNumber: '90081020262024001',
        items: [
            { label: 'SPP Bulanan', amount: 750000 },
            { label: 'Biaya Platform Akademik', amount: 100000 },
        ],
        instructions: [
            'Buka mobile banking atau ATM sesuai bank yang dituju.',
            'Pilih menu transfer ke Virtual Account.',
            'Masukkan nomor virtual account sesuai tagihan.',
            'Pastikan nama siswa dan nominal tagihan sudah sesuai sebelum konfirmasi.',
        ],
    },
    {
        id: 'inv-apr-2026-kegiatan',
        title: 'Kegiatan Semester Genap',
        description: 'Pembayaran kegiatan pembinaan, outing class, dan penunjang semester genap.',
        period: 'Semester Genap 2025/2026',
        dueDate: '30 Apr 2026',
        amount: 325000,
        bank: 'BSI Virtual Account',
        virtualAccountNumber: '90081020262024002',
        items: [
            { label: 'Outing Class', amount: 200000 },
            { label: 'Modul Kegiatan', amount: 75000 },
            { label: 'Administrasi', amount: 50000 },
        ],
        instructions: [
            'Masuk ke menu pembayaran virtual account di aplikasi bank.',
            'Gunakan nomor virtual account yang tertera pada halaman ini.',
            'Simpan bukti pembayaran sampai status tagihan diperbarui.',
        ],
    },
]

export const paymentHistory: PaymentHistoryItem[] = [
    {
        id: 'hist-mar-2026-spp',
        title: 'SPP Maret 2026',
        period: 'Maret 2026',
        paidAt: '03 Mar 2026, 08:14',
        amount: 850000,
        method: 'BSI Virtual Account',
        receiptNumber: 'BIS/2026/03/00128',
        status: 'Lunas',
    },
    {
        id: 'hist-feb-2026-spp',
        title: 'SPP Februari 2026',
        period: 'Februari 2026',
        paidAt: '05 Feb 2026, 07:42',
        amount: 850000,
        method: 'BSI Virtual Account',
        receiptNumber: 'BIS/2026/02/00111',
        status: 'Lunas',
    },
    {
        id: 'hist-jan-2026-daftar-ulang',
        title: 'Daftar Ulang Semester Genap',
        period: 'Januari 2026',
        paidAt: '10 Jan 2026, 09:20',
        amount: 1250000,
        method: 'Transfer Bank',
        receiptNumber: 'BIS/2026/01/00087',
        status: 'Lunas',
    },
]

export function getUpcomingPaymentById(id?: string) {
    return upcomingPayments.find((item) => item.id === id)
}
