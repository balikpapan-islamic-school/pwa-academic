// Data contoh untuk mode mock (VITE_DATA_SOURCE=mock), bentuknya mengikuti kontrak API di docs/API_SPEC_PWA.md.
import {
    AttendanceRecord,
    AttendanceStatus,
    AttendanceSummary,
    Classmate,
    Classroom,
    FileAttachment,
    GradeEntry,
    GradeSubject,
    Guardian,
    LeaveRequest,
    Lesson,
    NewsArticleDetail,
    NotificationItem,
    Semester,
    Subject,
} from '@/types/academic'

// Peserta didik yang sudah terhubung di mode mock (dipakai untuk meniru error 'sudah terhubung').
export const dummyStudent = {
    nik: '6471015405100003',
}

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

// Mapel kelas dummy; urutan ini juga urutan GET /subjects.
export const dummySubjects: Subject[] = [
    { id: 'subj-mtk', name: 'Matematika Wajib', teacherName: 'Pak Dimas R.', hoursPerWeek: 6 },
    { id: 'subj-fis', name: 'Fisika', teacherName: 'Ibu Ratna S.', hoursPerWeek: 5 },
    { id: 'subj-kim', name: 'Kimia', teacherName: 'Pak Hendra P.', hoursPerWeek: 5 },
    { id: 'subj-bio', name: 'Biologi', teacherName: 'Ibu Lestari A.', hoursPerWeek: 5 },
    { id: 'subj-bin', name: 'Bahasa Indonesia', teacherName: 'Ibu Sari W.', hoursPerWeek: 4 },
    { id: 'subj-big', name: 'Bahasa Inggris', teacherName: 'Ms. Anita K.', hoursPerWeek: 4 },
    { id: 'subj-sej', name: 'Sejarah', teacherName: 'Pak Yusuf H.', hoursPerWeek: 3 },
    { id: 'subj-sen', name: 'Seni Budaya', teacherName: 'Ibu Maya D.', hoursPerWeek: 2 },
]

function subjectNamed(name: string) {
    return dummySubjects.find((subject) => subject.name === name) ?? dummySubjects[0]
}

function gradeSubject(name: string): GradeSubject {
    const subject = subjectNamed(name)
    return { id: subject.id, name: subject.name, teacherName: subject.teacherName }
}

export const dummySemesters: Semester[] = [
    { id: 'sem-2026-1', name: 'Ganjil', schoolYear: '2026/2027', isActive: true },
    { id: 'sem-2025-2', name: 'Genap', schoolYear: '2025/2026', isActive: false },
    { id: 'sem-2025-1', name: 'Ganjil', schoolYear: '2025/2026', isActive: false },
]

// Seperti backend: nama file hasil unggah acak dan `page_count` belum tersedia.
const dummyFile = (name: string): FileAttachment => ({
    name: `${name.replace('.pdf', '')}-Xk29fQ.pdf`,
    mimeType: 'application/pdf',
    sizeBytes: 3798,
    pageCount: null,
    url: `${import.meta.env.BASE_URL}dummy-nilai/${name}`,
    expiresAt: null,
})

function scoreEntry(id: string, subject: string, assessment: string, score: number, note: string, date: string): GradeEntry {
    return { id, kind: 'score', subject: gradeSubject(subject), assessment, score, note, publishedAt: `${date}T14:00:00+08:00` }
}

function fileEntry(id: string, subject: string, assessment: string, file: FileAttachment, note: string | null, date: string): GradeEntry {
    return { id, kind: 'file', subject: gradeSubject(subject), assessment, score: null, file, note, publishedAt: `${date}T09:00:00+08:00` }
}

