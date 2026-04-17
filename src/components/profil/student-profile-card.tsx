import { GraduationCap, School, UserSquare2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StudentSummary } from '@/types/academic'

type StudentProfileCardProps = {
    student: StudentSummary
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="size-14">
                    <AvatarFallback>{student.avatarInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{student.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{student.nickname} · NIS {student.nis}</p>
                </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/60 p-4">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><School className="size-4" />Unit</p>
                    <p className="mt-2 font-semibold">{student.unit}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><GraduationCap className="size-4" />Kelas</p>
                    <p className="mt-2 font-semibold">{student.className}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-4">
                    <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><UserSquare2 className="size-4" />Wali Kelas</p>
                    <p className="mt-2 font-semibold">{student.homeroomTeacher}</p>
                </div>
            </CardContent>
        </Card>
    )
}
