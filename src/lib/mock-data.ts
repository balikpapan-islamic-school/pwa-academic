import {
    AgendaItem,
    AttendanceItem,
    AttendanceSummary,
    AuthUser,
    DashboardData,
    GradeItem,
    NewsItem,
    NotificationItem,
    ReportDetail,
    ReportSummary,
    ScheduleItem,
    SchoolAlert,
    StudentSummary,
} from '@/types/academic'

export const mockUsers: Record<'wali_siswa' | 'siswa', AuthUser> = {
    wali_siswa: {
        id: 'user-wali-1',
        name: 'Aisyah Rahma',
        email: 'wali@bis.test',
        role: 'wali_siswa',
        avatarInitials: 'AR',
    },
    siswa: {
        id: 'user-siswa-1',
        name: 'Ahmad Fauzan',
        email: 'siswa@bis.test',
        role: 'siswa',
        avatarInitials: 'AF',
    },
}

export const mockStudents: StudentSummary[] = [
    {
        id: 'student-1',
        name: 'Ahmad Fauzan',
        nickname: 'Ahmad',
        nis: '2024001',
        unit: 'SDIT',
        className: '6A',
        semesterLabel: '2025/2026 Genap',
        homeroomTeacher: 'Ust. Ridwan',
        avatarInitials: 'AF',
    },
    {
        id: 'student-2',
        name: 'Alya Zahra',
        nickname: 'Alya',
        nis: '2024015',
        unit: 'SMPIT',
        className: '8B',
        semesterLabel: '2025/2026 Genap',
        homeroomTeacher: 'Ustazah Hana',
        avatarInitials: 'AZ',
    },
]

export const mockLinkedStudentsByUserId: Record<string, StudentSummary[]> = {
    'user-wali-1': mockStudents,
    'user-siswa-1': [mockStudents[0]],
}

export const mockScheduleByStudentId: Record<string, ScheduleItem[]> = {
    'student-1': [
        { id: 'sch-1', day: 'Senin', subject: 'Matematika', teacher: 'Ust. Fikri', startTime: '07:15', endTime: '08:35', room: '6A' },
        { id: 'sch-2', day: 'Senin', subject: 'Bahasa Indonesia', teacher: 'Ustazah Mira', startTime: '08:50', endTime: '10:10', room: '6A' },
        { id: 'sch-3', day: 'Senin', subject: 'IPA', teacher: 'Ust. Rahman', startTime: '10:30', endTime: '11:50', room: 'Lab Sains' },
        { id: 'sch-4', day: 'Selasa', subject: 'Tahfidz', teacher: 'Ust. Ridwan', startTime: '07:15', endTime: '08:35', room: '6A' },
        { id: 'sch-5', day: 'Rabu', subject: 'Bahasa Inggris', teacher: 'Ustazah Nisa', startTime: '09:00', endTime: '10:20', room: '6A' },
    ],
    'student-2': [
        { id: 'sch-6', day: 'Senin', subject: 'Matematika', teacher: 'Ust. Ilham', startTime: '07:00', endTime: '08:20', room: '8B' },
        { id: 'sch-7', day: 'Senin', subject: 'IPS', teacher: 'Ustazah Rika', startTime: '08:35', endTime: '09:55', room: '8B' },
        { id: 'sch-8', day: 'Kamis', subject: 'Bahasa Arab', teacher: 'Ust. Salman', startTime: '10:15', endTime: '11:35', room: '8B' },
        { id: 'sch-9', day: 'Jumat', subject: 'PJOK', teacher: 'Ust. Fajar', startTime: '07:00', endTime: '08:20', room: 'Lapangan' },
    ],
}

export const mockAttendanceByStudentId: Record<string, AttendanceItem[]> = {
    'student-1': [
        { id: 'att-1', date: '17 Apr 2026', status: 'Hadir', subject: 'Matematika' },
        { id: 'att-2', date: '16 Apr 2026', status: 'Hadir', subject: 'IPA' },
        { id: 'att-3', date: '15 Apr 2026', status: 'Izin', note: 'Acara keluarga' },
        { id: 'att-4', date: '14 Apr 2026', status: 'Hadir', subject: 'Tahfidz' },
        { id: 'att-5', date: '13 Apr 2026', status: 'Hadir', subject: 'Bahasa Indonesia' },
        { id: 'att-6', date: '12 Apr 2026', status: 'Sakit', note: 'Demam' },
    ],
    'student-2': [
        { id: 'att-7', date: '17 Apr 2026', status: 'Hadir', subject: 'IPS' },
        { id: 'att-8', date: '16 Apr 2026', status: 'Hadir', subject: 'Matematika' },
        { id: 'att-9', date: '15 Apr 2026', status: 'Hadir', subject: 'Bahasa Arab' },
        { id: 'att-10', date: '14 Apr 2026', status: 'Alfa', note: 'Tidak ada keterangan' },
        { id: 'att-11', date: '13 Apr 2026', status: 'Hadir', subject: 'PJOK' },
    ],
}

