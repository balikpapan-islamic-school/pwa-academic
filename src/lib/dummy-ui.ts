// Data tampilan sementara, disalin dari desain .temp/ui.html.
// Halaman Beranda s.d. Profil sengaja belum memakai API; ganti modul ini saat integrasi.

export const dummyStudent = {
    name: 'Naura Aulia Putri',
    nickname: 'Naura',
    initials: 'NA',
    nik: '6471015405100003',
    nis: '2024017',
    nisn: '0101234567',
    birthDate: '2010-05-14',
    unit: 'SMA Islam Balikpapan',
    className: 'XI IPA 2',
    semester: 'Ganjil',
    schoolYear: '2026/2027',
    room: 'Ruang 204 · Gedung B, Lantai 2',
    homeroomTeacher: 'Ibu Sari Wulandari',
    homeroomTeacherShort: 'Ibu Sari W.',
    classSize: 32,
    attendanceRate: 96,
}

export type DummyChild = {
    id: string
    name: string
    nickname: string
    initials: string
    className: string
    semester: string
    school: string
    avatarClassName: string
}

// Anak yang terhubung ke akun wali. Lebih dari satu → Beranda menampilkan tombol ganti anak.
export const dummyChildren: DummyChild[] = [
    { id: 'naura', name: 'Naura Aulia Putri', nickname: 'Naura', initials: 'NA', className: 'XI IPA 2', semester: 'Ganjil', school: 'SMA Islam Balikpapan', avatarClassName: 'bg-pastel-coral text-pastel-coral-fg' },
    { id: 'fathan', name: 'Muhammad Fathan', nickname: 'Fathan', initials: 'MF', className: '4A', semester: 'Ganjil', school: 'SD Islam Balikpapan', avatarClassName: 'bg-pastel-sky text-pastel-sky-fg' },
]

export type ChildRelationship = 'AYAH' | 'IBU' | 'WALI'
export type ChildRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Pengajuan hubungkan anak (POST/GET /children/requests). Data siswa baru terlihat setelah disetujui admin.
export type ChildLinkRequest = {
    id: string
    nik: string
    birthDate: string
    nisn: string | null
    relationship: string
    status: ChildRequestStatus
    statusLabel: string
    note: string | null
    submittedAt: string
    processedAt: string | null
    student: { id: string, name: string } | null
}

export const childRelationshipLabels: Record<ChildRelationship, string> = { AYAH: 'Ayah', IBU: 'Ibu', WALI: 'Wali' }

export const childRequestStatusLabels: Record<ChildRequestStatus, string> = {
    PENDING: 'Menunggu Verifikasi',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
}

export const dummyChildRequests: ChildLinkRequest[] = [
    { id: 'req-3', nik: '6471000000000001', birthDate: '2018-05-10', nisn: '0011223344', relationship: 'Ibu', status: 'PENDING', statusLabel: 'Menunggu Verifikasi', note: null, submittedAt: '2026-11-01T09:12:00+08:00', processedAt: null, student: null },
    { id: 'req-2', nik: '6471000000000002', birthDate: '2016-08-21', nisn: null, relationship: 'Ibu', status: 'REJECTED', statusLabel: 'Ditolak', note: 'Tanggal lahir tidak sesuai data sekolah. Periksa kembali akta kelahiran.', submittedAt: '2026-10-28T19:40:00+08:00', processedAt: '2026-10-29T10:05:00+08:00', student: null },
    { id: 'req-1', nik: '6471015405100003', birthDate: '2010-05-14', nisn: '0101234567', relationship: 'Ibu', status: 'APPROVED', statusLabel: 'Disetujui', note: null, submittedAt: '2026-07-14T08:00:00+08:00', processedAt: '2026-07-15T09:30:00+08:00', student: { id: 'naura', name: 'Naura Aulia Putri' } },
]