export const dummyGradeEntries: GradeEntry[] = [
    scoreEntry('g-01', 'Matematika Wajib', 'Tugas 1 · Fungsi Komposisi', 90, 'Langkah pengerjaan runtut dan rapi.', '2026-08-21'),
    scoreEntry('g-02', 'Matematika Wajib', 'Ulangan Harian 1', 88, 'Sudah menguasai konsep, perlu latihan soal cerita.', '2026-09-04'),
    scoreEntry('g-03', 'Matematika Wajib', 'UTS', 94, 'Sangat baik. Pertahankan ketelitian.', '2026-10-09'),
    scoreEntry('g-04', 'Matematika Wajib', 'Ulangan Harian 2', 96, 'Nilai tertinggi di kelas untuk materi limit.', '2026-10-30'),
    scoreEntry('g-05', 'Fisika', 'Praktikum Gerak Lurus', 87, 'Data pengamatan lengkap, grafik perlu diberi satuan.', '2026-08-28'),
    scoreEntry('g-06', 'Fisika', 'Ulangan Harian 1', 89, 'Pemahaman konsep vektor sudah baik.', '2026-09-11'),
    scoreEntry('g-07', 'Fisika', 'UTS', 90, 'Baik sekali, analisis soal hitungan tepat.', '2026-10-09'),
    scoreEntry('g-08', 'Kimia', 'Ulangan Harian 1', 72, 'Perlu mengikuti remedial.', '2026-09-02'),
    scoreEntry('g-09', 'Kimia', 'Remedial UH 1', 80, 'Tuntas setelah remedial. Ada peningkatan pemahaman stoikiometri.', '2026-09-16'),
    scoreEntry('g-10', 'Kimia', 'UTS', 86, 'Peningkatan yang baik dibanding ulangan harian.', '2026-10-10'),
    fileEntry('g-11', 'Kimia', 'Praktikum Laju Reaksi', dummyFile('praktikum-laju-reaksi.pdf'), 'Penilaian berupa rubrik praktikum.', '2026-10-31'),
    scoreEntry('g-12', 'Biologi', 'Tugas 1 · Sel', 92, 'Gambar struktur sel lengkap dan berlabel.', '2026-08-25'),
    scoreEntry('g-13', 'Biologi', 'UTS', 88, 'Baik. Perdalam materi jaringan tumbuhan.', '2026-10-08'),
    scoreEntry('g-14', 'Bahasa Indonesia', 'Tugas Teks Eksposisi', 88, 'Argumen kuat, perhatikan ejaan.', '2026-09-07'),
    scoreEntry('g-15', 'Bahasa Indonesia', 'UTS', 86, 'Pemahaman bacaan baik.', '2026-10-08'),
    fileEntry('g-16', 'Bahasa Indonesia', 'Presentasi Kelompok', dummyFile('observasi-presentasi.pdf'), null, '2026-11-02'),
    fileEntry('g-17', 'Bahasa Inggris', 'Speaking Test', dummyFile('speaking-test.pdf'), 'Feedback lisan dirangkum dalam dokumen.', '2026-09-18'),
    scoreEntry('g-18', 'Bahasa Inggris', 'UTS', 89, 'Reading comprehension sangat baik.', '2026-10-10'),
]

export const dummyClassmates: Classmate[] = [
    'Dinda Puspita', 'Fauzan Zaki', 'Maya Kirana', 'Rafi Aditya', 'Aldi Pratama', 'Bunga Lestari', 'Citra Amelia', 'Dimas Saputra',
    'Eka Wahyuni', 'Farhan Hidayat', 'Gilang Ramadhan', 'Hana Safitri', 'Irfan Maulana', 'Jihan Aulia', 'Kevin Wijaya', 'Laila Nur',
    'Muhammad Rizki', 'Nabila Putri', 'Oki Setiawan', 'Putri Ayu', 'Qori Amalia', 'Raka Firmansyah', 'Salsa Bila', 'Tegar Prasetyo',
    'Umar Faruq', 'Vina Oktaviani', 'Wahyu Nugroho', 'Xena Marlina', 'Yusuf Habibi', 'Zahra Khairunnisa', 'Arif Budiman',
]
    .sort((a, b) => a.localeCompare(b))
    .map((name, index) => ({
        id: `cm-${index + 1}`,
        name,
        initials: name.split(' ').slice(0, 2).map((part) => part[0]).join(''),
        photoUrl: null,
    }))

