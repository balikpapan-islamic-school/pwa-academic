# Auth PWA Wali Siswa

Panduan menyambungkan login PWA (`pwa-academic`) ke backend BIS Academic: login email, login Google, sesi, ubah nama, dan kata sandi.

- **Base URL (lokal):** `http://bis-academic.test/api/v1`
- **PWA dev:** `http://localhost:5714`
- **Role yang boleh login:** hanya `wali_siswa`. Akun admin/guru/siswa ditolak.

---

## 1. Setup

### 1.1 Google Cloud Console

Di **APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)**, tambahkan ke **Authorized JavaScript origins**:

```text
http://localhost:5714
```

Tambahkan juga domain PWA production saat deploy (mis. `https://wali.bis.sch.id`). Tanpa path, tanpa `/` di akhir. **Authorized redirect URIs** tidak perlu diisi.

### 1.2 `.env` PWA

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://bis-academic.test/api/v1
VITE_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
```

`VITE_GOOGLE_CLIENT_ID` harus **sama persis** dengan `GOOGLE_CLIENT_ID` di `.env` backend. Backend menolak token yang dibuat untuk Client ID lain.

---

## 2. Endpoint

Semua request memakai header `Accept: application/json`. Endpoint private memakai `Authorization: Bearer <token>`.

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/auth/login` | – | Login email + kata sandi |
| POST | `/auth/google` | – | Login / daftar otomatis dengan Google |
| GET | `/auth/me` | ✓ | Data akun (bootstrap sesi) |
| PATCH | `/auth/me` | ✓ | Ubah nama wali |
| PUT | `/auth/password` | ✓ | Ubah / buat kata sandi |
| POST | `/auth/logout` | ✓ | Cabut token yang sedang dipakai |

### 2.1 Objek `user`

Dipakai di response login dan `GET /auth/me` (`data`):

```json
{
  "id": "01KPCST9S1RCJWQN4E5E9GVH8Y",
  "name": "Aisyah Rahma",
  "email": "wali@example.com",
  "role": "wali_siswa",
  "avatar_url": null,
  "has_password": true,
  "linked_students_count": 1
}
```

| Field | Pemakaian di PWA |
|---|---|
| `has_password` | `false` → menu Profil tampil **Buat Kata Sandi** (tanpa kolom kata sandi lama) |
| `linked_students_count` | `0` → Beranda versi belum terhubung (form Hubungkan Peserta Didik). `> 1` → tombol Ganti Profil Anak |
| `avatar_url` | foto profil Google, `null` untuk akun email |

> Field `username` dan `children` dari versi lama **sudah dihapus**. Daftar anak diambil dari `GET /children`.

### 2.2 Login email

**`POST /auth/login`**

```json
{
  "email": "wali@example.com",
  "password": "rahasia123",
  "device_name": "PWA BIS"
}
```

Response `200`:

```json
{
  "message": "Login berhasil.",
  "data": {
    "token": "12|plain-text-token",
    "expires_at": "2026-12-02T14:10:00+08:00",
    "user": { "...": "objek user" }
  }
}
```

| Status | Kapan | Contoh |
|---|---|---|
| `422` | email/kata sandi salah | `errors.email[0]`: `Email atau kata sandi salah.` |
| `422` | bukan akun wali | `errors.email[0]`: `Akun ini bukan akun wali siswa.` |
| `422` | validasi | `errors.email[0]`: `Format email tidak valid.` / `errors.password[0]`: `Kata sandi wajib diisi.` |
| `429` | > 5 percobaan/menit per email + IP | `message`: `Too Many Attempts.` |

> **Perlu diubah di PWA:** `httpAcademicService.login` masih mengirim `{ username: identity }`. Ganti menjadi `{ email: identity, password, device_name: 'PWA BIS' }`. Backend masih menerima `username` selama masa transisi, tetapi pesan error-nya ada di `errors.username`.

Akun yang dibuat lewat Google dan belum membuat kata sandi tidak bisa login email (dapat `Email atau kata sandi salah.`).

### 2.3 Login Google

