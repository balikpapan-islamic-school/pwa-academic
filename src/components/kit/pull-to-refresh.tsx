import { ReactNode, useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { useRefresh } from '@/contexts/RefreshContext'
import { cn } from '@/lib/utils'

// Jarak tarik (setelah redaman) untuk memicu muat ulang, batas tarik maksimum, dan posisi tahan selama memuat.
const TRIGGER = 72
const MAX_PULL = 128
const HOLD = 64
const RING = 2 * Math.PI * 9

// Redaman karet: makin jauh ditarik makin berat, tidak pernah melewati MAX_PULL.
function damp(distance: number) {
    return MAX_PULL * (1 - Math.exp(-distance / 160))
}

// Sheet/dialog Radix mengunci scroll body; jangan menangkap gestur di belakangnya.
function isScrollLocked() {
    return document.body.hasAttribute('data-scroll-locked')
}

type Gesture = { startX: number, startY: number, mode: 'pending' | 'pulling' | 'ignored' }

// Tarik layar dari posisi paling atas untuk memuat ulang semua data halaman (lihat RefreshContext).
export function PullToRefresh({ children }: { children: ReactNode }) {
    const { refresh } = useRefresh()
    const [pull, setPull] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    // Transform dilepas setelah animasi kembali selesai, agar elemen `fixed` di dalam halaman tetap menempel ke layar.
    const [isSettling, setIsSettling] = useState(false)
    const gesture = useRef<Gesture | null>(null)
    const pullRef = useRef(0)
    const busyRef = useRef(false)

    useEffect(() => {
        function updatePull(next: number) {
            pullRef.current = next
            setPull(next)
        }

        function handleStart(event: TouchEvent) {
            if (busyRef.current || event.touches.length > 1 || window.scrollY > 0 || isScrollLocked()) {
                gesture.current = null
                return
            }
            gesture.current = { startX: event.touches[0].clientX, startY: event.touches[0].clientY, mode: 'pending' }
        }

        function handleMove(event: TouchEvent) {
            const current = gesture.current
            if (!current || current.mode === 'ignored') {
                return
            }

            const deltaX = event.touches[0].clientX - current.startX
            const deltaY = event.touches[0].clientY - current.startY

            if (current.mode === 'pending') {
                // Tunggu arah gestur jelas: geser horizontal (mis. chip kategori) atau scroll ke bawah tidak dihitung.
                if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
                    return
                }
                if (deltaY <= 0 || Math.abs(deltaX) > Math.abs(deltaY) || window.scrollY > 0) {
                    current.mode = 'ignored'
                    return
                }
                current.mode = 'pulling'
                setIsDragging(true)
                setIsSettling(false)
            }

            if (event.cancelable) {
                event.preventDefault()
            }

            const next = damp(Math.max(0, deltaY))
            if (pullRef.current < TRIGGER && next >= TRIGGER) {
                navigator.vibrate?.(8)
            }
            updatePull(next)
        }

        async function handleEnd() {
            const current = gesture.current
            gesture.current = null
            if (current?.mode !== 'pulling') {
                return
            }

            setIsDragging(false)

            if (pullRef.current < TRIGGER) {
                setIsSettling(true)
                updatePull(0)
                return
            }

            busyRef.current = true
            setIsRefreshing(true)
            updatePull(HOLD)
            try {
                await refresh()
            } finally {
                busyRef.current = false
                setIsRefreshing(false)
                setIsSettling(true)
                updatePull(0)
            }
        }

        window.addEventListener('touchstart', handleStart, { passive: true })
        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', handleEnd)
        window.addEventListener('touchcancel', handleEnd)
        return () => {
            window.removeEventListener('touchstart', handleStart)
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', handleEnd)
            window.removeEventListener('touchcancel', handleEnd)
        }
    }, [refresh])

    useEffect(() => {
        if (!isSettling) {
            return
        }
        const timer = setTimeout(() => setIsSettling(false), 360)
        return () => clearTimeout(timer)
    }, [isSettling])

    const progress = Math.min(1, pull / TRIGGER)
    const isArmed = pull >= TRIGGER
    const isVisible = pull > 0 || isRefreshing
    const transition = isDragging ? 'none' : 'transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease'

    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 z-40 mx-auto flex max-w-md justify-center"
                style={{
                    transform: `translate3d(0, ${pull - 48}px, 0)`,
                    opacity: isVisible ? Math.max(progress, isRefreshing ? 1 : 0) : 0,
                    transition,
                }}>
                <span className={cn('mt-[calc(env(safe-area-inset-top)+4px)] flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-chip transition-transform duration-200', isArmed && !isRefreshing && 'scale-110')}>
                    <svg viewBox="0 0 24 24" className={cn('absolute size-11 -rotate-90', isRefreshing && 'animate-spin')}>
                        <circle cx="12" cy="12" r="9" fill="none" strokeWidth="2.2" className="stroke-brand-soft" />
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            className="stroke-primary"
                            strokeDasharray={RING}
                            strokeDashoffset={isRefreshing ? RING * 0.7 : RING * (1 - progress)}
                        />
                    </svg>
                    {isRefreshing ? (
                        <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
                    ) : (
                        <ArrowDown className={cn('size-[18px] transition-transform duration-200', isArmed && 'rotate-180')} strokeWidth={2.6} />
                    )}
                </span>
            </div>
            <span role="status" className="sr-only">{isRefreshing ? 'Memuat ulang…' : ''}</span>
            <div
                style={{
                    transform: pull > 0 || isSettling ? `translate3d(0, ${pull}px, 0)` : undefined,
                    transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1)',
                }}>
                {children}
            </div>
        </>
    )
}