export const dummyClassroom: Classroom = {
    id: 'class-xi-ipa-2',
    name: 'XI IPA 2',
    gradeLevel: 'XI',
    room: 'Ruang 204',
    location: 'Gedung B, Lantai 2',
    homeroomTeacher: 'Ibu Sari W.',
    studentCount: dummyClassmates.length + 1,
    classmatesPreview: dummyClassmates.slice(0, 4),
}

const lessonSlots = [
    ['07:30', '09:00'],
    ['09:15', '10:45'],
    ['10:45', '12:15'],
    ['12:45', '14:15'],
    ['14:15', '15:00'],
]

// Mapel per hari Senin–Jumat.
const lessonsByDay = [
    ['Matematika Wajib', 'Bahasa Indonesia', 'Fisika', 'Bahasa Inggris', 'Seni Budaya'],
    ['Kimia', 'Biologi', 'Matematika Wajib', 'Sejarah', 'Bahasa Indonesia'],
    ['Fisika', 'Bahasa Inggris', 'Kimia', 'Matematika Wajib', 'Biologi'],
    ['Biologi', 'Matematika Wajib', 'Bahasa Indonesia', 'Fisika', 'Sejarah'],
    ['Bahasa Inggris', 'Kimia', 'Matematika Wajib', 'Seni Budaya', 'Bahasa Indonesia'],
]

// Pelajaran untuk hari ke-n (1 = Senin); akhir pekan kosong.
export function dummyLessonsForDay(dayOfWeek: number): Lesson[] {
    return (lessonsByDay[dayOfWeek - 1] ?? []).map((name, index) => {
        const subject = subjectNamed(name)

        return {
            id: `lesson-${dayOfWeek}-${index}`,
            subject: { id: subject.id, name: subject.name },
            teacherName: subject.teacherName,
            startTime: lessonSlots[index][0],
            endTime: lessonSlots[index][1],
            room: subject.name === 'Fisika' ? 'Lab IPA' : 'Ruang 204',
        }
    })
}

// Dicatat guru di sistem absensi terpisah; aplikasi hanya menampilkan.
export const dummyAttendanceSpecialDays: Record<string, Exclude<AttendanceStatus, 'hadir'>> = {
    '2026-10-14': 'izin',
    '2026-10-21': 'sakit',
}

export const dummyAttendanceSummary: AttendanceSummary = { hadir: 82, izin: 2, sakit: 1, alfa: 0, attendanceRate: 96 }

export const dummyAttendanceHistory: AttendanceRecord[] = [
    { id: 'att-3', date: '2026-10-30', status: 'hadir', checkInAt: '2026-10-30T06:48:00+08:00', checkOutAt: '2026-10-30T15:05:00+08:00', note: null, attachment: null },
    { id: 'att-2', date: '2026-10-29', status: 'hadir', checkInAt: '2026-10-29T06:55:00+08:00', checkOutAt: '2026-10-29T15:02:00+08:00', note: null, attachment: null },
    { id: 'att-1', date: '2026-10-21', status: 'sakit', checkInAt: null, checkOutAt: null, note: 'Surat dokter terlampir', attachment: null },
]

export const dummyLeaveRequests: LeaveRequest[] = [
    { id: 'izin-3', type: 'izin', startDate: '2026-11-06', endDate: '2026-11-06', reason: 'Menghadiri pernikahan keluarga di Samarinda.', attachment: null, status: 'menunggu', reviewedBy: null, reviewedAt: null, reviewNote: null, createdAt: '2026-11-01T19:20:00+08:00' },
    { id: 'izin-2', type: 'sakit', startDate: '2026-10-21', endDate: '2026-10-21', reason: 'Demam, istirahat di rumah.', attachment: null, status: 'disetujui', reviewedBy: 'Ibu Sari Wulandari', reviewedAt: '2026-10-21T08:05:00+08:00', reviewNote: null, createdAt: '2026-10-21T06:30:00+08:00' },
    { id: 'izin-1', type: 'izin', startDate: '2026-10-14', endDate: '2026-10-14', reason: 'Lomba tahfiz tingkat kota.', attachment: null, status: 'disetujui', reviewedBy: 'Ibu Sari Wulandari', reviewedAt: '2026-10-13T14:05:00+08:00', reviewNote: 'Semoga lancar lombanya.', createdAt: '2026-10-13T08:10:00+08:00' },
]

