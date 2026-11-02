import { AuthUser, ReportDetail, ReportSummary, StudentSummary } from '@/types/academic'

export const mockUsers: Record<'wali_siswa' | 'siswa', AuthUser> = {
    wali_siswa: {
        id: 'user-wali-1',
        name: 'Aisyah Rahma',
        email: 'wali@bis.test',
        role: 'wali_siswa',
        avatarInitials: 'AR',
        avatarUrl: null,
        hasPassword: true,
        linkedStudentsCount: 2,
    },
    siswa: {
        id: 'user-siswa-1',
        name: 'Ahmad Fauzan',
        email: 'siswa@bis.test',
        role: 'siswa',
        avatarInitials: 'AF',
        avatarUrl: null,
        hasPassword: true,
        linkedStudentsCount: 0,
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
