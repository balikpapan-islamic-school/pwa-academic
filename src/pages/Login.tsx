import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLogo } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [identity, setIdentity] = useState('wali@bis.test')
    const [password, setPassword] = useState('password')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await login(identity, password)
            navigate('/')
        } catch {
            setError('Login dummy gagal diproses.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto">
                        <AppLogo />
                    </div>
                    <div className="space-y-1">
                        <CardDescription>Halaman login awal untuk siswa dan wali siswa.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <Input id="email" value={identity} onChange={(event) => setIdentity(event.target.value)} placeholder="nama@bis.sch.id" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Kata sandi</label>
                            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
                        </div>
                        <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : 'Masuk'}</Button>
                    </form>
                    <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Akun dummy</p>
                        <p>Wali siswa: `wali@bis.test`</p>
                        <p>Siswa: `siswa@bis.test`</p>
                    </div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </CardContent>
            </Card>
        </main>
    )
}
