import { createContext, ReactNode, use, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { academicService } from '@/services'
import { StudentSummary } from '@/types/academic'

type StudentContextType = {
    activeStudent: StudentSummary | null
    linkedStudents: StudentSummary[]
    isLoading: boolean
    setActiveStudentId: (studentId: string) => void
}

const STORAGE_KEY = 'pwa-academic-active-student'

const StudentContext = createContext<StudentContextType | null>(null)

export function StudentProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [activeStudent, setActiveStudent] = useState<StudentSummary | null>(null)
    const [linkedStudents, setLinkedStudents] = useState<StudentSummary[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let cancelled = false

        if (!user) {
            setActiveStudent(null)
            setLinkedStudents([])
            return
        }

        setIsLoading(true)

        academicService.getLinkedStudents(user.id).then((students) => {
            if (cancelled) {
                return
            }

            setLinkedStudents(students)

            const storedStudentId = window.localStorage.getItem(STORAGE_KEY)
            const nextActive = students.find((student) => student.id === storedStudentId) ?? students[0] ?? null

            setActiveStudent(nextActive)
            if (nextActive) {
                window.localStorage.setItem(STORAGE_KEY, nextActive.id)
            }
            setIsLoading(false)
        })

        return () => {
            cancelled = true
        }
    }, [user])

    function setActiveStudentId(studentId: string) {
        const nextStudent = linkedStudents.find((student) => student.id === studentId)

        if (!nextStudent) {
            return
        }

        window.localStorage.setItem(STORAGE_KEY, studentId)
        setActiveStudent(nextStudent)
    }

    return (
        <StudentContext value={{ activeStudent, linkedStudents, isLoading, setActiveStudentId }}>
            {children}
        </StudentContext>
    )
}

export function useStudent() {
    const context = use(StudentContext)

    if (!context) {
        throw new Error('useStudent must be used within StudentProvider')
    }

    return context
}