export const mockAttendanceSummaryByStudentId: Record<string, AttendanceSummary> = {
    'student-1': { hadir: 18, sakit: 1, izin: 1, alfa: 0 },
    'student-2': { hadir: 17, sakit: 0, izin: 0, alfa: 1 },
}

export const mockGradesByStudentId: Record<string, GradeItem[]> = {
    'student-1': [
        {
            id: 'grade-1',
            subject: 'Matematika',
            teacher: 'Ust. Fikri',
            score: 88,
            predicate: 'A-',
            components: [
                { id: 'gc-1', name: 'UH 1', score: 86, weight: 20 },
                { id: 'gc-2', name: 'PTS', score: 89, weight: 35 },
                { id: 'gc-3', name: 'Tugas', score: 90, weight: 15 },
                { id: 'gc-4', name: 'PAS', score: 87, weight: 30 },
            ],
        },
        {
            id: 'grade-2',
            subject: 'IPA',
            teacher: 'Ust. Rahman',
            score: 91,
            predicate: 'A',
            components: [
                { id: 'gc-5', name: 'UH 1', score: 92, weight: 25 },
                { id: 'gc-6', name: 'PTS', score: 90, weight: 35 },
                { id: 'gc-7', name: 'PAS', score: 91, weight: 40 },
            ],
        },
        {
            id: 'grade-3',
            subject: 'Bahasa Indonesia',
            teacher: 'Ustazah Mira',
            score: 85,
            predicate: 'B+',
            components: [
                { id: 'gc-8', name: 'UH 1', score: 84, weight: 20 },
                { id: 'gc-9', name: 'PTS', score: 83, weight: 35 },
                { id: 'gc-10', name: 'PAS', score: 88, weight: 45 },
            ],
        },
    ],
    'student-2': [
        {
            id: 'grade-4',
            subject: 'Matematika',
            teacher: 'Ust. Ilham',
            score: 84,
            predicate: 'B+',
            components: [
                { id: 'gc-11', name: 'UH 1', score: 82, weight: 25 },
                { id: 'gc-12', name: 'PTS', score: 85, weight: 35 },
                { id: 'gc-13', name: 'PAS', score: 84, weight: 40 },
            ],
        },
        {
            id: 'grade-5',
            subject: 'IPS',
            teacher: 'Ustazah Rika',
            score: 89,
            predicate: 'A-',
            components: [
                { id: 'gc-14', name: 'UH 1', score: 90, weight: 20 },
                { id: 'gc-15', name: 'PTS', score: 88, weight: 40 },
                { id: 'gc-16', name: 'PAS', score: 89, weight: 40 },
            ],
        },
    ],
}

export const mockReportSummariesByStudentId: Record<string, ReportSummary[]> = {
    'student-1': [
        { id: 'rep-1', semester: '2025/2026 Genap', status: 'Final', average: 88.3, publishedAt: '10 Apr 2026' },
        { id: 'rep-2', semester: '2025/2026 Ganjil', status: 'Final', average: 86.9, publishedAt: '20 Dec 2025' },
    ],
    'student-2': [
        { id: 'rep-3', semester: '2025/2026 Genap', status: 'Draft', average: 85.1 },
        { id: 'rep-4', semester: '2025/2026 Ganjil', status: 'Final', average: 84.7, publishedAt: '20 Dec 2025' },
    ],
}

