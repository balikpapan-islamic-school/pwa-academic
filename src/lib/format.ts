export const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export function formatLongDate(date: Date) {
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

export function formatCurrency(value: number) {
    return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)}`
}

// "2026-10-30" -> Date lokal (tanpa geser zona waktu).
export function parseIsoDate(value: string) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function formatDate(date: Date) {
    return `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`
}

// Date lokal -> "2026-10-30".
export function toIsoDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// "2026-11-03", "2026-11-04" -> "3 Nov 2026 – 4 Nov 2026"; satu hari cukup satu tanggal.
export function formatDateRange(start: string, end: string) {
    const startText = formatDate(parseIsoDate(start))
    return start === end ? startText : `${startText} – ${formatDate(parseIsoDate(end))}`
}

export function formatFileSize(bytes: number) {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
