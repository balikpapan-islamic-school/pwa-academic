# API SPEC PWA

Dokumen ini adalah kontrak API antara frontend PWA BIS dan backend. Setiap endpoint diturunkan langsung dari data yang tampil di halaman frontend (desain `.temp/ui.html`).

- **Status:** target yang perlu dibangun backend
- **Endpoint yang sudah aktif:** dirangkum di [bagian 11](#11-perubahan-terhadap-endpoint-aktif). Sebagian isi `API_USAGE.md` sudah usang (mis. `/reports` dan `GET /me`); bila berbeda, ikuti dokumen ini
- **Pengguna PWA:** hanya akun role `wali_siswa` (orang tua/wali). Siswa tidak login ke PWA
- **Data contoh frontend:** `src/lib/dummy-ui.ts` (bentuk data di sana mengikuti dokumen ini)

---

## Daftar Isi

1. [Konvensi Umum](#1-konvensi-umum)
2. [Peta Halaman → Endpoint](#2-peta-halaman--endpoint)
3. [Auth](#3-auth)
4. [Konteks Peserta Didik (Wali)](#4-konteks-peserta-didik-wali)
5. [Beranda](#5-beranda)
6. [Akademik](#6-akademik)
7. [Absensi](#7-absensi)
8. [Profil & Pengaturan](#8-profil--pengaturan)
9. [Notifikasi](#9-notifikasi)
10. [Pembayaran (ditunda)](#10-pembayaran-ditunda)
11. [Perubahan terhadap Endpoint Aktif](#11-perubahan-terhadap-endpoint-aktif)
12. [Urutan Implementasi](#12-urutan-implementasi)
13. [Keputusan Produk](#13-keputusan-produk)

---

## 1. Konvensi Umum

### 1.1 Base URL & Header

```text
{BASE_URL}/api/v1
```

Semua endpoint private memakai Laravel Sanctum bearer token:

```http
Accept: application/json
Authorization: Bearer <token>
```

### 1.2 Format Response

Sukses:

```json
{
  "message": "OK",
  "data": {}
}
```

Daftar berhalaman (untuk endpoint yang ditandai **paginated**):

```json
{
  "message": "OK",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 57,
    "last_page": 3
  }
}
```

Query standar untuk endpoint paginated: `page` (default `1`), `per_page` (default `20`, maks `50`).

### 1.3 Format Error

| Status | Kapan | Contoh `message` |
|---|---|---|
| `401` | Token tidak ada / kedaluwarsa | `Unauthenticated.` |
| `403` | Tidak berhak atas data peserta didik tersebut | `Akun tidak memiliki akses ke peserta didik ini.` |
| `404` | Data tidak ditemukan | `Data tidak ditemukan.` |
| `409` | Konflik status (mis. anak sudah terhubung) | `Peserta didik sudah terhubung dengan akun ini.` |
| `422` | Validasi gagal | `The given data was invalid.` |
| `429` | Terlalu banyak percobaan | `Terlalu banyak percobaan. Coba lagi dalam 60 detik.` |

Error validasi:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email wajib diisi."]
  }
}
```

> Frontend menampilkan `errors.<field>[0]` di bawah input terkait, dan `message` sebagai pesan umum (lihat [1.8](#18-pesan-untuk-toast)). Pesan sebaiknya berbahasa Indonesia.

### 1.4 Tipe Data

| Jenis | Format | Contoh |
|---|---|---|
| ID | ULID (string) | `01KPCSPKA4RKT8J3BCCP7QXW14` |
| Tanggal | `YYYY-MM-DD` | `2026-11-02` |
| Waktu | `HH:mm` (24 jam) | `07:30` |
| Tanggal-waktu | ISO 8601 dengan offset **WITA (+08:00)** | `2026-11-02T06:52:00+08:00` |
| Enum | huruf kecil, `snake_case` | `hadir`, `tepat_waktu` |
| Angka nilai | number (boleh desimal) | `88.5` |

Frontend yang memformat tampilan (mis. `2 Nov 2026`, `07.30`). Backend **jangan** mengirim string tanggal yang sudah diformat.

### 1.5 Konteks Peserta Didik (`student_id`)

Semua endpoint data akademik menerima query `student_id`:

Semua pengguna PWA adalah wali (`wali_siswa`):

- Wali punya **lebih dari satu** anak → `student_id` **wajib**.
- Wali punya **satu** anak → `student_id` boleh dikosongkan; backend memakai anak tersebut.
- `student_id` harus salah satu anak dari `GET /children` (yang sudah disetujui admin). Jika bukan → `403`.

Frontend tetap selalu mengirim `student_id` anak aktif agar perilakunya sama untuk satu maupun beberapa anak.

### 1.6 Konteks Semester (`semester_id`)

Endpoint yang terikat semester menerima query `semester_id` (opsional). Jika kosong, backend memakai semester aktif. Daftar semester tersedia di `GET /semesters`.

### 1.7 File

File (mis. lembar penilaian PDF) dikirim sebagai objek:

```json
{
  "name": "Lembar Penilaian Praktikum.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 3798,
  "page_count": 2,
  "url": "https://files.example.com/...signed...",
  "expires_at": "2026-11-02T10:30:00+08:00"
}
```

Syarat `url` (penting untuk penampil PDF di aplikasi):

- signed URL berumur pendek (disarankan 15–60 menit), tidak perlu header Authorization
- response file mengirim `Content-Type: application/pdf` dan `Content-Disposition: inline`
- **CORS wajib diizinkan** untuk origin PWA (`Access-Control-Allow-Origin`), karena PDF dibaca lewat JavaScript (pdf.js), bukan dibuka langsung oleh browser
- mendukung `Range` request disarankan (untuk PDF besar)

### 1.8 Pesan untuk Toast

Setelah aksi tulis (POST/PUT/PATCH/DELETE), frontend menampilkan **toast** singkat. Judul toast diambil dari `message` response bila ada; jika tidak, frontend memakai teks bawaannya. Karena itu `message` untuk aksi tulis:

- berbahasa Indonesia, satu kalimat pendek (sekitar 40 karakter)
- menyebut hasil aksi, bukan status teknis (`Pengajuan izin dibatalkan`, bukan `Deleted.`)
- untuk error non-validasi (`403`, `409`, `429`, `5xx`), `message` tampil sebagai toast merah; jadi harus bisa dipahami orang tua

| Aksi | Endpoint | `message` sukses yang disarankan |
|---|---|---|
| Kirim pengajuan hubungkan anak | `POST /children/requests` | `Pengajuan berhasil dikirim dan menunggu verifikasi admin.` |
| Kirim pengajuan izin | `POST /attendance/leave-requests` | `Pengajuan izin terkirim ke wali kelas.` |
| Batalkan pengajuan izin | `DELETE /attendance/leave-requests/{id}` | `Pengajuan izin dibatalkan.` |
| Ubah nama wali | `PATCH /auth/me` | `Nama wali tersimpan.` |
| Ubah / buat kata sandi | `PUT /auth/password` | `Kata sandi tersimpan.` |
| Sakelar notifikasi | `PATCH /me/preferences` | `Notifikasi diaktifkan.` / `Notifikasi dimatikan.` |
| Keluar | `POST /auth/logout` | `Logout berhasil.` |

**Konfirmasi dilakukan di frontend.** Aksi berikut sudah melewati modal konfirmasi sebelum request dikirim, jadi backend tidak perlu langkah konfirmasi tambahan (mis. token konfirmasi): Keluar, Kirim pengajuan hubungkan anak, Kirim pengajuan izin, Batalkan pengajuan izin.

---

## 2. Peta Halaman → Endpoint

| Halaman / Bagian | Endpoint |
|---|---|
| Onboarding | — (statis) |
| Login | `POST /auth/login`, `POST /auth/google` |
| Bootstrap sesi | `GET /auth/me`, `GET /children` (wali) |
| Beranda — header, kartu menu, jadwal hari ini | `GET /dashboard` |
| Beranda — tombol Ganti Profil Anak (wali > 1 anak) | `GET /children` |
| Beranda — Berita Sekolah | `GET /news` |
| Beranda (wali belum terhubung) — Status Pengajuan (`PENDING` / `REJECTED`) | `GET /children/requests` |
| Beranda (wali belum terhubung) — banner SPMB | — (konfigurasi statis frontend, lihat [5.3](#53-banner-spmb)) |
| Hubungkan Peserta Didik — form & Status Pengajuan | `POST /children/requests`, `GET /children/requests` |
| Akademik — pilihan semester | `GET /semesters` |
| Akademik — tab Nilai (Per Mapel & Riwayat) | `GET /grades/entries` |
| Akademik — tab Mapel | `GET /subjects` |
| Akademik — tab Kelas | `GET /classroom`, `GET /classroom/students`, `GET /schedule` |
| Absensi — kartu hari ini | `GET /attendance/today` |
| Absensi — rekap Hadir/Izin/Sakit/Alpa | `GET /attendance/summary` |
| Absensi — kalender bulanan | `GET /attendance/calendar` |
| Absensi — Riwayat Terbaru | `GET /attendance` |
| Absensi — daftar Pengajuan Izin + tombol Batalkan | `GET /attendance/leave-requests`, `DELETE /attendance/leave-requests/{id}` |
| Ajukan Izin (`/absensi/izin`, wali) | `POST /attendance/leave-requests` |
| Profil — kartu & Data Pribadi peserta didik | `GET /me?student_id=` (disediakan ulang, lihat [8.1](#81-profil-peserta-didik)) |
| Profil — kartu Akun Orang Tua / Wali (nama + email) | `GET /auth/me` |
| Profil — sakelar Notifikasi | `GET /me/preferences`, `PATCH /me/preferences` |
| Ubah / Buat Kata Sandi (`/profil/kata-sandi`) | `PUT /auth/password` |
| Edit Profil — ubah nama wali (`/profil/edit`) | `PATCH /auth/me` |
| Profil — tombol Keluar | `POST /auth/logout` |
| Profil — Data Orang Tua / Wali | `GET /me/guardians` |
| Notifikasi (ikon lonceng) | `GET /notifications`, `POST /notifications/{id}/read` |
| Pembayaran *(disembunyikan)* | lihat [bagian 10](#10-pembayaran-ditunda) |

---

## 3. Auth

### 3.1 Login dengan Email

**`POST /auth/login`** · Auth: tidak · Halaman: Login

Halaman login sekarang memakai **email**, bukan username.

Request:

```json
{
  "email": "wali@example.com",
  "password": "rahasia123",
  "device_name": "PWA BIS"
}
```

| Field | Tipe | Aturan |
|---|---|---|
| `email` | string | wajib, format email |
| `password` | string | wajib |
| `device_name` | string | opsional, untuk nama token Sanctum |

Response `200`:

```json
{
  "message": "Login berhasil.",
  "data": {
    "token": "1|plain-text-token",
    "user": { "...": "sama dengan GET /auth/me" }
  }
}
```

Error:

- `422` — `errors.email` / `errors.password` untuk validasi format
- `422` — kredensial salah: `{"message": "Email atau kata sandi salah.", "errors": {"email": ["Email atau kata sandi salah."]}}`
- `422` — akun bukan wali (admin/guru/siswa): `{"message": "Akun ini bukan akun wali siswa.", "errors": {"email": ["Akun ini bukan akun wali siswa."]}}`
- `429` — terlalu banyak percobaan (disarankan 5x/menit per email + IP)

> **Transisi:** selama migrasi, backend boleh tetap menerima `username` sebagai alternatif `email`, dan error memakai key `errors.username`. Frontend sudah membaca `errors.email` maupun `errors.username`.

### 3.2 Login dengan Google

**`POST /auth/google`** · Auth: tidak · Halaman: Login (tombol "Lanjutkan dengan Google")

Frontend memakai Google Identity Services untuk mendapatkan `id_token`, lalu mengirimnya ke backend. Backend memverifikasi token ke Google (audience = Client ID aplikasi) dan mencocokkan email.

Request:

```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "device_name": "PWA BIS"
}
```

Response `200`: sama dengan `POST /auth/login`, ditambah `data.is_new_account`.

Login Google **hanya untuk wali**:

- Email Google sudah terdaftar sebagai `wali_siswa` → masuk. `is_new_account: false`.
- Email Google terdaftar dengan **role lain** (admin/guru) → ditolak `422`: `Akun ini bukan akun wali siswa.`
- Email Google **belum terdaftar** → backend **otomatis membuat akun** role `wali_siswa` dengan `name` dan `avatar_url` dari profil Google, `has_password: false`, belum terhubung ke anak mana pun. `is_new_account: true`. Frontend lalu menampilkan Beranda versi belum terhubung.
- Akun yang dibuat lewat Google bisa **menambahkan kata sandi** lewat `PUT /auth/password` ([3.5](#35-ubah--buat-kata-sandi)), sehingga tetap bisa masuk dengan email + kata sandi jika Google tidak bisa dipakai.

Error:

- `401` — `id_token` tidak valid / kedaluwarsa
- `422` — email Google belum diverifikasi (`email_verified = false`)
- `422` — email terdaftar dengan role selain `wali_siswa`: `Akun ini bukan akun wali siswa.`

### 3.3 Akun Login

**`GET /auth/me`** · Auth: ya · Dipakai saat bootstrap sesi

Response `200`:

```json
{
  "message": "OK",
  "data": {
    "id": "01KPCST9S1RCJWQN4E5E9GVH8Y",
    "name": "Aisyah Rahma",
    "email": "wali@example.com",
    "role": "wali_siswa",
    "avatar_url": null,
    "has_password": true,
    "linked_students_count": 0
  }
}
```

| Field | Keterangan |
|---|---|
| `name`, `email` | ditampilkan di kartu **Akun Orang Tua / Wali** di Profil; `email` tampil terkunci di form Edit Profil |
| `role` | selalu `wali_siswa` (akun lain tidak bisa login) |
| `has_password` | `false` jika akun dibuat lewat Google dan belum punya kata sandi → menu Profil tampil sebagai **Buat Kata Sandi** (tanpa kolom kata sandi lama) |
| `linked_students_count` | jumlah anak yang sudah disetujui admin. `0` → **Beranda versi belum terhubung**; `> 1` → tombol notifikasi di Beranda diganti tombol **Ganti Profil Anak** |

### 3.4 Logout

**`POST /auth/logout`** · Auth: ya

Response `200`: `{"message": "Logout berhasil.", "data": null}`. Mencabut token yang sedang dipakai.

### 3.5 Ubah / Buat Kata Sandi

**`PUT /auth/password`** · Auth: ya · Halaman: Profil → Ubah Kata Sandi / Buat Kata Sandi

Satu endpoint untuk dua keadaan, ditentukan `has_password` di `GET /auth/me`:

| Keadaan | Menu di Profil | Body |
|---|---|---|
| `has_password = true` | Ubah Kata Sandi | `current_password`, `password`, `password_confirmation` |
| `has_password = false` (akun Google) | Buat Kata Sandi | `password`, `password_confirmation` |

```json
{
  "current_password": "rahasia123",
  "password": "rahasiaBaru456",
  "password_confirmation": "rahasiaBaru456"
}
```

- `password` minimal 8 karakter, harus sama dengan `password_confirmation`
- saat `has_password = true`: `password` harus **berbeda** dari `current_password`
- setelah berhasil, `has_password` menjadi `true`; akun bisa masuk lewat Google **dan** lewat email + kata sandi
- token yang sedang dipakai **tetap berlaku** (pengguna tidak dikeluarkan); token di perangkat lain boleh dicabut

Response `200`: `{"message": "Kata sandi tersimpan.", "data": {"has_password": true}}`. Frontend lalu kembali ke Profil dan menampilkan toast.

| Error | Key | Contoh pesan |
|---|---|---|
| `422` kata sandi lama salah | `errors.current_password` | `Kata sandi saat ini salah.` |
| `422` terlalu pendek / tidak sama | `errors.password` | `Kata sandi minimal 8 karakter.` / `Konfirmasi kata sandi tidak sama.` |
| `422` sama dengan kata sandi lama | `errors.password` | `Kata sandi baru harus berbeda dari yang lama.` |

> Frontend menampilkan `errors.password` yang berisi soal konfirmasi di bawah kolom "Ulangi Kata Sandi Baru".

### 3.6 Ubah Nama Wali

**`PATCH /auth/me`** · Auth: ya (role `wali_siswa`) · Halaman: Profil → Akun Orang Tua / Wali → Ubah

Satu-satunya data yang boleh diubah sendiri adalah **nama wali** (nama akun). Data peserta didik (nama, tanggal lahir, NIS, dll.) hanya diubah oleh sekolah.

```json
{
  "name": "Aisyah Rahma"
}
```

- `name` wajib, 3–100 karakter; backend memangkas spasi di awal/akhir dan spasi ganda
- Response `200`: `message` `Nama wali tersimpan.`, `data` objek sama dengan `GET /auth/me`. Frontend lalu kembali ke Profil dan menampilkan toast berisi nama baru
- Error `422`: `errors.name` (mis. `Nama wali harus 3–100 karakter.`)
- `email` **tidak** bisa diubah lewat endpoint ini (field diabaikan bila dikirim)

---

## 4. Konteks Peserta Didik (Wali)

### 4.1 Daftar Anak Terhubung

**`GET /children`** · Auth: ya (role `wali_siswa`) · Bootstrap sesi, penentu tampilan Beranda

Response `200`:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
      "name": "Naura Aulia Putri",
      "nickname": "Naura",
      "nis": "2024017",
      "nisn": "0101234567",
      "school": { "id": "01...", "name": "SMA Islam Balikpapan", "level": "SMA" },
      "class_name": "XI IPA 2",
      "relation": "ibu",
      "status_active": true,
      "photo_url": null
    }
  ]
}
```

- Hanya berisi anak yang **sudah disetujui admin** (pengajuan `APPROVED`, lihat [4.2](#42-ajukan-hubungkan-anak)).
- Array kosong `[]` → tampilkan Beranda versi "belum ada peserta didik", beserta pengajuan yang masih `PENDING` / `REJECTED`.
- Beranda hanya menampilkan **satu anak** dalam satu waktu. Lebih dari satu anak → tombol notifikasi di header Beranda diganti tombol **Ganti Profil Anak**, yang membuka daftar dari endpoint ini. Pilihan anak aktif disimpan di perangkat dan dikirim sebagai `student_id` ke endpoint lain.
- `relation`: `ayah` \| `ibu` \| `wali`.

### 4.2 Ajukan Hubungkan Anak

**`POST /children/requests`** · Auth: ya (role `wali_siswa`) · Rate limit 10x/menit · Halaman: Hubungkan Peserta Didik → "Kirim Pengajuan" · **sudah aktif**

Anak **tidak langsung terhubung**. Wali mengirim pengajuan, lalu admin sekolah memverifikasi dan menyetujui atau menolaknya.

```json
{
  "nik": "6471000000000001",
  "tanggal_lahir": "2018-05-10",
  "nisn": "0011223344",
  "hubungan": "IBU"
}
```

| Field | Aturan |
|---|---|
| `nik` | wajib, 16 digit |
| `tanggal_lahir` | wajib, `YYYY-MM-DD`, sebelum hari ini |
| `nisn` | opsional, 10 digit |
| `hubungan` | wajib, `AYAH` \| `IBU` \| `WALI` |

Response `201`:

```json
{
  "message": "Pengajuan berhasil dikirim dan menunggu verifikasi admin.",
  "data": {
    "id": "01K...",
    "nik": "6471000000000001",
    "tanggal_lahir": "2018-05-10",
    "nisn": "0011223344",
    "relationship": "Ibu",
    "status": "PENDING",
    "status_label": "Menunggu Verifikasi",
    "note": null,
    "submitted_at": "2026-11-02T10:00:00+00:00",
    "processed_at": null,
    "student": null
  }
}
```

Error `422` (key `errors.nik`):

- `Anak ini sudah terhubung dengan akun Anda.`
- `Pengajuan untuk anak ini masih menunggu verifikasi.`

Alur di frontend: form (NIK, tanggal lahir, NISN opsional, hubungan) → modal konfirmasi berisi ringkasan → `POST` → layar **Menunggu verifikasi admin** → daftar Status Pengajuan. Error `errors.nik` tampil di bawah kolom NIK.

> `submitted_at` / `processed_at` di contoh memakai offset `+00:00`. Frontend memformat dengan zona waktu perangkat, jadi offset apa pun aman, asalkan ISO 8601 lengkap (lihat [1.4](#14-tipe-data)).

### 4.3 Riwayat Pengajuan

**`GET /children/requests`** · Auth: ya (role `wali_siswa`) · Halaman: Hubungkan Peserta Didik → Status Pengajuan, Beranda (wali belum terhubung) · **sudah aktif**

Riwayat pengajuan milik akun, terbaru dulu. Item berbentuk sama seperti `data` di `POST`.

| Field | Keterangan |
|---|---|
| `status` | `PENDING` \| `APPROVED` \| `REJECTED` |
| `status_label` | teks siap tampil untuk label status (`Menunggu Verifikasi`, `Disetujui`, `Ditolak`) |
| `note` | alasan penolakan dari admin, terisi saat `REJECTED` |
| `student` | `{ "id", "name" }` **hanya** saat `APPROVED`, selain itu `null` |

- Backend sengaja tidak menampilkan data siswa sebelum disetujui, agar NIK + tanggal lahir tidak bisa dipakai menebak identitas anak. Karena itu kartu pengajuan menampilkan NIK yang disamarkan (`6471 •••• •••• 0001`), tanggal lahir, dan hubungan; nama anak baru tampil setelah `APPROVED`.
- Pengajuan `REJECTED` boleh diajukan ulang. Tombol **Ajukan Ulang** mengisi ulang form dengan data pengajuan tersebut.
- Beranda versi belum terhubung menampilkan pengajuan `PENDING` dan `REJECTED` (beserta `note`); `APPROVED` tidak perlu tampil di sana karena anaknya sudah muncul di `GET /children`.

### 4.4 Putuskan Hubungan *(opsional)*

**`DELETE /children/{studentId}`** · Auth: ya (role `wali_siswa`)

Response `200`: `{"message": "Hubungan dengan peserta didik dihapus.", "data": null}`. Belum ada tombolnya di UI.

---

## 5. Beranda

### 5.1 Ringkasan Beranda

**`GET /dashboard?student_id=`** · Auth: ya · Halaman: Beranda (versi peserta didik)

Response `200`:

```json
{
  "message": "OK",
  "data": {
    "student": {
      "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
      "name": "Naura Aulia Putri",
      "nickname": "Naura",
      "class_name": "XI IPA 2",
      "semester": { "id": "01...", "name": "Ganjil", "school_year": "2026/2027" },
      "photo_url": null
    },
    "unread_notifications_count": 3,
    "new_grades_count": 3,
    "attendance_rate": 96,
    "today": {
      "date": "2026-11-02",
      "is_school_day": true,
      "lessons": [
        {
          "id": "01...",
          "subject": { "id": "01...", "name": "Matematika Wajib" },
          "start_time": "07:30",
          "end_time": "09:00",
          "room": "Ruang 204"
        }
      ]
    }
  }
}
```

Dipakai untuk:

| Tampilan | Field |
|---|---|
| "Halo, Naura!" · "Kelas XI IPA 2 · Semester Ganjil" | `student.nickname`, `student.class_name`, `student.semester.name` |
| Titik merah lonceng (hanya jika wali punya satu anak) | `unread_notifications_count > 0` |
| Kartu Nilai "3 nilai baru" | `new_grades_count` = jumlah nilai yang terbit dalam **7 hari terakhir** |
| Kartu Absensi "Kehadiran 96%" | `attendance_rate` (bulat, 0–100, semester aktif) |
| Kartu Jadwal "6 mapel hari ini" | `today.lessons.length` |
| Jadwal Hari Ini (sedang berlangsung, progres, berikutnya) | `today.lessons` — **frontend** menghitung pelajaran yang sedang berjalan & progres dari jam perangkat |

`today.lessons` diurutkan berdasarkan `start_time`. Hari libur → `is_school_day: false`, `lessons: []`.

### 5.2 Berita Sekolah

**`GET /news`** · Auth: ya · **paginated** · Halaman: Beranda (kedua versi) → Berita Sekolah

Query:

| Query | Keterangan |
|---|---|
| `category` | opsional: `pengumuman` \| `kegiatan` \| `prestasi` (tanpa filter = "Semua") |
| `page`, `per_page` | Beranda memakai `per_page=3` |

Response `200`:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "category": "pengumuman",
      "title": "Libur Maulid Nabi dan jadwal masuk kembali",
      "summary": "Kegiatan belajar diliburkan pada ...",
      "cover_image_url": "https://...",
      "author": "Tata Usaha",
      "published_at": "2026-10-28T08:00:00+08:00"
    }
  ],
  "meta": { "current_page": 1, "per_page": 3, "total": 12, "last_page": 4 }
}
```

- Item pertama tampil sebagai kartu besar (pakai `cover_image_url`; jika `null` frontend memakai ilustrasi bawaan).
- Berita sebaiknya bisa difilter per sekolah/unit milik peserta didik; untuk wali belum terhubung tampilkan berita umum yayasan.

**`GET /news/{newsId}`** · Auth: ya · Halaman: Detail Berita (`/berita/:newsId`, dibuka dari ketukan kartu berita)

`data` sama dengan item `GET /news`, ditambah `content`:

```json
{ "message": "OK", "data": { "id": "01...", "category": "pengumuman", "title": "...", "summary": "...", "cover_image_url": null, "author": "Tata Usaha", "published_at": "2026-10-28T08:00:00+08:00", "content": "<p>...</p>" } }
```

- `content` berupa **HTML terbatas**: `p`, `h2`–`h4`, `ul`/`ol`/`li`, `strong`/`b`, `em`/`i`, `u`, `br`, `blockquote`, `a` (http/https/mailto/tel). Tag lain hanya ditampilkan isinya; `script`, `iframe`, `style`, dan sejenisnya dibuang. Teks tanpa tag ditampilkan per paragraf (dipisah baris kosong). Markdown **tidak** diproses.
- Berita tidak ada / tidak boleh dilihat → `404`.

### 5.3 Banner SPMB

**Tidak ada endpoint.** SPMB dikelola sistem terpisah, jadi backend PWA tidak menyediakan data SPMB.

Banner di Beranda (wali belum terhubung) memakai konfigurasi statis frontend:

| Variabel env | Contoh | Keterangan |
|---|---|---|
| `VITE_SPMB_SCHOOL_YEAR` | `2027/2028` | judul banner "SPMB {tahun ajaran}" |
| `VITE_SPMB_URL` | URL halaman pendaftaran | tombol "Daftar" membuka URL ini di tab baru. **Kosong → banner disembunyikan** |

---

## 6. Akademik

### 6.1 Daftar Semester

**`GET /semesters?student_id=`** · Auth: ya · Halaman: Akademik → pilihan semester (kanan atas)

```json
{
  "message": "OK",
  "data": [
    { "id": "01...", "name": "Ganjil", "school_year": "2026/2027", "is_active": true },
    { "id": "01...", "name": "Genap", "school_year": "2025/2026", "is_active": false }
  ]
}
```

Urutan terbaru dulu. Hanya semester saat peserta didik terdaftar.

### 6.2 Nilai Terbit

**`GET /grades/entries?student_id=&semester_id=`** · Auth: ya · Halaman: Akademik → tab Nilai

Nilai **diterbitkan oleh guru/sekolah** satu per satu. Setiap nilai yang terbit adalah satu *entry* dengan dua kemungkinan jenis:

1. **`score`** — nilai angka + keterangan
2. **`file`** — dokumen (PDF) yang dibuka di penampil PDF aplikasi

Hanya entry yang sudah diterbitkan yang dikirim. Frontend yang mengelompokkan per mapel (mode **Per Mapel**) dan per bulan (mode **Riwayat**).

Response `200`:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01KQ1...",
      "type": "score",
      "subject": {
        "id": "01...",
        "name": "Matematika Wajib",
        "teacher_name": "Pak Dimas R."
      },
      "assessment": "Ulangan Harian 2",
      "score": 96,
      "note": "Nilai tertinggi di kelas untuk materi limit.",
      "file": null,
      "published_at": "2026-10-30T14:10:00+08:00",
      "published_by": "Pak Dimas R."
    },
    {
      "id": "01KQ2...",
      "type": "file",
      "subject": {
        "id": "01...",
        "name": "Kimia",
        "teacher_name": "Pak Hendra P."
      },
      "assessment": "Praktikum Laju Reaksi",
      "score": null,
      "note": "Penilaian berupa rubrik praktikum.",
      "file": {
        "name": "Lembar Penilaian Praktikum.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 3798,
        "page_count": 2,
        "url": "https://files.example.com/...signed...",
        "expires_at": "2026-11-02T10:30:00+08:00"
      },
      "published_at": "2026-10-31T09:00:00+08:00",
      "published_by": "Pak Hendra P."
    }
  ]
}
```

| Field | Keterangan |
|---|---|
| `type` | `score` \| `file` |
| `score` | wajib jika `type = score`, `null` jika `file` |
| `note` | keterangan guru, opsional pada kedua jenis |
| `file` | wajib jika `type = file` (lihat [1.7](#17-file)) |
| `published_by` | sama dengan guru penilaian; **tidak dipakai** frontend (tidak ada proses "terbit") |

> **Sementara:** backend belum punya status draft/terbit nilai. `published_at` diisi **waktu nilai diinput guru**, dan semua nilai yang sudah diinput dianggap terbit. Label "Baru" ([6.3](#63-label-baru)) ikut memakai waktu input ini.

> **Yang ditampilkan frontend menyesuaikan data backend saat ini:**
> - Tidak ada teks "Terbit"/"Diterbitkan oleh"; tanggal ditampilkan apa adanya (waktu input).
> - `score` boleh `null` (penilaian file / hanya keterangan) dan tidak ditampilkan sebagai 0. Baris tanpa `score`, `file`, dan `note` (belum diisi guru) disembunyikan.
> - File nilai bisa PDF atau JPG. PDF dibuka di penampil aplikasi, selain itu dibuka langsung di browser. Nama file hasil unggah acak, jadi frontend menampilkan "Lembar penilaian" + jenis & ukuran file; `page_count` saat ini selalu `null`.
> - `score` tetap ditampilkan bila entry `file` juga punya angka.

> KKM belum tersedia di backend, jadi frontend tidak menampilkan label KKM. Bila nanti ditambahkan, kirim sebagai `subject.passing_score`.

Urutan: `published_at` terbaru dulu. Daftar mapel di mode Per Mapel mengikuti urutan `GET /subjects`.

> Jika jumlah entry per semester bisa sangat besar (>200), tambahkan pagination; untuk saat ini satu semester dikirim sekaligus.

### 6.3 Label "Baru"

Tidak ada status "sudah dilihat" yang disimpan di backend. Label **Baru** dihitung frontend dari `published_at`: entry yang terbit dalam **7 hari terakhir** diberi label Baru. Backend cukup mengirim data nilai apa adanya.

### 6.4 Mata Pelajaran

**`GET /subjects?student_id=&semester_id=`** · Auth: ya · Halaman: Akademik → tab Mapel

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "name": "Matematika Wajib",
      "teacher_name": "Pak Dimas R.",
      "hours_per_week": 6
    }
  ]
}
```

Frontend menampilkan "8 mata pelajaran · 34 jam pelajaran per minggu" dari jumlah item dan total `hours_per_week` (JP).

### 6.5 Kelas

**`GET /classroom?student_id=&semester_id=`** · Auth: ya · Halaman: Akademik → tab Kelas

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
    "name": "XI IPA 2",
    "grade_level": "XI",
    "room": "Ruang 204",
    "location": "Gedung B, Lantai 2",
    "homeroom_teacher": "Ibu Sari W.",
    "student_count": 32,
    "classmates_preview": [
      { "id": "01...", "name": "Rafi Aditya", "initials": "RA" },
      { "id": "01...", "name": "Dinda Puspita", "initials": "DP" },
      { "id": "01...", "name": "Fauzan Zaki", "initials": "FZ" },
      { "id": "01...", "name": "Maya Kirana", "initials": "MK" }
    ]
  }
}
```

- `classmates_preview` berisi maks. 4 teman sekelas (tanpa peserta didik itu sendiri) untuk tumpukan avatar.

**`GET /classroom/students?student_id=&semester_id=`** · Auth: ya · Halaman: Akademik → Kelas → "Lihat 32 siswa"

Daftar **nama lengkap** seluruh teman sekelas, urut abjad:

```json
{
  "message": "OK",
  "data": [
    { "id": "01...", "name": "Dinda Puspita", "initials": "DP", "photo_url": null },
    { "id": "01...", "name": "Fauzan Zaki", "initials": "FZ", "photo_url": null }
  ]
}
```

Hanya nama, inisial, dan foto. **Jangan** kirim NIS, tanggal lahir, kontak, atau data pribadi lain.

### 6.6 Jadwal Pelajaran

**`GET /schedule?student_id=&week_start=`** · Auth: ya · Halaman: Akademik → tab Kelas (pemilih hari Sen–Jum)

| Query | Keterangan |
|---|---|
| `week_start` | `YYYY-MM-DD` hari Senin. Kosong = minggu berjalan |

```json
{
  "message": "OK",
  "data": {
    "week_start": "2026-11-02",
    "days": [
      {
        "date": "2026-11-02",
        "day_of_week": 1,
        "is_school_day": true,
        "holiday_name": null,
        "lessons": [
          {
            "id": "01...",
            "subject": { "id": "01...", "name": "Matematika Wajib" },
            "teacher_name": "Pak Dimas R.",
            "start_time": "07:30",
            "end_time": "09:00",
            "room": "Ruang 204"
          }
        ]
      }
    ]
  }
}
```

- `day_of_week`: 1 = Senin ... 7 = Minggu. Kirim Senin–Jumat, plus Sabtu jika sekolah masuk Sabtu.
- Hari libur: `is_school_day: false`, isi `holiday_name`.

---

## 7. Absensi

### 7.1 Absensi Hari Ini

**`GET /attendance/today?student_id=`** · Auth: ya · Halaman: Absensi → kartu hitam

```json
{
  "message": "OK",
  "data": {
    "date": "2026-11-02",
    "is_school_day": true,
    "status": "hadir",
    "check_in_at": "2026-11-02T06:52:00+08:00",
    "check_out_at": null,
    "punctuality": "tepat_waktu"
  }
}
```

| Field | Keterangan |
|---|---|
| `status` | `null` (belum ada catatan) \| `hadir` \| `izin` \| `sakit` \| `alfa` |
| `check_in_at` / `check_out_at` | "Jam Masuk" / "Jam Pulang"; `null` → `--.--` |
| `punctuality` | `tepat_waktu` \| `terlambat` \| `null` → teks "Tercatat · Tepat Waktu" |

### 7.2 Sumber Data Absensi

Absensi **dicatat oleh guru di sistem terpisah**. Aplikasi ini **hanya membaca**; tidak ada absen mandiri dari aplikasi. Endpoint absensi di dokumen ini mengambil data dari sistem tersebut. Jika sinkronisasi tertunda, `status` boleh `null` dan frontend menampilkan "Belum ada catatan hari ini".

### 7.3 Rekap Semester

**`GET /attendance/summary?student_id=&semester_id=`** · Auth: ya · Halaman: Absensi → 4 kotak rekap

```json
{
  "message": "OK",
  "data": {
    "hadir": 82,
    "izin": 2,
    "sakit": 1,
    "alfa": 0,
    "attendance_rate": 96
  }
}
```

`attendance_rate` = persentase hadir dari total hari sekolah yang sudah berjalan (pembulatan ke bawah), dipakai juga di Beranda.

### 7.4 Kalender Bulanan

**`GET /attendance/calendar?student_id=&month=`** · Auth: ya · Halaman: Absensi → kalender (tombol bulan sebelumnya/berikutnya)

| Query | Keterangan |
|---|---|
| `month` | `YYYY-MM`, wajib |

```json
{
  "message": "OK",
  "data": {
    "month": "2026-10",
    "days": [
      { "date": "2026-10-01", "status": "hadir" },
      { "date": "2026-10-14", "status": "izin" },
      { "date": "2026-10-21", "status": "sakit" }
    ],
    "holidays": [
      { "date": "2026-10-28", "name": "Hari Sumpah Pemuda (kegiatan sekolah)" }
    ]
  }
}
```

- Kirim hanya tanggal yang punya catatan. Tanggal tanpa catatan dan akhir pekan ditampilkan abu-abu oleh frontend.
- `holidays` opsional, untuk membedakan libur sekolah dari hari tanpa catatan.

### 7.5 Riwayat Absensi

**`GET /attendance?student_id=`** · Auth: ya · **paginated** · Halaman: Absensi → Riwayat Terbaru (`per_page=3`)

Query yang sudah aktif tetap berlaku: `start_date`, `end_date`, `status`.

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "date": "2026-10-30",
      "status": "hadir",
      "check_in_at": "2026-10-30T06:48:00+08:00",
      "check_out_at": "2026-10-30T15:05:00+08:00",
      "note": null,
      "attachment": null
    },
    {
      "id": "01...",
      "date": "2026-10-21",
      "status": "sakit",
      "check_in_at": null,
      "check_out_at": null,
      "note": "Surat dokter terlampir",
      "attachment": { "name": "surat-dokter.pdf", "mime_type": "application/pdf", "size_bytes": 120394, "page_count": 1, "url": "https://...", "expires_at": "..." }
    }
  ],
  "meta": { "current_page": 1, "per_page": 3, "total": 85, "last_page": 29 }
}
```

Urutan tanggal terbaru dulu. Status per **hari** (bukan per mata pelajaran).

### 7.6 Ajukan Izin

Alur: **orang tua/wali mengajukan** dari aplikasi → **wali kelas menyetujui atau menolak** (di sistem guru) → jika disetujui, absensi pada tanggal tersebut otomatis tercatat `izin`/`sakit` → wali menerima notifikasi `leave_request`.

**`POST /attendance/leave-requests`** · Auth: ya (role `wali_siswa`) · `multipart/form-data` · Halaman: Absensi → "Ajukan Izin"

| Field | Tipe | Aturan |
|---|---|---|
| `student_id` | string | wajib |
| `type` | string | `izin` \| `sakit` |
| `start_date` | date | wajib, ≥ hari ini |
| `end_date` | date | wajib, ≥ `start_date` |
| `reason` | string | wajib, 5–500 karakter |
| `attachment` | file | opsional, PDF/JPG/PNG maks 5 MB (mis. surat dokter) |

Response `201`:

```json
{
  "message": "Pengajuan izin terkirim ke wali kelas.",
  "data": {
    "id": "01...",
    "type": "sakit",
    "start_date": "2026-11-03",
    "end_date": "2026-11-04",
    "reason": "Demam, istirahat di rumah.",
    "attachment": null,
    "status": "menunggu",
    "reviewed_by": null,
    "reviewed_at": null,
    "review_note": null,
    "created_at": "2026-11-02T19:20:00+08:00"
  }
}
```

| Field | Keterangan |
|---|---|
| `status` | `menunggu` \| `disetujui` \| `ditolak` |
| `reviewed_by` | nama wali kelas yang memproses |
| `review_note` | catatan wali kelas (terutama saat ditolak) |

Alur di frontend: form → validasi lokal → **modal konfirmasi** berisi ringkasan (jenis, tanggal, nama lampiran) → `POST` → layar sukses dengan status "Menunggu persetujuan". Tanggal di masa lalu tidak bisa dipilih.

Error:

| Status | Kapan | Key / contoh pesan |
|---|---|---|
| `422` | validasi | `errors.type`, `errors.start_date`, `errors.end_date`, `errors.reason`, `errors.attachment` (mis. `Ukuran file maksimal 5 MB.`) |
| `409` | sudah ada pengajuan `menunggu`/`disetujui` yang tanggalnya bertumpuk | `Sudah ada pengajuan izin pada tanggal tersebut.` |
| `403` | `student_id` bukan anak akun ini | — |

**`GET /attendance/leave-requests?student_id=`** · paginated · Halaman: Absensi → bagian **Pengajuan Izin**

Riwayat pengajuan, urut `created_at` terbaru. Item berbentuk sama dengan `data` response `POST` di atas.

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "type": "izin",
      "start_date": "2026-10-14",
      "end_date": "2026-10-14",
      "reason": "Lomba tahfiz tingkat kota.",
      "attachment": null,
      "status": "disetujui",
      "reviewed_by": "Ibu Sari Wulandari",
      "reviewed_at": "2026-10-13T14:05:00+08:00",
      "review_note": "Semoga lancar lombanya.",
      "created_at": "2026-10-13T08:10:00+08:00"
    }
  ],
  "meta": { "current_page": 1, "per_page": 20, "total": 3, "last_page": 1 }
}
```

| Tampilan per kartu | Field |
|---|---|
| "Izin · 14 Okt 2026" (rentang bila lebih dari 1 hari) | `type`, `start_date`, `end_date` |
| Teks alasan | `reason` |
| Label Menunggu / Disetujui / Ditolak | `status` |
| Kotak "Wali kelas: …" (hanya bila ada) | `review_note` |
| Tombol **Batalkan Pengajuan** (hanya `menunggu`) | `status` |

`attachment` memakai objek file [1.7](#17-file) (atau `null`).

**`DELETE /attendance/leave-requests/{id}`** · Halaman: Absensi → Batalkan Pengajuan (setelah modal konfirmasi)

- hanya untuk status `menunggu`; selain itu → `409` `Pengajuan yang sudah diproses tidak bisa dibatalkan.`
- pengajuan milik anak lain / akun lain → `403`
- Response `200`: `{"message": "Pengajuan izin dibatalkan.", "data": null}`. Frontend menghapus kartu dari daftar dan menampilkan toast.
- disarankan soft delete (status `dibatalkan`) agar wali kelas tetap melihat jejaknya; `GET` untuk wali **tidak** menampilkan yang dibatalkan

---

## 8. Profil & Pengaturan

### 8.1 Profil Peserta Didik

**`GET /me?student_id=`** · Auth: ya · Halaman: Profil

> **Status:** `GET /me` lama **sudah digabung** ke `GET /auth/me`. Untuk halaman Profil, backend akan menyediakan ulang `GET /me?student_id=` khusus sebagai **profil peserta didik** (bukan akun login). `student_id` mengikuti aturan [1.5](#15-konteks-peserta-didik-student_id).

Field yang dibutuhkan UI:

```json
{
  "message": "OK",
  "data": {
    "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
    "nama_lengkap": "Naura Aulia Putri",
    "nama_panggilan": "Naura",
    "nis": "2024017",
    "nisn": "0101234567",
    "kelas": "XI IPA 2",
    "status_aktif": true,
    "tempat_lahir": "Jakarta",
    "tanggal_lahir": "2010-05-14",
    "jenis_kelamin": "perempuan",
    "email": "naura.aulia@bis.sch.id",
    "no_hp": "0812-xxxx-2210",
    "wali_kelas": "Ibu Sari Wulandari",
    "foto_url": null
  }
}
```

| Tampilan | Field |
|---|---|
| Kartu profil: nama, "NIS 2024017 · XI IPA 2", label "Siswa Aktif" | `nama_lengkap`, `nis`, `kelas`, `status_aktif` |
| Data Pribadi: Tempat, tgl lahir | `tempat_lahir`, `tanggal_lahir` |
| Jenis kelamin | `jenis_kelamin`: `laki-laki` \| `perempuan` |
| Email, No. HP | `email`, `no_hp` (**sudah disamarkan** oleh backend) |
| Wali kelas | `wali_kelas` |

Semua field di atas perlu ada di `GET /me?student_id=` yang baru.

### 8.2 Preferensi Notifikasi

**`GET /me/preferences`** dan **`PATCH /me/preferences`** · Auth: ya · Halaman: Profil → sakelar Notifikasi

```json
{
  "message": "OK",
  "data": {
    "push_notifications": true
  }
}
```

`PATCH` body: `{"push_notifications": false}` → response sama, dengan `message` `Notifikasi dimatikan.` / `Notifikasi diaktifkan.` untuk toast. Disimpan per akun.

Frontend mengubah sakelar langsung (optimistic). Jika `PATCH` gagal, sakelar dikembalikan dan `message` error tampil sebagai toast merah.

> Pengiriman push notification ke perangkat (Web Push) butuh endpoint pendaftaran perangkat, mis. `POST /push-subscriptions` dengan objek `PushSubscription` dari browser. Belum dibutuhkan untuk tahap UI ini.

### 8.3 Data Orang Tua / Wali

**`GET /me/guardians?student_id=`** · Auth: ya · Halaman: Profil → Data Orang Tua / Wali (halaman belum dibuat)

```json
{
  "message": "OK",
  "data": [
    {
      "relation": "ibu",
      "name": "Aisyah Rahma",
      "phone": "0813-xxxx-1120",
      "email": "wali@example.com",
      "has_app_account": true
    }
  ]
}
```

### 8.4 Edit Profil

Halaman `/profil/edit` berisi kolom **Nama Wali** (bisa diubah) dan **Email** (terkunci).

Tombol "Ubah" di kartu Akun Orang Tua / Wali (Profil) membuka form **ubah nama wali** → `PATCH /auth/me` ([3.6](#36-ubah-nama-wali)). Data lain tidak bisa diubah dari aplikasi.

### 8.5 Pusat Bantuan

Menu "Pusat Bantuan" cukup membuka konten statis atau tautan WhatsApp/telepon Tata Usaha. Tidak butuh endpoint kecuali konten ingin dikelola dari admin; jika ya: `GET /app/help` berisi kontak Tata Usaha dan daftar FAQ.

---

## 9. Notifikasi

### 9.1 Daftar Notifikasi

**`GET /notifications`** · Auth: ya · **paginated** · Halaman: Notifikasi (ikon lonceng)

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "type": "grade_published",
      "title": "Nilai baru: Matematika Wajib",
      "body": "Ulangan Harian 2 sudah diterbitkan.",
      "student_id": "01KPCSPKA4RKT8J3BCCP7QXW14",
      "target": { "page": "akademik", "params": { "tab": "nilai" } },
      "is_read": false,
      "created_at": "2026-10-30T14:10:00+08:00"
    }
  ],
  "meta": { "current_page": 1, "per_page": 20, "total": 9, "last_page": 1, "unread_count": 3 }
}
```

- `type`: `grade_published` \| `attendance` \| `announcement` \| `leave_request` \| `payment`
- `target` memberi tahu frontend halaman tujuan saat notifikasi diketuk (frontend yang mengubahnya jadi URL).
- Untuk wali dengan beberapa anak, sertakan `student_id` agar frontend bisa mengganti anak aktif sebelum membuka halaman.

### 9.2 Tandai Dibaca

- **`POST /notifications/{notificationId}/read`** — satu notifikasi
- **`POST /notifications/read-all`** — semua notifikasi akun

Response `200`: `{"message": "OK", "data": {"unread_count": 0}}`.

---

## 10. Pembayaran (ditunda)

Fitur pembayaran **disembunyikan** di aplikasi (`features.payments = false` di `src/config/app.ts`). Kontrak berikut disiapkan agar desainnya tidak hilang, tetapi **belum perlu dibangun**.

| Method | Path | Fungsi |
|---|---|---|
| GET | `/bills?student_id=&status=unpaid` | Tagihan aktif + `total_amount`, `nearest_due_date` (kartu "Total Tagihan Aktif") |
| GET | `/bills?student_id=&status=paid` | Riwayat tagihan lunas |
| GET | `/payment-methods` | Metode: `virtual_account` \| `qris` \| `cash` |
| POST | `/bills/{billId}/payments` | Body `{ "method": "virtual_account" }` → nomor VA / payload QRIS + `expires_at` |
| POST | `/bills/payments` | Bayar semua: `{ "bill_ids": [...], "method": "..." }` |
| GET | `/payments/{paymentId}/receipt` | Kuitansi (objek file PDF, lihat [1.7](#17-file)) |

Item tagihan:

```json
{
  "id": "01...",
  "title": "SPP November 2026",
  "amount": 750000,
  "due_date": "2026-11-10",
  "status": "unpaid",
  "paid_at": null,
  "payment_method": null
}
```

Nominal dalam rupiah, integer (tanpa desimal).

---

## 11. Perubahan terhadap Endpoint Aktif

| Endpoint aktif | Perubahan yang dibutuhkan | Sifat |
|---|---|---|
| `POST /auth/login` | identitas login `email` (bukan `username`) | **breaking** — dukung keduanya selama transisi |
| `POST /auth/login` | tolak akun selain `wali_siswa`: `422` `Akun ini bukan akun wali siswa.` | **sudah aktif** |
| `GET /auth/me` | tambah `has_password`, `linked_students_count`, `avatar_url`; hapus `peserta_didik`; `role` selalu `wali_siswa` | tambahan |
| `POST /children/requests`, `GET /children/requests` | alur hubungkan anak lewat approval admin ([4.2](#42-ajukan-hubungkan-anak)) | **sudah aktif** |
| `GET /children` | hanya anak yang disetujui admin; tambah `relation`, `school`, `photo_url` | tambahan |
| `GET /dashboard` | bentuk baru: `unread_notifications_count`, `new_grades_count`, `attendance_rate`, `today.lessons`. Hapus `latest_report`, `school_alert`, `agendas`, `news` | **breaking** |
| `GET /schedule` | dikelompokkan per hari (`days[].lessons[]`), `subject` jadi objek, tambah `is_school_day` | **breaking** |
| `GET /attendance` | status huruf kecil, tambah `check_in_at`, `check_out_at`, `attachment`, pagination | **breaking** |
| `GET /attendance/summary` | tambah `attendance_rate` | tambahan |
| `GET /grades` | **tidak dipakai UI baru**, diganti `GET /grades/entries` | tetap boleh ada |
| `GET /me` | lama **sudah digabung** ke `GET /auth/me`. Disediakan ulang sebagai `GET /me?student_id=` = profil peserta didik ([8.1](#81-profil-peserta-didik)) | baru (nama lama) |
| `GET /reports`, `GET /reports/{id}` | **sudah dihapus**. Rapor diganti nilai yang diinput guru (`GET /grades/entries`) | dihapus |

Endpoint baru yang belum ada: `/auth/google`, `/auth/password`, `PATCH /auth/me`, `GET /me?student_id=`, `/news`, `/semesters`, `/grades/entries`, `/subjects`, `/classroom`, `/classroom/students`, `/attendance/today`, `/attendance/calendar`, `/attendance/leave-requests`, `/me/preferences`, `/me/guardians`, `/notifications/read-all`.

Tidak dibuat di backend ini: `GET /spmb/active` (SPMB punya sistem terpisah, [5.3](#53-banner-spmb)). Dihapus dari rencana: `POST /children/lookup`, `lookup_token`, `POST /children` (diganti pengajuan ke admin).

---

## 12. Urutan Implementasi

Urutan yang disarankan agar frontend bisa beralih dari data dummy secara bertahap:

| Prioritas | Endpoint | Membuka halaman |
|---|---|---|
| P0 | `POST /auth/login` (email), `GET /auth/me`, `POST /auth/logout` | Login & sesi |
| P0 | `GET /children`, `POST /children/requests` & `GET /children/requests` (sudah aktif) | Alur wali & Hubungkan Peserta Didik |
| P0 | `GET /dashboard`, `GET /news` | Beranda |
| P1 | `GET /semesters`, `GET /grades/entries` | Akademik → Nilai |
| P1 | `GET /subjects`, `GET /classroom`, `GET /classroom/students`, `GET /schedule` | Akademik → Mapel & Kelas |
| P1 | `GET /attendance/today`, `GET /attendance/summary`, `GET /attendance/calendar`, `GET /attendance` | Absensi |
| P1 | `GET /me?student_id=` (profil peserta didik) | Profil |
| P2 | `GET /notifications`, read, read-all | Notifikasi |
| P2 | `PUT /auth/password`, `PATCH /auth/me`, `/me/preferences` | Kata Sandi, Edit Profil, sakelar Notifikasi (UI sudah siap) |
| P2 | `POST /auth/google` | Login Google |
| P2 | `POST`, `GET`, `DELETE /attendance/leave-requests` | Ajukan Izin & daftar Pengajuan Izin (UI sudah siap) |
| P3 | `/me/guardians` | Profil → Data Orang Tua / Wali |
| Ditunda | Pembayaran | — |

---

## 13. Keputusan Produk

Keputusan yang sudah diambil dan menjadi dasar kontrak di atas:

| # | Topik | Keputusan | Bagian |
|---|---|---|---|
| 1 | Login Google, email belum terdaftar | Otomatis dibuatkan akun `wali_siswa` | [3.2](#32-login-dengan-google) |
| 2 | Absen dari aplikasi | Tidak ada. Absensi dicatat guru di sistem terpisah; aplikasi hanya menampilkan | [7.2](#72-sumber-data-absensi) |
| 3 | Ajukan Izin | Diajukan orang tua/wali, disetujui/ditolak wali kelas | [7.6](#76-ajukan-izin) |
| 4 | Teman sekelas | Nama lengkap boleh ditampilkan (tanpa data pribadi lain) | [6.5](#65-kelas) |
| 5 | Edit profil & kata sandi | Hanya nama wali yang bisa diubah. Akun Google bisa menambahkan kata sandi | [3.5](#35-ubah--buat-kata-sandi), [3.6](#36-ubah-nama-wali) |
| 6 | Wali dengan beberapa anak | Beranda menampilkan satu anak; tombol notifikasi diganti tombol Ganti Profil Anak | [4.1](#41-daftar-anak-terhubung) |
| 7 | Label "Baru" pada nilai | Tidak disimpan; dihitung dari `published_at` (7 hari terakhir) | [6.3](#63-label-baru) |
| 8 | Hubungkan anak | Lewat pengajuan yang diverifikasi admin (NIK + tanggal lahir), bukan langsung terhubung | [4.2](#42-ajukan-hubungkan-anak) |
| 9 | SPMB | Tidak dibuat di backend ini; banner memakai konfigurasi statis frontend | [5.3](#53-banner-spmb) |
| 10 | Siapa yang login ke PWA | Hanya `wali_siswa`. Siswa dan role lain ditolak `422` | [1.5](#15-konteks-peserta-didik-student_id), [3.1](#31-login-dengan-email) |
| 11 | Login Google | Hanya untuk wali; email dengan role lain ditolak | [3.2](#32-login-dengan-google) |
| 12 | Rapor & `GET /me` lama | `/reports` dihapus; `GET /me` lama digabung ke `/auth/me`, disediakan ulang sebagai profil peserta didik | [11](#11-perubahan-terhadap-endpoint-aktif) |
| 13 | Nilai terbit | Belum ada status draft; `published_at` = waktu input guru | [6.2](#62-nilai-terbit) |