**`POST /auth/google`**

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "device_name": "PWA BIS"
}
```

`id_token` adalah `credential` dari Google Identity Services (lihat [bagian 3](#3-implementasi-login-google-di-pwa)).

Response `200`: sama dengan login email, ditambah `data.is_new_account`.

| Keadaan | Hasil |
|---|---|
| Email Google belum terdaftar | akun `wali_siswa` **dibuat otomatis** (nama & foto dari Google, `has_password: false`, `linked_students_count: 0`), `is_new_account: true` |
| Email terdaftar sebagai wali | masuk ke akun tersebut, `is_new_account: false`. Akun email lama otomatis tertaut ke Google |
| Email terdaftar sebagai admin/guru | `422` `errors.id_token[0]`: `Akun ini bukan akun wali siswa.` |

| Status | Kapan | `message` / error |
|---|---|---|
| `401` | token tidak valid, kedaluwarsa, atau Client ID berbeda | `Token Google tidak valid atau sudah kedaluwarsa.` |
| `422` | email Google belum terverifikasi | `errors.id_token[0]`: `Email Google belum terverifikasi.` |
| `422` | email sudah tertaut ke akun Google lain | `errors.id_token[0]`: `Email ini sudah terhubung dengan akun Google lain.` |
| `429` | terlalu banyak percobaan | – |

### 2.4 Sesi

- Simpan `data.token`. Token berlaku **30 hari** (`expires_at`, zona WITA `+08:00`).
- Bootstrap sesi: `GET /auth/me`, lalu `GET /children` bila `linked_students_count > 0`.
- `401` dari endpoint mana pun → token habis/dicabut: hapus token lokal dan arahkan ke Login.
- `403` `Akun bukan wali siswa.` → akun tidak berhak memakai PWA: logout.

### 2.5 Ubah nama wali

**`PATCH /auth/me`** — body `{ "name": "Aisyah Rahma" }`

- Response `200`, `message`: `Nama wali tersimpan.`, `data`: objek user terbaru.
- `422` `errors.name[0]`: `Nama wali harus 3–100 karakter.`
- `email` tidak bisa diubah (diabaikan bila dikirim).

### 2.6 Ubah / buat kata sandi

**`PUT /auth/password`**

| `has_password` | Body |
|---|---|
| `true` (Ubah Kata Sandi) | `current_password`, `password`, `password_confirmation` |
| `false` (Buat Kata Sandi, akun Google) | `password`, `password_confirmation` |

- Response `200`: `{"message": "Kata sandi tersimpan.", "data": {"has_password": true}}`
- Token yang sedang dipakai **tetap berlaku**; token di perangkat lain dicabut.

| Error | Key | Pesan |
|---|---|---|
| kata sandi lama salah | `errors.current_password` | `Kata sandi saat ini salah.` |
| terlalu pendek | `errors.password` | `Kata sandi minimal 8 karakter.` |
| konfirmasi beda | `errors.password` | `Konfirmasi kata sandi tidak sama.` |
| sama dengan yang lama | `errors.password` | `Kata sandi baru harus berbeda dari yang lama.` |

### 2.7 Logout

**`POST /auth/logout`** → `{"message": "Logout berhasil.", "data": null}`

---

## 3. Implementasi login Google di PWA

Memakai **Google Identity Services** (tanpa library tambahan). Alurnya: Google memberi `credential` (`id_token`) → kirim ke `POST /auth/google` → simpan token seperti login email.

### 3.1 Tipe env

`src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID?: string
}
```

### 3.2 Service

`src/services/academic-service.ts` — tambahkan ke interface:

```ts
loginWithGoogle(idToken: string): Promise<AuthUser>
```

`src/services/http-academic-service.ts`:

```ts
async loginWithGoogle(idToken) {
    const response = await apiRequest<LoginResponse & { data: { is_new_account: boolean } }>('/auth/google', {
        method: 'POST',
        body: { id_token: idToken, device_name: 'PWA BIS' },
    })

    return mapLoginResponseToAuthUser(response, response.data.user.email)
},
```

Tambahkan implementasi tiruan di `mock-academic-service.ts` agar mode `mock` tetap jalan. `AuthContext` cukup menambahkan `loginWithGoogle` yang memanggil service lalu menyimpan user/token sama seperti `login`.

### 3.3 Tombol Google

```tsx
import { useEffect, useRef } from 'react'

declare global {
    interface Window {
        google?: any
    }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) {
        return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
        const script = existing ?? Object.assign(document.createElement('script'), { src: GSI_SRC, async: true })

        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () => reject(new Error('Gagal memuat Google Sign-In')))

        if (!existing) {
            document.head.appendChild(script)
        }
    })
}

export function GoogleSignInButton({ onCredential }: { onCredential: (idToken: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    useEffect(() => {
        if (!clientId || !containerRef.current) {
            return
        }

        loadGoogleScript().then(() => {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response: { credential: string }) => onCredential(response.credential),
                ux_mode: 'popup',
            })

            window.google.accounts.id.renderButton(containerRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                width: containerRef.current!.offsetWidth,
                locale: 'id',
            })
        })
    }, [clientId, onCredential])

    if (!clientId) {
        return null
    }

    return <div ref={containerRef} className="w-full" />
}
```

Tombol harus dirender oleh Google (`renderButton`); tombol custom tidak bisa memicu login dengan `id_token`. Bungkus `onCredential` dengan `useCallback` agar tombol tidak dirender ulang terus.

### 3.4 Di `Login.tsx`

Ganti tombol placeholder (`TODO` + toast "segera tersedia") dengan:

```tsx
<GoogleSignInButton
    onCredential={async (idToken) => {
        try {
            const user = await loginWithGoogle(idToken)
            // arahkan sesuai linked_students_count (0 → Beranda belum terhubung)
        } catch (error) {
            // tampilkan message / errors.id_token[0] sebagai toast merah
        }
    }}
/>
```

---

## 4. Checklist uji di `http://localhost:5714`

1. `npm run dev` jalan di port 5714 dan origin sudah ditambahkan di Google Cloud Console (perubahan bisa butuh beberapa menit).
2. **Login email** `wali@test.com` / `password` → masuk, punya 2 anak (tombol Ganti Profil Anak muncul).
3. **Login Google** dengan email yang belum terdaftar → akun baru, Beranda versi belum terhubung, menu Profil menampilkan **Buat Kata Sandi**.
4. Buat kata sandi → logout → login email dengan kata sandi baru berhasil.
5. Login Google dengan email admin/guru → toast `Akun ini bukan akun wali siswa.`
6. Ubah nama di Edit Profil → toast `Nama wali tersimpan.`

| Masalah | Penyebab |
|---|---|
| Tombol Google tidak muncul / error `origin_mismatch` | `http://localhost:5714` belum ada di Authorized JavaScript origins |
| `401 Token Google tidak valid...` | `VITE_GOOGLE_CLIENT_ID` beda dengan `GOOGLE_CLIENT_ID` backend, atau `GOOGLE_CLIENT_ID` backend kosong |
| Google menolak akun | OAuth consent screen masih **Testing**: tambahkan email sebagai test user atau publish app |
| Error CORS | pastikan `VITE_API_BASE_URL` memakai `http://bis-academic.test/api/v1` |