export const dummyPersonalInfo = [
    { label: 'Tempat, tgl lahir', value: 'Jakarta, 14 Mei 2010' },
    { label: 'Jenis kelamin', value: 'Perempuan' },
    { label: 'Email', value: 'naura.aulia@bis.sch.id' },
    { label: 'No. HP', value: '0812-xxxx-2210' },
    { label: 'Wali kelas', value: 'Ibu Sari Wulandari' },
]

export const dummyCurrentLesson = {
    subject: 'Matematika Wajib',
    symbol: '∑',
    time: '07.30 – 09.00',
    room: 'Ruang 204',
    progress: 60,
}

export const dummyTodayLessonCount = 6

export const dummyNextLessons = [
    { time: '09.15', subject: 'Bahasa Indonesia', room: 'R. 204' },
    { time: '10.45', subject: 'Fisika', room: 'Lab IPA' },
    { time: '12.45', subject: 'Bahasa Inggris', room: 'R. 204' },
]

export const PASSING_SCORE = 75

type GradeEntryBase = {
    id: string
    subject: string
    assessment: string
    publishedAt: string
    publisher: string
}

// Sekolah menerbitkan dua jenis nilai: angka + keterangan, atau file (PDF) dari guru.
export type ScoreGradeEntry = GradeEntryBase & {
    kind: 'score'
    score: number
    note: string
}

export type FileGradeEntry = GradeEntryBase & {
    kind: 'file'
    fileName: string
    fileSize: string
    fileUrl: string
    note?: string
}

export type GradeEntry = ScoreGradeEntry | FileGradeEntry

// Label "Baru" tidak disimpan di mana pun: cukup nilai yang terbit dalam beberapa hari terakhir.
export const NEW_GRADE_DAYS = 7

export function isNewGrade(entry: GradeEntry, today = new Date()) {
    const published = new Date(`${entry.publishedAt}T00:00:00`)
    const ageInDays = (today.getTime() - published.getTime()) / 86_400_000
    return ageInDays >= 0 && ageInDays < NEW_GRADE_DAYS
}

const dummyFile = (name: string) => `${import.meta.env.BASE_URL}dummy-nilai/${name}`

