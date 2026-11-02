import { ReactNode } from 'react'

// Tag yang boleh tampil beserta gayanya; tag lain dibuka (isinya tetap tampil), tag berbahaya dibuang.
const allowedTags: Record<string, string> = {
    p: 'text-[15px] leading-relaxed',
    h2: 'mt-2 font-display text-xl font-semibold',
    h3: 'mt-2 font-display text-lg font-semibold',
    h4: 'mt-1 text-base font-extrabold',
    ul: 'flex list-disc flex-col gap-1 pl-5 text-[15px] leading-relaxed',
    ol: 'flex list-decimal flex-col gap-1 pl-5 text-[15px] leading-relaxed',
    li: '',
    strong: 'font-extrabold',
    b: 'font-extrabold',
    em: 'italic',
    i: 'italic',
    u: 'underline',
    br: '',
    blockquote: 'rounded-2xl border-l-4 border-primary bg-[#F1F6F1] px-4 py-3 text-[15px] italic text-[#44544A]',
    a: 'font-bold text-primary underline underline-offset-2',
}

// Blok tanpa teks (mis. `<p></p>` dari editor admin saat konten dikosongkan) tidak ditampilkan.
const blockTags = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote'])

const droppedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'template'])

function safeHref(href: string | null) {
    if (!href) {
        return undefined
    }

    try {
        const url = new URL(href, window.location.origin)
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : undefined
    } catch {
        return undefined
    }
}

function renderNode(node: Node, key: number): ReactNode {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null
    }

    const element = node as Element
    const tag = element.tagName.toLowerCase()

    if (droppedTags.has(tag)) {
        return null
    }

    if (blockTags.has(tag) && !element.textContent?.trim()) {
        return null
    }

    const children = Array.from(element.childNodes).map(renderNode)

    if (!(tag in allowedTags)) {
        return children.length > 0 ? <span key={key}>{children}</span> : null
    }
    if (tag === 'br') {
        return <br key={key} />
    }
    if (tag === 'a') {
        const href = safeHref(element.getAttribute('href'))

        return href
            ? <a key={key} href={href} target="_blank" rel="noreferrer" className={allowedTags.a}>{children}</a>
            : <span key={key}>{children}</span>
    }

    const Tag = tag as 'p'
    return <Tag key={key} className={allowedTags[tag] || undefined}>{children}</Tag>
}

// True bila konten punya teks yang bisa dibaca; `<p></p>` atau spasi saja dianggap kosong.
export function hasNewsText(content: string | null | undefined) {
    if (!content?.trim()) {
        return false
    }

    return Boolean(new DOMParser().parseFromString(content, 'text/html').body.textContent?.trim())
}

// Isi berita dari GET /news/{id}. HTML diubah jadi elemen React lewat daftar tag yang diizinkan (tanpa innerHTML);
// teks biasa dipecah per paragraf pada baris kosong.
export function NewsContent({ content }: { content: string }) {
    const isHtml = /<[a-z][\s\S]*>/i.test(content)

    if (!isHtml) {
        return (
            <div className="flex flex-col gap-3">
                {content.split(/\n\s*\n/).filter((part) => part.trim()).map((part, index) => (
                    <p key={index} className="whitespace-pre-line text-[15px] leading-relaxed">{part.trim()}</p>
                ))}
            </div>
        )
    }

    const body = new DOMParser().parseFromString(content, 'text/html').body

    return <div className="flex flex-col gap-3">{Array.from(body.childNodes).map(renderNode)}</div>
}
