import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { StudentSummary } from '@/types/academic'

type StudentSwitcherProps = {
    students: StudentSummary[]
    activeStudentId?: string
    onSelect: (studentId: string) => void
}

export function StudentSwitcher({ students, activeStudentId, onSelect }: StudentSwitcherProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {students.map((student) => {
                const isActive = student.id === activeStudentId

                return (
                    <Card key={student.id} className={isActive ? 'border-primary/40 shadow-sm' : ''}>
                        <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-11">
                                    <AvatarFallback>{student.avatarInitials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{student.name}</CardTitle>
                                    <CardDescription>{student.unit} · Kelas {student.className}</CardDescription>
                                </div>
                            </div>
                            {isActive ? <StatusBadge label="Aktif" tone="success" /> : null}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">NIS</dt>
                                    <dd className="font-medium">{student.nis}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Semester</dt>
                                    <dd className="font-medium">{student.semesterLabel}</dd>
                                </div>
                            </dl>
                            <Button
                                variant={isActive ? 'secondary' : 'default'}
                                className="w-full"
                                onClick={() => onSelect(student.id)}>
                                {isActive ? 'Sedang Dipilih' : 'Pilih Anak'}
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