export const dummyGradeEntries: GradeEntry[] = [
    { id: 'g-01', kind: 'score', subject: 'Matematika Wajib', assessment: 'Tugas 1 · Fungsi Komposisi', score: 90, note: 'Langkah pengerjaan runtut dan rapi.', publishedAt: '2026-08-21', publisher: 'Pak Dimas R.' },
    { id: 'g-02', kind: 'score', subject: 'Matematika Wajib', assessment: 'Ulangan Harian 1', score: 88, note: 'Sudah menguasai konsep, perlu latihan soal cerita.', publishedAt: '2026-09-04', publisher: 'Pak Dimas R.' },
    { id: 'g-03', kind: 'score', subject: 'Matematika Wajib', assessment: 'UTS', score: 94, note: 'Sangat baik. Pertahankan ketelitian.', publishedAt: '2026-10-09', publisher: 'Pak Dimas R.' },
    { id: 'g-04', kind: 'score', subject: 'Matematika Wajib', assessment: 'Ulangan Harian 2', score: 96, note: 'Nilai tertinggi di kelas untuk materi limit.', publishedAt: '2026-10-30', publisher: 'Pak Dimas R.' },
    { id: 'g-05', kind: 'score', subject: 'Fisika', assessment: 'Praktikum Gerak Lurus', score: 87, note: 'Data pengamatan lengkap, grafik perlu diberi satuan.', publishedAt: '2026-08-28', publisher: 'Ibu Ratna S.' },
    { id: 'g-06', kind: 'score', subject: 'Fisika', assessment: 'Ulangan Harian 1', score: 89, note: 'Pemahaman konsep vektor sudah baik.', publishedAt: '2026-09-11', publisher: 'Ibu Ratna S.' },
    { id: 'g-07', kind: 'score', subject: 'Fisika', assessment: 'UTS', score: 90, note: 'Baik sekali, analisis soal hitungan tepat.', publishedAt: '2026-10-09', publisher: 'Ibu Ratna S.' },
    { id: 'g-08', kind: 'score', subject: 'Kimia', assessment: 'Ulangan Harian 1', score: 72, note: 'Belum mencapai KKM, wajib mengikuti remedial.', publishedAt: '2026-09-02', publisher: 'Pak Hendra P.' },
    { id: 'g-09', kind: 'score', subject: 'Kimia', assessment: 'Remedial UH 1', score: 80, note: 'Tuntas setelah remedial. Ada peningkatan pemahaman stoikiometri.', publishedAt: '2026-09-16', publisher: 'Pak Hendra P.' },
    { id: 'g-10', kind: 'score', subject: 'Kimia', assessment: 'UTS', score: 86, note: 'Peningkatan yang baik dibanding ulangan harian.', publishedAt: '2026-10-10', publisher: 'Pak Hendra P.' },
    { id: 'g-11', kind: 'file', subject: 'Kimia', assessment: 'Praktikum Laju Reaksi', fileName: 'Lembar Penilaian Praktikum.pdf', fileSize: '2 halaman', fileUrl: dummyFile('praktikum-laju-reaksi.pdf'), note: 'Penilaian berupa rubrik praktikum.', publishedAt: '2026-10-31', publisher: 'Pak Hendra P.' },
    { id: 'g-12', kind: 'score', subject: 'Biologi', assessment: 'Tugas 1 · Sel', score: 92, note: 'Gambar struktur sel lengkap dan berlabel.', publishedAt: '2026-08-25', publisher: 'Ibu Lestari A.' },
    { id: 'g-13', kind: 'score', subject: 'Biologi', assessment: 'UTS', score: 88, note: 'Baik. Perdalam materi jaringan tumbuhan.', publishedAt: '2026-10-08', publisher: 'Ibu Lestari A.' },
    { id: 'g-14', kind: 'score', subject: 'Bahasa Indonesia', assessment: 'Tugas Teks Eksposisi', score: 88, note: 'Argumen kuat, perhatikan ejaan.', publishedAt: '2026-09-07', publisher: 'Ibu Sari W.' },
    { id: 'g-15', kind: 'score', subject: 'Bahasa Indonesia', assessment: 'UTS', score: 86, note: 'Pemahaman bacaan baik.', publishedAt: '2026-10-08', publisher: 'Ibu Sari W.' },
    { id: 'g-16', kind: 'file', subject: 'Bahasa Indonesia', assessment: 'Presentasi Kelompok', fileName: 'Lembar Observasi Presentasi.pdf', fileSize: '1 halaman', fileUrl: dummyFile('observasi-presentasi.pdf'), publishedAt: '2026-11-02', publisher: 'Ibu Sari W.' },
    { id: 'g-17', kind: 'file', subject: 'Bahasa Inggris', assessment: 'Speaking Test', fileName: 'Speaking Test Feedback.pdf', fileSize: '1 halaman', fileUrl: dummyFile('speaking-test.pdf'), note: 'Feedback lisan dirangkum dalam dokumen.', publishedAt: '2026-09-18', publisher: 'Ms. Anita K.' },
    { id: 'g-18', kind: 'score', subject: 'Bahasa Inggris', assessment: 'UTS', score: 89, note: 'Reading comprehension sangat baik.', publishedAt: '2026-10-10', publisher: 'Ms. Anita K.' },
]

export const dummySubjects = [
    { name: 'Matematika Wajib', teacher: 'Pak Dimas R.', hours: 6 },
    { name: 'Fisika', teacher: 'Ibu Ratna S.', hours: 5 },
    { name: 'Kimia', teacher: 'Pak Hendra P.', hours: 5 },
    { name: 'Biologi', teacher: 'Ibu Lestari A.', hours: 5 },
    { name: 'Bahasa Indonesia', teacher: 'Ibu Sari W.', hours: 4 },
    { name: 'Bahasa Inggris', teacher: 'Ms. Anita K.', hours: 4 },
    { name: 'Sejarah', teacher: 'Pak Yusuf H.', hours: 3 },
    { name: 'Seni Budaya', teacher: 'Ibu Maya D.', hours: 2 },
]

