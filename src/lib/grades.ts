import { toneAt } from '@/components/kit/tones'
import { GradeEntry, Subject } from '@/types/academic'

// Label "Baru" tidak disimpan di mana pun: cukup nilai yang terbit dalam beberapa hari terakhir.
export const NEW_GRADE_DAYS = 7

export function isNewGrade(entry: GradeEntry, today = new Date()) {
    const ageInDays = (today.getTime() - new Date(entry.publishedAt).getTime()) / 86_400_000
    return ageInDays >= 0 && ageInDays < NEW_GRADE_DAYS
}

export function byNewest(a: GradeEntry, b: GradeEntry) {
    return b.publishedAt.localeCompare(a.publishedAt)
}

// Warna tetap per mapel mengikuti urutan daftar mapel kelas.
export function subjectTone(subjects: Subject[], subjectId: string) {
    const index = subjects.findIndex((item) => item.id === subjectId)
    return toneAt(index === -1 ? 0 : index)
}

export function countLabel(entries: GradeEntry[]) {
    const files = entries.filter((entry) => entry.kind === 'file').length
    const scores = entries.length - files
    return [scores > 0 ? `${scores} nilai` : null, files > 0 ? `${files} file` : null].filter(Boolean).join(' · ')
}
