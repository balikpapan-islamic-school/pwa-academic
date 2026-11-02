import { useState } from 'react'
import { cn } from '@/lib/utils'
import { StudentSummary } from '@/types/academic'

// Warna inisial bergiliran agar beberapa anak mudah dibedakan di daftar.
const avatarTones = [
    'bg-pastel-coral text-pastel-coral-fg',
    'bg-pastel-sky text-pastel-sky-fg',
    'bg-pastel-violet text-pastel-violet-fg',
    'bg-pastel-mint text-pastel-mint-fg',
]

function childAvatarTone(index: number) {
    return avatarTones[Math.max(index, 0) % avatarTones.length]
}

type ChildAvatarProps = {
    student: Pick<StudentSummary, 'name' | 'avatarInitials' | 'photoUrl'>
    index: number
    className: string
}

// Foto dari sekolah bila ada (`photo_url`), selain itu inisial nama.
export function ChildAvatar({ student, index, className }: ChildAvatarProps) {
    const [hasError, setHasError] = useState(false)

    if (student.photoUrl && !hasError) {
        return <img src={student.photoUrl} alt="" onError={() => setHasError(true)} className={cn('shrink-0 rounded-full object-cover', className)} />
    }

    return (
        <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full font-display font-bold', childAvatarTone(index), className)}>
            {student.avatarInitials}
        </span>
    )
}