export const mockReportDetailsByReportId: Record<string, ReportDetail> = {
    'rep-1': {
        id: 'rep-1',
        semester: '2025/2026 Genap',
        status: 'Final',
        average: 88.3,
        homeroomNote: 'Ahmad menunjukkan perkembangan yang baik dalam kedisiplinan dan tanggung jawab belajar.',
        principalNote: 'Pertahankan konsistensi belajar dan akhlak yang baik.',
        documentUrl: '#',
        subjects: [
            { id: 'rs-1', subject: 'Matematika', knowledgeScore: 88, skillScore: 87, note: 'Mampu menyelesaikan soal dengan teliti.' },
            { id: 'rs-2', subject: 'IPA', knowledgeScore: 91, skillScore: 90, note: 'Aktif saat praktikum.' },
            { id: 'rs-3', subject: 'Bahasa Indonesia', knowledgeScore: 85, skillScore: 84, note: 'Perlu meningkatkan konsistensi menulis.' },
        ],
    },
    'rep-2': {
        id: 'rep-2',
        semester: '2025/2026 Ganjil',
        status: 'Final',
        average: 86.9,
        homeroomNote: 'Semester berjalan baik dan perlu dipertahankan.',
        documentUrl: '#',
        subjects: [
            { id: 'rs-4', subject: 'Matematika', knowledgeScore: 86, skillScore: 85, note: 'Sudah memahami konsep dasar.' },
            { id: 'rs-5', subject: 'IPA', knowledgeScore: 88, skillScore: 87, note: 'Stabil.' },
        ],
    },
    'rep-3': {
        id: 'rep-3',
        semester: '2025/2026 Genap',
        status: 'Draft',
        average: 85.1,
        homeroomNote: 'Draft rapor masih dalam proses finalisasi.',
        subjects: [
            { id: 'rs-6', subject: 'Matematika', knowledgeScore: 84, skillScore: 83, note: 'Perlu lebih fokus saat evaluasi.' },
            { id: 'rs-7', subject: 'IPS', knowledgeScore: 89, skillScore: 88, note: 'Pemahaman materi baik.' },
        ],
    },
    'rep-4': {
        id: 'rep-4',
        semester: '2025/2026 Ganjil',
        status: 'Final',
        average: 84.7,
        homeroomNote: 'Alya aktif dan menunjukkan potensi baik dalam diskusi kelas.',
        documentUrl: '#',
        subjects: [
            { id: 'rs-8', subject: 'Matematika', knowledgeScore: 83, skillScore: 84, note: 'Perlu latihan tambahan.' },
            { id: 'rs-9', subject: 'IPS', knowledgeScore: 86, skillScore: 85, note: 'Baik.' },
        ],
    },
}

export const mockNotificationsByUserId: Record<string, NotificationItem[]> = {
    'user-wali-1': [
        { id: 'notif-1', title: 'Rapor Ahmad telah final', body: 'Rapor semester genap Ahmad Fauzan sudah tersedia untuk ditinjau.', time: '2 jam lalu', href: '/rapor', read: false },
        { id: 'notif-2', title: 'Absensi Alya tercatat alfa', body: 'Mohon cek riwayat absensi Alya pada tanggal 14 Apr 2026.', time: '1 hari lalu', href: '/absensi', read: false },
        { id: 'notif-3', title: 'Nilai IPA Ahmad diperbarui', body: 'Ada pembaruan nilai pada mata pelajaran IPA.', time: '2 hari lalu', href: '/nilai', read: true },
    ],
    'user-siswa-1': [
        { id: 'notif-4', title: 'Nilai Matematika tersedia', body: 'Nilai terbaru Matematika sudah dapat dilihat.', time: '5 jam lalu', href: '/nilai', read: false },
        { id: 'notif-5', title: 'Jadwal besok berubah', body: 'Pelajaran IPA dipindah ke jam ketiga.', time: '1 hari lalu', href: '/jadwal', read: true },
    ],
}

export const mockSchoolAlertByStudentId: Record<string, SchoolAlert> = {
    'student-1': {
        id: 'alert-1',
        title: 'Pengumuman UTS',
        message: 'UTS dimulai Senin depan. Mohon siswa hadir 15 menit lebih awal dan membawa perlengkapan belajar lengkap.',
        tone: 'warning',
        actionLabel: 'Lihat KBM',
        actionHref: '/jadwal',
    },
    'student-2': {
        id: 'alert-2',
        title: 'Rapor Sedang Disiapkan',
        message: 'Wali siswa dapat memantau status finalisasi rapor semester genap melalui menu rapor mulai pekan ini.',
        tone: 'info',
        actionLabel: 'Buka Rapor',
        actionHref: '/rapor',
    },
}

