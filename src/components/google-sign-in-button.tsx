import { useEffect, useRef } from 'react'

type GoogleCredentialResponse = { credential: string }

type GoogleAccountsId = {
    initialize: (config: { client_id: string, callback: (response: GoogleCredentialResponse) => void, ux_mode: 'popup', use_fedcm_for_button?: boolean }) => void
    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}

declare global {
    interface Window {
        google?: { accounts?: { id?: GoogleAccountsId } }
    }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript(): Promise<GoogleAccountsId> {
    if (window.google?.accounts?.id) {
        return Promise.resolve(window.google.accounts.id)
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
        const script = existing ?? Object.assign(document.createElement('script'), { src: GSI_SRC, async: true })

        script.addEventListener('load', () => {
            if (window.google?.accounts?.id) {
                resolve(window.google.accounts.id)
            } else {
                reject(new Error('Gagal memuat Google Sign-In'))
            }
        })
        script.addEventListener('error', () => reject(new Error('Gagal memuat Google Sign-In')))

        if (!existing) {
            document.head.appendChild(script)
        }
    })
}

type GoogleSignInButtonProps = {
    // Bungkus dengan useCallback agar tombol tidak dirender ulang terus.
    onCredential: (idToken: string) => void
    onLoadError?: (error: Error) => void
}

// Tombol harus dirender oleh Google (renderButton); tombol custom tidak bisa menghasilkan id_token.
export function GoogleSignInButton({ onCredential, onLoadError }: GoogleSignInButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    useEffect(() => {
        let cancelled = false

        if (!clientId || !containerRef.current) {
            return
        }

        loadGoogleScript().then((googleId) => {
            const container = containerRef.current

            if (cancelled || !container) {
                return
            }

            googleId.initialize({
                client_id: clientId,
                callback: (response) => onCredential(response.credential),
                ux_mode: 'popup',
                // Browser yang mendukung FedCM (Chrome) memakai dialog bawaan browser, bukan popup + postMessage.
                use_fedcm_for_button: true,
            })

            googleId.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                // Google membatasi lebar tombol maksimal 400px.
                width: Math.min(container.offsetWidth, 400),
                locale: 'id',
            })
        }).catch((error: Error) => {
            if (!cancelled) {
                onLoadError?.(error)
            }
        })

        return () => {
            cancelled = true
        }
    }, [clientId, onCredential, onLoadError])

    if (!clientId) {
        return null
    }

    return <div ref={containerRef} className="flex min-h-11 w-full justify-center" />
}