export const dummyScheduleDays = [
    { label: 'Sen', date: '2' },
    { label: 'Sel', date: '3' },
    { label: 'Rab', date: '4' },
    { label: 'Kam', date: '5' },
    { label: 'Jum', date: '6' },
]

const lessonSlots = [
    ['07.30', '09.00'],
    ['09.15', '10.45'],
    ['10.45', '12.15'],
    ['12.45', '14.15'],
    ['14.15', '15.00'],
]

const lessonsByDay = [
    [['Matematika Wajib', 'Pak Dimas R.'], ['Bahasa Indonesia', 'Ibu Sari W.'], ['Fisika', 'Ibu Ratna S.'], ['Bahasa Inggris', 'Ms. Anita K.'], ['Seni Budaya', 'Ibu Maya D.']],
    [['Kimia', 'Pak Hendra P.'], ['Biologi', 'Ibu Lestari A.'], ['Matematika Wajib', 'Pak Dimas R.'], ['Sejarah', 'Pak Yusuf H.'], ['Bahasa Indonesia', 'Ibu Sari W.']],
    [['Fisika', 'Ibu Ratna S.'], ['Bahasa Inggris', 'Ms. Anita K.'], ['Kimia', 'Pak Hendra P.'], ['Matematika Wajib', 'Pak Dimas R.'], ['Biologi', 'Ibu Lestari A.']],
    [['Biologi', 'Ibu Lestari A.'], ['Matematika Wajib', 'Pak Dimas R.'], ['Bahasa Indonesia', 'Ibu Sari W.'], ['Fisika', 'Ibu Ratna S.'], ['Sejarah', 'Pak Yusuf H.']],
    [['Bahasa Inggris', 'Ms. Anita K.'], ['Kimia', 'Pak Hendra P.'], ['Matematika Wajib', 'Pak Dimas R.'], ['Seni Budaya', 'Ibu Maya D.'], ['Bahasa Indonesia', 'Ibu Sari W.']],
]

export const dummySchedule = lessonsByDay.map((lessons) => lessons.map(([subject, teacher], index) => ({
    start: lessonSlots[index][0],
    end: lessonSlots[index][1],
    subject,
    teacher,
})))

export const dummyClassmates = ['RA', 'DP', 'FZ', 'MK']

// Dicatat guru di sistem absensi terpisah; aplikasi hanya menampilkan.
export const dummyAttendanceToday = {
    status: 'hadir' as const,
    checkInAt: '06.52',
    checkOutAt: null as string | null,
    punctuality: 'Tepat waktu',
}

export const dummyAttendanceSummary = { hadir: 82, izin: 2, sakit: 1, alfa: 0 }

export const dummyAttendanceSpecialDays: Record<string, 'izin' | 'sakit' | 'alfa'> = {
    '2026-10-14': 'izin',
    '2026-10-21': 'sakit',
}

export const dummyAttendanceHistory = [
    { day: '30', title: 'Jumat, 30 Okt', detail: 'Masuk 06.48 · Pulang 15.05', status: 'Hadir' as const },
    { day: '29', title: 'Kamis, 29 Okt', detail: 'Masuk 06.55 · Pulang 15.02', status: 'Hadir' as const },
    { day: '21', title: 'Rabu, 21 Okt', detail: 'Surat dokter terlampir', status: 'Sakit' as const },
]

export type LeaveType = 'izin' | 'sakit'
export type LeaveStatus = 'menunggu' | 'disetujui' | 'ditolak'

export type DummyLeaveRequest = {
    id: string
    type: LeaveType
    startDate: string
    endDate: string
    reason: string
    status: LeaveStatus
    reviewNote: string | null
}