export const mockAgendaByStudentId: Record<string, AgendaItem[]> = {
    'student-1': [
        { id: 'agenda-1', date: '21 Apr 2026', title: 'Simulasi UTS Kelas 6', scope: 'SDIT BIS', location: 'Gedung A' },
        { id: 'agenda-2', date: '24 Apr 2026', title: 'Tahfidz Akbar Yayasan', scope: 'Yayasan BIS', location: 'Masjid Sekolah' },
        { id: 'agenda-3', date: '28 Apr 2026', title: 'Pertemuan Wali Murid', scope: 'SDIT', location: 'Aula Utama' },
    ],
    'student-2': [
        { id: 'agenda-4', date: '22 Apr 2026', title: 'Tryout Matematika SMPIT', scope: 'SMPIT', location: 'Ruang 8B' },
        { id: 'agenda-5', date: '25 Apr 2026', title: 'Seminar Karakter Remaja', scope: 'Yayasan BIS', location: 'Aula Utama' },
        { id: 'agenda-6', date: '29 Apr 2026', title: 'Class Meeting Persiapan Ujian', scope: 'SMPIT', location: 'Lapangan' },
    ],
}

export const mockNewsByStudentId: Record<string, NewsItem[]> = {
    'student-1': [
        { id: 'news-1', title: 'Program Literasi Pagi SDIT Dimulai', summary: 'Program membaca 15 menit sebelum pelajaran pertama dimulai untuk semua kelas SDIT.', date: '17 Apr 2026', category: 'Sekolah' },
        { id: 'news-2', title: 'Tim Olimpiade Sains BIS Raih Juara Kota', summary: 'Siswa BIS berhasil membawa pulang dua medali pada kompetisi sains tingkat kota.', date: '15 Apr 2026', category: 'Prestasi' },
        { id: 'news-3', title: 'Pembaruan Jadwal Ekstrakurikuler', summary: 'Beberapa kegiatan ekstrakurikuler mengalami penyesuaian jadwal efektif pekan ini.', date: '12 Apr 2026', category: 'Kegiatan' },
    ],
    'student-2': [
        { id: 'news-4', title: 'Workshop Public Speaking untuk SMPIT', summary: 'Siswa SMPIT akan mengikuti sesi penguatan komunikasi dan presentasi.', date: '16 Apr 2026', category: 'SMPIT' },
        { id: 'news-5', title: 'Pembinaan Karakter Pekanan Digelar', summary: 'Kegiatan pembinaan karakter setiap Jumat pagi kembali dilaksanakan rutin.', date: '13 Apr 2026', category: 'Karakter' },
        { id: 'news-6', title: 'Lomba Karya Tulis Yayasan Dibuka', summary: 'Pendaftaran lomba karya tulis internal dibuka untuk seluruh unit sekolah.', date: '10 Apr 2026', category: 'Yayasan' },
    ],
}

export const mockDashboardByStudentId: Record<string, DashboardData> = {
    'student-1': {
        student: mockStudents[0],
        todaySchedule: mockScheduleByStudentId['student-1'].filter((item) => item.day === 'Senin').slice(0, 3),
        attendanceSummary: mockAttendanceSummaryByStudentId['student-1'],
        latestAttendance: mockAttendanceByStudentId['student-1'].slice(0, 3),
        gradeHighlights: mockGradesByStudentId['student-1'].slice(0, 3),
        latestReport: mockReportSummariesByStudentId['student-1'][0],
        schoolAlert: mockSchoolAlertByStudentId['student-1'],
        agendas: mockAgendaByStudentId['student-1'],
        news: mockNewsByStudentId['student-1'],
    },
    'student-2': {
        student: mockStudents[1],
        todaySchedule: mockScheduleByStudentId['student-2'].filter((item) => item.day === 'Senin').slice(0, 2),
        attendanceSummary: mockAttendanceSummaryByStudentId['student-2'],
        latestAttendance: mockAttendanceByStudentId['student-2'].slice(0, 3),
        gradeHighlights: mockGradesByStudentId['student-2'].slice(0, 2),
        latestReport: mockReportSummariesByStudentId['student-2'][0],
        schoolAlert: mockSchoolAlertByStudentId['student-2'],
        agendas: mockAgendaByStudentId['student-2'],
        news: mockNewsByStudentId['student-2'],
    },
}
