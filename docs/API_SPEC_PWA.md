# API SPEC PWA

Dokumen ini adalah kontrak API antara frontend PWA BIS dan backend. Setiap endpoint diturunkan langsung dari data yang tampil di halaman frontend (desain `.temp/ui.html`).

- **Status:** target yang perlu dibangun backend
- **Endpoint yang sudah aktif:** tercatat di `API_USAGE.md`; perbedaannya dengan dokumen ini dirangkum di [bagian 11](#11-perubahan-terhadap-endpoint-aktif)
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

- **Role `siswa`:** `student_id` boleh dikosongkan; backend memakai peserta didik milik akun. Jika diisi dengan ID lain → `403`.
- **Role `wali_siswa`:** `student_id` **wajib**, harus salah satu anak dari `GET /children`. Jika tidak terhubung → `403`.

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
| Kirim pengajuan izin | `POST /attendance/leave-requests` | `Pengajuan izin terkirim ke wali kelas.` |
| Batalkan pengajuan izin | `DELETE /attendance/leave-requests/{id}` | `Pengajuan izin dibatalkan.` |
| Ubah nama wali | `PATCH /auth/me` | `Nama wali tersimpan.` |
| Ubah / buat kata sandi | `PUT /auth/password` | `Kata sandi tersimpan.` |
| Sakelar notifikasi | `PATCH /me/preferences` | `Notifikasi diaktifkan.` / `Notifikasi dimatikan.` |
| Keluar | `POST /auth/logout` | `Logout berhasil.` |

**Konfirmasi dilakukan di frontend.** Aksi berikut sudah melewati modal konfirmasi sebelum request dikirim, jadi backend tidak perlu langkah konfirmasi tambahan (mis. token konfirmasi): Keluar, Kirim pengajuan izin, Batalkan pengajuan izin. Menghubungkan anak sudah punya langkah konfirmasi sendiri (`lookup_token`, [4.2](#42-cari-peserta-didik-langkah-1)).

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
| Beranda (wali belum terhubung) — banner SPMB | `GET /spmb/active` |
| Hubungkan Peserta Didik | `POST /children/lookup`, `POST /children` |
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
| Profil — kartu & Data Pribadi | `GET /me` |
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
- `429` — terlalu banyak percobaan (disarankan 5x/menit per email + IP)

> **Transisi:** selama migrasi, backend boleh tetap menerima `username` sebagai alternatif `email`.

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

Aturan pendaftaran otomatis:

- Email Google **sudah terdaftar** → masuk ke akun tersebut (role apa pun). `is_new_account: false`.
- Email Google **belum terdaftar** → backend **otomatis membuat akun** role `wali_siswa` dengan `name` dan `avatar_url` dari profil Google, `has_password: false`, belum terhubung ke anak mana pun. `is_new_account: true`. Frontend lalu menampilkan Beranda versi belum terhubung.
- Akun yang dibuat lewat Google bisa **menambahkan kata sandi** lewat `PUT /auth/password` ([3.5](#35-ubah--buat-kata-sandi)), sehingga tetap bisa masuk dengan email + kata sandi jika Google tidak bisa dipakai.

Error:

- `401` — `id_token` tidak valid / kedaluwarsa
- `422` — email Google belum diverifikasi (`email_verified = false`)

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
    "linked_students_count": 0,
    "peserta_didik": null
  }
}
```

| Field | Keterangan |
|---|---|
| `name`, `email` | ditampilkan di kartu **Akun Orang Tua / Wali** di Profil; `email` tampil terkunci di form Edit Profil |
| `role` | `siswa` \| `wali_siswa` |
| `has_password` | `false` jika akun dibuat lewat Google dan belum punya kata sandi → menu Profil tampil sebagai **Buat Kata Sandi** (tanpa kolom kata sandi lama) |
| `linked_students_count` | wali: jumlah anak terhubung. `0` → **Beranda versi belum terhubung**; `> 1` → tombol notifikasi di Beranda diganti tombol **Ganti Profil Anak** |
| `peserta_didik` | role `siswa`: ringkasan peserta didik miliknya (bentuk seperti item `GET /children`). Role `wali_siswa`: `null` |

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
- Role `siswa` → `403` (nama siswa mengikuti data induk sekolah)

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

- Array kosong `[]` → tampilkan Beranda versi "belum ada peserta didik".
- Beranda hanya menampilkan **satu anak** dalam satu waktu. Lebih dari satu anak → tombol notifikasi di header Beranda diganti tombol **Ganti Profil Anak**, yang membuka daftar dari endpoint ini. Pilihan anak aktif disimpan di perangkat dan dikirim sebagai `student_id` ke endpoint lain.
- `relation`: `ayah` \| `ibu` \| `wali`.

### 4.2 Cari Peserta Didik (Langkah 1)

**`POST /children/lookup`** · Auth: ya (role `wali_siswa`) · Halaman: Hubungkan Peserta Didik → "Cari Peserta Didik"

Request:

```json
{
  "identity": "2024017",
  "birth_date": "2010-05-14"
}
```

| Field | Tipe | Aturan |
|---|---|---|
| `identity` | string | wajib, 5–10 digit angka. Dicocokkan ke **NIS atau NISN** |
| `birth_date` | date | wajib, harus cocok dengan tanggal lahir peserta didik |

Response `200` — dipakai untuk layar konfirmasi "Apakah ini anak Anda?":

```json
{
  "message": "OK",
  "data": {
    "lookup_token": "lk_01KQ...",
    "expires_at": "2026-11-02T10:25:00+08:00",
    "student": {
      "name": "Naura Aulia Putri",
      "nis": "2024017",
      "class_name": "XI IPA 2",
      "school_name": "SMA Islam Balikpapan",
      "birth_date": "2010-05-14",
      "homeroom_teacher": "Ibu Sari Wulandari",
      "photo_url": null
    }
  }
}
```

Error:

- `404` — `{"message": "Data tidak ditemukan. Pastikan NIS/NISN dan tanggal lahir sesuai data di sekolah."}`. **Jangan** bedakan antara "NIS tidak ada" dan "tanggal lahir salah" (mencegah penebakan data).
- `409` — peserta didik sudah terhubung dengan akun ini.
- `429` — batasi percobaan, disarankan 5x per 10 menit per akun.

> `lookup_token` mengikat hasil pencarian ke akun yang mencari, berlaku ±10 menit, dan hanya bisa dipakai sekali.

### 4.3 Hubungkan Peserta Didik (Langkah 2)

**`POST /children`** · Auth: ya (role `wali_siswa`) · Halaman: Hubungkan Peserta Didik → "Ya, Hubungkan"

```json
{
  "lookup_token": "lk_01KQ...",
  "relation": "ibu"
}
```

Response `201`: satu item dengan bentuk sama seperti `GET /children`.

Error: `422` jika `lookup_token` tidak valid/kedaluwarsa (frontend kembali ke langkah 1), `409` jika sudah terhubung.

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
| Titik merah lonceng (hanya jika wali punya satu anak / role siswa) | `unread_notifications_count > 0` |
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

**`GET /news/{newsId}`** — detail berita (`content` dalam HTML terbatas/Markdown) untuk tombol "Lihat semua" dan ketukan kartu. Halaman detail belum dibuat di frontend.

### 5.3 Banner SPMB

**`GET /spmb/active`** · Auth: ya · Halaman: Beranda (wali belum terhubung)

Response `200` jika ada pendaftaran yang dibuka:

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
    "school_year": "2027/2028",
    "registration_url": "https://spmb.bis.sch.id/daftar"
  }
}
```

Jika tidak ada pendaftaran aktif → `data: null`, dan banner disembunyikan. UI hanya menampilkan judul "SPMB {school_year}" dan tombol "Daftar" yang membuka `registration_url`.

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
        "teacher_name": "Pak Dimas R.",
        "passing_score": 75
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
        "teacher_name": "Pak Hendra P.",
        "passing_score": 75
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
| `subject.passing_score` | KKM mapel. Frontend menandai skor di bawahnya ("< KKM 75") |
| `published_by` | nama guru/penerbit untuk "Diterbitkan oleh ..." |

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

Role `siswa` → `403` (tombol Ajukan Izin hanya untuk wali).

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
| `403` | role `siswa`, atau `student_id` bukan anak akun ini | — |

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

Endpoint ini sudah aktif (lihat `API_USAGE.md`). Field yang dibutuhkan UI baru:

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

Tambahan dari endpoint aktif: `nis`, `kelas`, `email`, `no_hp`, `wali_kelas`, `foto_url`. Untuk wali, `student_id` wajib.

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
| `GET /auth/me` | tambah `has_password`, `linked_students_count`, `avatar_url` | tambahan |
| `GET /children` | tambah `relation`, `school`, `photo_url` | tambahan |
| `GET /dashboard` | bentuk baru: `unread_notifications_count`, `new_grades_count`, `attendance_rate`, `today.lessons`. Hapus `latest_report`, `school_alert`, `agendas`, `news` | **breaking** |
| `GET /schedule` | dikelompokkan per hari (`days[].lessons[]`), `subject` jadi objek, tambah `is_school_day` | **breaking** |
| `GET /attendance` | status huruf kecil, tambah `check_in_at`, `check_out_at`, `attachment`, pagination | **breaking** |
| `GET /attendance/summary` | tambah `attendance_rate` | tambahan |
| `GET /grades` | **tidak dipakai UI baru**, diganti `GET /grades/entries` | tetap boleh ada |
| `GET /me` | tambah `nis`, `kelas`, `email`, `no_hp`, `wali_kelas`, `foto_url`; dukung `student_id` | tambahan |
| `GET /reports`, `GET /reports/{id}` | halaman Rapor tidak ditampilkan di menu; endpoint aktif tetap dipertahankan apa adanya | tidak berubah |

Endpoint baru: `/auth/google`, `/auth/password`, `PATCH /auth/me`, `/children/lookup`, `POST /children`, `/news`, `/spmb/active`, `/semesters`, `/grades/entries`, `/subjects`, `/classroom`, `/classroom/students`, `/attendance/today`, `/attendance/calendar`, `/attendance/leave-requests`, `/me/preferences`, `/me/guardians`, `/notifications/read-all`.

---

## 12. Urutan Implementasi

Urutan yang disarankan agar frontend bisa beralih dari data dummy secara bertahap:

| Prioritas | Endpoint | Membuka halaman |
|---|---|---|
| P0 | `POST /auth/login` (email), `GET /auth/me`, `POST /auth/logout` | Login & sesi |
| P0 | `GET /children`, `POST /children/lookup`, `POST /children` | Alur wali & Hubungkan Peserta Didik |
| P0 | `GET /dashboard`, `GET /news` | Beranda |
| P1 | `GET /semesters`, `GET /grades/entries` | Akademik → Nilai |
| P1 | `GET /subjects`, `GET /classroom`, `GET /classroom/students`, `GET /schedule` | Akademik → Mapel & Kelas |
| P1 | `GET /attendance/today`, `GET /attendance/summary`, `GET /attendance/calendar`, `GET /attendance` | Absensi |
| P1 | `GET /me` (field baru) | Profil |
| P2 | `GET /notifications`, read, read-all | Notifikasi |
| P2 | `PUT /auth/password`, `PATCH /auth/me`, `/me/preferences` | Kata Sandi, Edit Profil, sakelar Notifikasi (UI sudah siap) |
| P2 | `POST /auth/google`, `/spmb/active` | Login Google, banner SPMB |
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