export const dummyGuardians: Guardian[] = [
    { relation: 'ibu', name: 'Aisyah Rahma', phone: '0813-xxxx-1120', email: 'wali@bis.test', hasAppAccount: true },
    { relation: 'ayah', name: 'Budi Santoso', phone: '0812-xxxx-4471', email: null, hasAppAccount: false },
]

export const dummyNotifications: NotificationItem[] = [
    { id: 'notif-4', type: 'grade_published', title: 'Nilai baru: Bahasa Indonesia', body: 'Presentasi Kelompok sudah diinput guru.', studentId: null, href: '/akademik', read: false, createdAt: '2026-11-02T09:00:00+08:00' },
    { id: 'notif-3', type: 'grade_published', title: 'Nilai baru: Kimia', body: 'Praktikum Laju Reaksi sudah diinput guru.', studentId: null, href: '/akademik', read: false, createdAt: '2026-10-31T09:00:00+08:00' },
    { id: 'notif-2', type: 'leave_request', title: 'Pengajuan izin disetujui', body: 'Izin sakit 21 Okt 2026 disetujui wali kelas.', studentId: null, href: '/absensi', read: true, createdAt: '2026-10-21T08:05:00+08:00' },
    { id: 'notif-1', type: 'announcement', title: 'Libur Maulid Nabi', body: 'Kegiatan belajar diliburkan, masuk kembali sesuai jadwal.', studentId: null, href: '/', read: true, createdAt: '2026-10-28T08:00:00+08:00' },
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

export const dummyNews: NewsArticleDetail[] = [
    { id: 'news-1', category: 'pengumuman', title: 'Libur Maulid Nabi dan jadwal masuk kembali', summary: 'Kegiatan belajar diliburkan dan dimulai kembali sesuai kalender akademik.', coverImageUrl: null, author: 'Tata Usaha', publishedAt: '2026-10-28T08:00:00+08:00', content: '<p>Dalam rangka memperingati Maulid Nabi Muhammad SAW, kegiatan belajar mengajar di seluruh unit BIS <strong>diliburkan</strong>.</p><h3>Jadwal masuk kembali</h3><ul><li>SD, SMP, dan SMA masuk kembali sesuai kalender akademik.</li><li>Kegiatan ekstrakurikuler pekan ini ditiadakan.</li></ul><p>Informasi lebih lanjut dapat ditanyakan ke Tata Usaha.</p>' },
    { id: 'news-2', category: 'kegiatan', title: 'Pekan Literasi BIS: lomba baca puisi antar kelas', summary: 'Setiap kelas mengirim satu perwakilan untuk lomba baca puisi.', coverImageUrl: null, author: 'Humas', publishedAt: '2026-10-25T08:00:00+08:00', content: '<p>Pekan Literasi BIS kembali digelar. Setiap kelas mengirim <strong>satu perwakilan</strong> untuk lomba baca puisi antar kelas.</p><p>Pendaftaran dilakukan melalui wali kelas masing-masing.</p>' },
    { id: 'news-3', category: 'prestasi', title: 'Tim robotik BIS juara 2 tingkat provinsi', summary: 'Tim robotik BIS meraih juara 2 pada kompetisi robotik tingkat provinsi.', coverImageUrl: null, author: 'Humas', publishedAt: '2026-10-20T08:00:00+08:00', content: '<p>Tim robotik BIS meraih <strong>juara 2</strong> pada kompetisi robotik tingkat provinsi.</p><blockquote>Terima kasih atas doa dan dukungan orang tua serta guru pembimbing.</blockquote>' },
    { id: 'news-4', category: 'kegiatan', title: 'Outing class kelas XI ke Kebun Raya Balikpapan', summary: 'Kelas XI belajar ekosistem langsung di Kebun Raya Balikpapan.', coverImageUrl: null, author: 'Humas', publishedAt: '2026-10-15T08:00:00+08:00', content: '<p>Kelas XI mengikuti outing class ke Kebun Raya Balikpapan untuk mempelajari ekosistem hutan hujan tropis secara langsung.</p>' },
]
