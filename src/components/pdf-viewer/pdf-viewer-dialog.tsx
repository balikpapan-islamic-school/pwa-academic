import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, Download, FileWarning, LoaderCircle, Minus, Plus } from 'lucide-react'
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

const MIN_ZOOM = 1
const MAX_ZOOM = 2.5
const ZOOM_STEP = 0.25

type PdfViewerDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    url: string
    title: string
    subtitle?: string
    fileName: string
}

function PdfPage({ pdf, pageNumber, width }: { pdf: PDFDocumentProxy, pageNumber: number, width: number }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        let renderTask: RenderTask | null = null
        let cancelled = false

        pdf.getPage(pageNumber).then((page) => {
            const canvas = canvasRef.current
            if (cancelled || !canvas) {
                return
            }

            // Render pada resolusi layar agar teks tetap tajam di HP.
            const pixelRatio = window.devicePixelRatio || 1
            const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * pixelRatio })
            canvas.width = viewport.width
            canvas.height = viewport.height
            canvas.style.width = `${width}px`
            canvas.style.height = `${viewport.height / pixelRatio}px`

            renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport })
            renderTask.promise.catch(() => undefined)
        })

        return () => {
            cancelled = true
            renderTask?.cancel()
        }
    }, [pdf, pageNumber, width])

    return <canvas ref={canvasRef} aria-label={`Halaman ${pageNumber}`} className="block rounded-md bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]" />
}

export default function PdfViewerDialog({ open, onOpenChange, url, title, subtitle, fileName }: PdfViewerDialogProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const [zoom, setZoom] = useState(MIN_ZOOM)
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (!open) {
            return
        }

        let cancelled = false
        const task = getDocument(url)
        setStatus('loading')
        setPdf(null)
        setZoom(MIN_ZOOM)

        task.promise
            .then((document) => {
                if (!cancelled) {
                    setPdf(document)
                    setStatus('ready')
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStatus('error')
                }
            })

        return () => {
            cancelled = true
            task.destroy()
        }
    }, [open, url])

    useEffect(() => {
        const element = scrollRef.current
        if (!element) {
            return
        }

        const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
        observer.observe(element)
        return () => observer.disconnect()
    }, [status])

    const pageWidth = Math.max(containerWidth - 32, 0) * zoom

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-[#E7EEE8] outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-8 data-[state=open]:duration-300">
                    <div className="flex items-center gap-3 rounded-b-3xl bg-card px-4 pb-3 pt-4 shadow-soft">
                        <Dialog.Close aria-label="Tutup" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background">
                            <ArrowLeft className="size-[22px]" strokeWidth={2.2} />
                        </Dialog.Close>
                        <div className="min-w-0 flex-grow">
                            <Dialog.Title className="truncate font-display text-lg font-semibold">{title}</Dialog.Title>
                            <Dialog.Description className="truncate text-xs text-subtle">{subtitle ?? fileName}</Dialog.Description>
                        </div>
                        <a href={url} download={fileName} aria-label="Unduh PDF" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Download className="size-5" />
                        </a>
                    </div>

                    <div ref={scrollRef} className="relative flex-grow overflow-auto">
                        {status === 'loading' ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-bold text-subtle">
                                <LoaderCircle className="size-7 animate-spin text-primary" />
                                Memuat dokumen…
                            </div>
                        ) : null}

                        {status === 'error' ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
                                <FileWarning className="size-8 text-pastel-coral-fg" />
                                <p className="font-display text-lg font-semibold">Dokumen gagal dimuat</p>
                                <p className="text-sm text-subtle">Periksa koneksi internet, atau unduh file untuk membukanya di aplikasi lain.</p>
                            </div>
                        ) : null}

                        {status === 'ready' && pdf && pageWidth > 0 ? (
                            <div className="flex w-max min-w-full flex-col items-center gap-4 p-4 pb-28">
                                {Array.from({ length: pdf.numPages }, (_, index) => (
                                    <PdfPage key={index} pdf={pdf} pageNumber={index + 1} width={pageWidth} />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {status === 'ready' && pdf ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-ink p-1.5 text-white shadow-float">
                                <button type="button" aria-label="Perkecil" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))} className="flex size-10 items-center justify-center rounded-full disabled:opacity-40">
                                    <Minus className="size-[18px]" strokeWidth={2.4} />
                                </button>
                                <span className="min-w-[96px] text-center text-[13px] font-extrabold">
                                    {Math.round(zoom * 100)}% · {pdf.numPages} hal
                                </span>
                                <button type="button" aria-label="Perbesar" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))} className="flex size-10 items-center justify-center rounded-full disabled:opacity-40">
                                    <Plus className="size-[18px]" strokeWidth={2.4} />
                                </button>
                            </div>
                        </div>
                    ) : null}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
