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

// "07:30" atau "2026-11-02T06:52:00+08:00" -> "07.30".
export function formatClock(value: string) {
    const time = value.includes('T') ? value.slice(11, 16) : value.slice(0, 5)
    return time.replace(':', '.')
}

// Bagian tanggal dari ISO 8601 (zona waktu sekolah) -> Date lokal.
export function parseIsoDateTime(value: string) {
    return parseIsoDate(value.slice(0, 10))
}

// Senin dari minggu yang memuat `date`.
export function startOfWeek(date: Date) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    return monday
}

// "2026-10-30T14:10:00+08:00" -> "2 jam lalu" / "3 hari lalu" / "30 Okt 2026".
export function formatRelativeTime(value: string, now = new Date()) {
    const minutes = Math.floor((now.getTime() - new Date(value).getTime()) / 60_000)

    if (minutes < 1) {
        return 'Baru saja'
    }
    if (minutes < 60) {
        return `${minutes} menit lalu`
    }
    if (minutes < 60 * 24) {
        return `${Math.floor(minutes / 60)} jam lalu`
    }
    if (minutes < 60 * 24 * 7) {
        return `${Math.floor(minutes / (60 * 24))} hari lalu`
    }

    return formatDate(parseIsoDateTime(value))
}