export const dummyLeaveRequests: DummyLeaveRequest[] = [
    { id: 'izin-3', type: 'izin', startDate: '2026-11-06', endDate: '2026-11-06', reason: 'Menghadiri pernikahan keluarga di Samarinda.', status: 'menunggu', reviewNote: null },
    { id: 'izin-2', type: 'sakit', startDate: '2026-10-21', endDate: '2026-10-21', reason: 'Demam, istirahat di rumah.', status: 'disetujui', reviewNote: null },
    { id: 'izin-1', type: 'izin', startDate: '2026-10-14', endDate: '2026-10-14', reason: 'Lomba tahfiz tingkat kota.', status: 'disetujui', reviewNote: 'Semoga lancar lombanya.' },
]

export const dummyBills = [
    { id: 'spp-nov-2026', title: 'SPP November 2026', due: '10 Nov 2026', amount: 750000, tone: 'bg-pastel-coral text-[#C2413A]' },
    { id: 'kegiatan-ganjil-2026', title: 'Uang Kegiatan Semester', due: '30 Nov 2026', amount: 500000, tone: 'bg-pastel-violet text-primary' },
]

export const dummyPaidBills = [
    { id: 'spp-okt-2026', title: 'SPP Oktober 2026', paidAt: '6 Okt 2026', method: 'Virtual Account', amount: 750000 },
    { id: 'spp-sep-2026', title: 'SPP September 2026', paidAt: '8 Sep 2026', method: 'QRIS', amount: 750000 },
]

export const dummyPaymentMethods = [
    { id: 'va', short: 'VA', name: 'Virtual Account', description: 'Transfer via ATM / m-banking', className: 'bg-pastel-violet text-brand-dark' },
    { id: 'qris', short: 'QR', name: 'QRIS', description: 'Scan dari aplikasi e-wallet', className: 'bg-pastel-mint text-pastel-mint-fg' },
    { id: 'tunai', short: 'Rp', name: 'Bayar di Sekolah', description: 'Tunai di loket tata usaha', className: 'bg-pastel-sun text-pastel-sun-fg' },
]

export type DummyNewsCategory = 'Pengumuman' | 'Kegiatan' | 'Prestasi'

export const dummyNews: Array<{ id: string, category: DummyNewsCategory, title: string, date: string }> = [
    { id: 'news-1', category: 'Pengumuman', title: 'Libur Maulid Nabi dan jadwal masuk kembali', date: '28 Okt 2026 · Tata Usaha' },
    { id: 'news-2', category: 'Kegiatan', title: 'Pekan Literasi BIS: lomba baca puisi antar kelas', date: '25 Okt 2026 · Humas' },
    { id: 'news-3', category: 'Prestasi', title: 'Tim robotik BIS juara 2 tingkat provinsi', date: '20 Okt 2026 · Humas' },
    { id: 'news-4', category: 'Kegiatan', title: 'Outing class kelas XI ke Kebun Raya Balikpapan', date: '15 Okt 2026 · Humas' },
]

// Akun wali yang sedang masuk. Selama belum tersambung API, perubahan nama/kata sandi disimpan di perangkat.
export type DummyAccount = { name: string, email: string, hasPassword: boolean }

const DUMMY_ACCOUNT_KEY = 'pwa-academic-dummy-account'
const defaultDummyAccount: DummyAccount = { name: 'Aisyah Rahma', email: 'wali@example.com', hasPassword: true }

export function getDummyAccount(): DummyAccount {
    try {
        const stored = window.localStorage.getItem(DUMMY_ACCOUNT_KEY)
        return stored ? { ...defaultDummyAccount, ...JSON.parse(stored) } : defaultDummyAccount
    } catch {
        return defaultDummyAccount
    }
}

export function saveDummyAccount(patch: Partial<DummyAccount>) {
    const next = { ...getDummyAccount(), ...patch }
    try {
        window.localStorage.setItem(DUMMY_ACCOUNT_KEY, JSON.stringify(next))
    } catch {
        // Penyimpanan tidak tersedia (mode privat); perubahan hanya berlaku di sesi ini.
    }
    return next
}

// Simulasi jeda jaringan untuk form yang belum tersambung ke API.
export function fakeRequest(timeout = 800) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, timeout)
    })
}
