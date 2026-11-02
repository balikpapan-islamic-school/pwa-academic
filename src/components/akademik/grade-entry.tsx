import { lazy, Suspense } from 'react'
import { ExternalLink, Eye, FileText, Image } from 'lucide-react'
import { formatFileSize } from '@/lib/format'
import { FileAttachment, FileGradeEntry, GradeEntry } from '@/types/academic'

const PdfViewerDialog = lazy(() => import('@/components/pdf-viewer/pdf-viewer-dialog'))

function isPdf(file: FileAttachment) {
    return file.mimeType === 'application/pdf'
}

// "PDF" / "JPG" / "PNG" dari mime type; nama file dari backend acak (hasil unggah), jadi tidak dipakai.
function fileTypeLabel(file: FileAttachment) {
    if (isPdf(file)) {
        return 'PDF'
    }

    const subtype = file.mimeType.split('/')[1] ?? ''
    return subtype === 'jpeg' ? 'JPG' : subtype.toUpperCase() || 'FILE'
}

export function NewBadge() {
    return <span className="shrink-0 rounded-full bg-cta px-2 py-0.5 text-[11px] font-extrabold normal-case tracking-normal text-ink">Baru</span>
}

// Angka nilai di kolom kanan; kosong bila guru hanya mengunggah file atau memberi keterangan.
export function EntryResult({ entry }: { entry: GradeEntry }) {
    if (entry.score === null) {
        return null
    }

    return <span className="shrink-0 font-display text-[22px] font-bold leading-none text-ink">{entry.score}</span>
}

export function EntryDetail({ entry, onOpenFile }: { entry: GradeEntry, onOpenFile: (entry: FileGradeEntry) => void }) {
    if (entry.kind !== 'file') {
        return entry.note ? <span className="text-[13px] leading-snug text-[#44544A]">{entry.note}</span> : null
    }

    const { file } = entry
    const pdf = isPdf(file)
    const Icon = file.mimeType.startsWith('image/') ? Image : FileText
    const className = 'mt-1 flex w-full items-center gap-2.5 rounded-2xl border-2 border-border bg-card p-2 pr-3 text-left transition-colors hover:border-primary'
    const content = (
        <>
            <span aria-hidden="true" className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-pastel-coral text-pastel-coral-fg">
                <Icon className="size-[18px]" />
                <span className="text-[8px] font-extrabold leading-none">{fileTypeLabel(file)}</span>
            </span>
            <span className="flex min-w-0 flex-grow flex-col">
                <span className="truncate text-[13px] font-extrabold">Lembar penilaian</span>
                <span className="text-xs text-subtle">{fileTypeLabel(file)} · {formatFileSize(file.sizeBytes)}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[13px] font-extrabold text-primary">
                {pdf ? <Eye className="size-4" /> : <ExternalLink className="size-4" />}
                {pdf ? 'Lihat' : 'Buka'}
            </span>
        </>
    )

    return (
        <>
            {entry.note ? <span className="text-[13px] leading-snug text-[#44544A]">{entry.note}</span> : null}
            {/* PDF dibuka di penampil aplikasi; gambar/berkas lain langsung dibuka browser lewat signed URL. */}
            {pdf ? (
                <button type="button" onClick={() => onOpenFile(entry)} className={className}>{content}</button>
            ) : (
                <a href={file.url} target="_blank" rel="noreferrer" className={className}>{content}</a>
            )}
        </>
    )
}

// Penampil PDF untuk nilai berjenis file; dimuat terpisah karena pdf.js cukup besar.
export function GradeFileViewer({ entry, onClose }: { entry: FileGradeEntry | null, onClose: () => void }) {
    if (!entry) {
        return null
    }

    return (
        <Suspense fallback={null}>
            <PdfViewerDialog
                open
                onOpenChange={(open) => !open && onClose()}
                url={entry.file.url}
                title={entry.assessment}
                subtitle={[entry.subject.name, entry.subject.teacherName].filter(Boolean).join(' · ')}
                fileName={`${entry.assessment}.pdf`}
            />
        </Suspense>
    )
}
