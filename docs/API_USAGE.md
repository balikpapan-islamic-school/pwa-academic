# API PWA Siswa Usage

Dokumen ini menjelaskan cara memakai endpoint API PWA siswa yang sudah aktif dan sudah diverifikasi end-to-end.

Dokumen ini mengikuti arah kontrak pada `docs/pwa-reqs/api-spec.md`.

Aturan pembagiannya:

- `docs/pwa-reqs/api-spec.md` adalah target kontrak API untuk PWA
- `docs/API_PWA_SISWA_USAGE.md` adalah sumber kebenaran untuk endpoint yang benar-benar sudah aktif saat ini

Status saat ini:

- autentikasi API sudah aktif dengan Laravel Sanctum
- relasi `users.peserta_didik_id` sudah aktif
- flow `login -> auth/me -> me -> logout` sudah berhasil diuji
- endpoint `dashboard` sudah aktif
- endpoint `schedule` sudah aktif
- endpoint `attendance` dan `attendance/summary` sudah aktif
- endpoint `grades` sudah aktif
- endpoint `reports` sudah aktif
- endpoint `children` sudah aktif untuk flow `wali_siswa`
- endpoint `notifications` belum tersedia karena fondasi domainnya belum ada

Scope dokumen ini hanya mencakup endpoint yang sudah tersedia:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard`
- `GET /api/v1/me`
- `GET /api/v1/schedule`
- `GET /api/v1/attendance`
- `GET /api/v1/attendance/summary`
- `GET /api/v1/grades`
- `GET /api/v1/reports`
- `GET /api/v1/reports/{reportId}`
- `GET /api/v1/children`

Endpoint dalam `api-spec` yang belum aktif saat ini:

- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{notificationId}/read`

## Base URL

Base URL lokal project ini:

```text
http://bis-academic.test
```

Prefix API versi 1:

```text
/api/v1
```

Contoh full endpoint login:

```text
http://bis-academic.test/api/v1/auth/login
```

## Autentikasi

API ini memakai bearer token dari Laravel Sanctum.

Catatan penting implementasi:

- tabel token Sanctum sudah disesuaikan untuk user berbasis ULID
- token login sekarang bisa dibuat dan dipakai normal
- semua endpoint private saat ini menggunakan `auth:sanctum`
- pola auth yang dipakai saat ini sudah sejalan dengan `api-spec`

Alur dasar:

1. Login lewat endpoint `auth/login`
2. Simpan token dari response
3. Kirim token pada header `Authorization` untuk endpoint yang butuh autentikasi

Format header:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Format Respons Umum

Respons sukses biasanya berbentuk:

```json
{
  "message": "OK",
  "data": {}
}
```

Respons validasi biasanya berbentuk:

```json
{
  "message": "The username field is required. (and 1 more error)",
  "errors": {
    "username": [
      "Username wajib diisi."
    ],
    "password": [
      "Password wajib diisi."
    ]
  }
}
```

## 1. Login

Endpoint:

```http
POST /api/v1/auth/login
```

Tujuan:

- Login siswa menggunakan `username` dan `password`
- Menghasilkan token untuk dipakai di request berikutnya

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/auth/login`
- `role` sekarang ikut dikirim pada response user
- saat ini flow yang aktif baru untuk role siswa, belum untuk `wali_siswa`

### Request Body

| Field | Tipe | Wajib | Keterangan |
|------|------|------|------------|
| `username` | string | ya | Username akun siswa |
| `password` | string | ya | Password akun siswa |
| `device_name` | string | tidak | Nama device, default `PWA Siswa` |

### Contoh Request cURL

```bash
curl -X POST "http://bis-academic.test/api/v1/auth/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "arifin",
    "password": "password",
    "device_name": "Android Siswa"
  }'
```

Contoh akun yang saat ini sudah siap dipakai testing:

- `username`: `arifin`
- `password`: `password`

### Contoh Response Sukses

```json
{
  "message": "Login berhasil.",
  "data": {
    "token": "1|plain-text-token-example",
    "user": {
      "id": "01KPCST9S1RCJWQN4E5E9GVH8Y",
      "name": "Misbahul Arifin",
      "username": "arifin",
      "email": "arifin@bis.test",
      "role": "siswa",
      "sekolah": {
        "id": "01KKKMMHWKGWPPJTS6BEN0FKEA",
        "nama": "Sekolah Dasar Islam Terpadu",
        "jenis": "SDIT"
      },
      "peserta_didik": {
        "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
        "nama_lengkap": "Misbahul Arifin",
        "nama_panggilan": "Arifin",
        "nipd": null,
        "nisn": "1111111111",
        "status_aktif": true
      }
    }
  }
}
```

Catatan:

- `api-spec` menargetkan `role` eksplisit seperti `siswa` atau `wali_siswa`
- backend saat ini sudah mengirim `role` untuk flow siswa

### Kemungkinan Gagal

#### Validasi kosong

Status:

```http
422 Unprocessable Entity
```

Contoh response:

```json
{
  "message": "The username field is required. (and 1 more error)",
  "errors": {
    "username": ["Username wajib diisi."],
    "password": ["Password wajib diisi."]
  }
}
```

#### Username atau password salah

Status:

```http
422 Unprocessable Entity
```

Contoh response:

```json
{
  "message": "Username dan password tidak sesuai. (and 1 more error)",
  "errors": {
    "username": ["Username dan password tidak sesuai."],
    "password": ["Username dan password tidak sesuai."]
  }
}
```

Catatan untuk frontend PWA:

- gunakan `errors.username[0]` untuk error field username
- gunakan `errors.password[0]` untuk error field password
- jangan bergantung pada `message` utama karena Laravel akan menggabungkan teks saat ada lebih dari satu field error

#### Akun belum tertaut ke siswa

Status:

```http
422 Unprocessable Entity
```

Contoh response:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "username": ["Akun belum terhubung ke data siswa."]
  }
}
```

#### Siswa nonaktif

Status:

```http
422 Unprocessable Entity
```

Contoh response:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "username": ["Siswa tidak aktif dan tidak dapat mengakses aplikasi."]
  }
}
```

## 2. Logout

Endpoint:

```http
POST /api/v1/auth/logout
```

Tujuan:

- Menghapus token aktif yang dipakai pada request saat ini

Butuh autentikasi:

- ya

### Contoh Request cURL

```bash
curl -X POST "http://bis-academic.test/api/v1/auth/logout" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "Logout berhasil.",
  "data": null
}
```

### Jika Token Tidak Ada atau Tidak Valid

Status umum:

```http
401 Unauthorized
```

Contoh response Laravel:

```json
{
  "message": "Unauthenticated."
}
```

## 3. Auth Me

Endpoint:

```http
GET /api/v1/auth/me
```

Tujuan:

- Mengambil identitas akun login saat ini
- Cocok untuk bootstrap session aplikasi setelah token disimpan

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/auth/me`
- `role` sekarang ikut dikirim pada response

Butuh autentikasi:

- ya

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/auth/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": {
      "id": "01KPCST9S1RCJWQN4E5E9GVH8Y",
      "name": "Misbahul Arifin",
      "username": "arifin",
      "email": "arifin@bis.test",
      "role": "siswa",
      "sekolah": {
        "id": "01KKKMMHWKGWPPJTS6BEN0FKEA",
        "nama": "Sekolah Dasar Islam Terpadu",
        "jenis": "SDIT"
      },
      "peserta_didik": {
        "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
        "nama_lengkap": "Misbahul Arifin",
        "nama_panggilan": "Arifin",
        "nipd": null,
        "nisn": "1111111111",
        "status_aktif": true
      }
    }
}
```

## 4. Profil Siswa

Endpoint:

```http
GET /api/v1/me
```

Tujuan:

- Mengambil profil siswa yang lebih lengkap daripada `auth/me`

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/me`
- bentuk data inti sudah sejalan dengan kebutuhan PWA
- field alamat saat ini masih lebih mentah dari target spec karena kode wilayah belum ditransformasikan menjadi nama wilayah

Butuh autentikasi:

- ya

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/me" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": {
    "id": "01KPCSPKA4RKT8J3BCCP7QXW14",
    "nipd": null,
    "nisn": "1111111111",
    "nama_lengkap": "Misbahul Arifin",
    "nama_panggilan": "Arifin",
    "tempat_lahir": "Balikpapan",
    "tanggal_lahir": "2019-01-01",
    "jenis_kelamin": "laki-laki",
    "agama": "islam",
    "status_aktif": true,
    "sekolah": {
      "id": "01KKKMMHWKGWPPJTS6BEN0FKEA",
      "nama": "Sekolah Dasar Islam Terpadu",
      "jenis": "SDIT"
    },
    "alamat": {
      "jenis": "domisili",
      "jalan": "jl pandan arum",
      "rt": null,
      "rw": null,
      "kelurahan": "64.71.02.1006",
      "kecamatan": "64.71.02",
      "kabkot": "64.71",
      "provinsi": "64",
      "kode_pos": null
    }
  }
}
```

### Jika Akun Tidak Tertaut ke Data Siswa

Status:

```http
403 Forbidden
```

Kemungkinan response:

```json
{
  "message": "Akun belum terhubung ke data siswa."
}
```

## Contoh Alur Integrasi Frontend

Urutan integrasi yang direkomendasikan untuk PWA:

1. Kirim request `POST /api/v1/auth/login`
2. Ambil `data.token` dari response
3. Simpan token secara aman di client
4. Panggil `GET /api/v1/auth/me` untuk bootstrap akun
5. Panggil `GET /api/v1/me` untuk profil siswa detail
6. Saat logout, panggil `POST /api/v1/auth/logout`
7. Hapus token lokal di client setelah logout sukses

## Contoh Header untuk Semua Endpoint Private

```http
Accept: application/json
Authorization: Bearer 1|plain-text-token-example
```

## Catatan Implementasi Saat Ini

- Identifier login saat ini adalah `username`
- User test yang saat ini tersedia: `arifin / password`
- Endpoint belum mendukung login via `email`, `nisn`, atau `nipd`
- Belum ada endpoint sesuai target spec: `notifications`
- Field sensitif seperti `nik` dan `no_kk` tidak dikirim di response profil
- Endpoint `me` hanya mengambil alamat pertama dari relasi alamat siswa
- Field wilayah pada alamat saat ini masih berupa kode referensi, belum ditransformasikan menjadi nama wilayah
- Field `role` sudah tersedia di response `login` dan `auth/me` untuk flow siswa

## Daftar Endpoint Aktif Saat Ini

| Method | Endpoint | Auth | Fungsi |
|--------|----------|------|--------|
| POST | `/api/v1/auth/login` | tidak | Login siswa |
| POST | `/api/v1/auth/logout` | ya | Logout token aktif |
| GET | `/api/v1/auth/me` | ya | Profil akun login |
| GET | `/api/v1/me` | ya | Profil siswa detail |
| GET | `/api/v1/dashboard` | ya | Ringkasan beranda siswa |
| GET | `/api/v1/schedule` | ya | Jadwal mingguan siswa |
| GET | `/api/v1/attendance` | ya | Riwayat absensi siswa |
| GET | `/api/v1/attendance/summary` | ya | Rekap absensi siswa |
| GET | `/api/v1/grades` | ya | Nilai siswa per mata pelajaran |
| GET | `/api/v1/reports` | ya | Daftar rapor siswa |
| GET | `/api/v1/reports/{reportId}` | ya | Detail rapor siswa |
| GET | `/api/v1/children` | ya | Daftar anak untuk akun wali siswa |

## Kesesuaian Dengan API Spec

Status per endpoint terhadap `docs/pwa-reqs/api-spec.md`:

| Endpoint Spec | Status | Catatan |
|--------|--------|--------|
| `POST /auth/login` | aktif | `role` sudah tersedia untuk flow siswa |
| `GET /auth/me` | aktif | `role` sudah tersedia untuk flow siswa |
| `POST /auth/logout` | aktif | sesuai kebutuhan dasar |
| `GET /dashboard` | aktif | `school_alert`, `agendas`, dan `news` masih fallback kosong/null |
| `GET /me` | aktif | alamat masih memakai kode wilayah |
| `GET /schedule` | aktif | `week_start` sudah didukung, `student_id` belum dipakai |
| `GET /attendance` | aktif | `start_date`, `end_date`, dan `status` sudah didukung |
| `GET /attendance/summary` | aktif | `semester_id` sudah didukung |
| `GET /grades` | aktif | `semester_id` sudah didukung, `teacher` masih `null` |
| `GET /reports` | aktif | `student_id` belum dipakai |
| `GET /reports/{reportId}` | aktif | `principal_note` dan `document_url` masih `null` |
| `GET /children` | aktif | butuh role `wali_siswa` dan relasi `orang_tua.user_id` |
| `GET /notifications` | belum aktif | belum diimplementasi |
| `POST /notifications/{notificationId}/read` | belum aktif | belum diimplementasi |

## 5. Dashboard

Endpoint:

```http
GET /api/v1/dashboard
```

Tujuan:

- Menyediakan data ringkas untuk halaman beranda PWA sesuai arah `api-spec`

Butuh autentikasi:

- ya

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/dashboard`
- data `student`, `today_schedule`, `attendance_summary`, dan `latest_report` sudah tersedia
- `school_alert`, `agendas`, dan `news` masih fallback `null` atau array kosong
- query `student_id` untuk `wali_siswa` belum didukung

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/dashboard" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": {
    "student": {
      "id": "01...",
      "name": "Misbahul Arifin",
      "nickname": "Arifin",
      "nis": "2024001",
      "unit": "SDIT",
      "class_name": "6A",
      "semester_label": "2025/2026 Genap",
      "homeroom_teacher": "Ust. Ridwan"
    },
    "today_schedule": [
      {
        "id": "01...",
        "day": "Senin",
        "subject": "Matematika",
        "teacher": "Ust. Fikri",
        "start_time": "07:15",
        "end_time": "08:35",
        "room": "6A"
      }
    ],
    "attendance_summary": {
      "hadir": 1,
      "sakit": 0,
      "izin": 0,
      "alfa": 0
    },
    "latest_report": {
      "id": "01...",
      "semester": "2025/2026 Genap",
      "status": "Final",
      "average": 88,
      "published_at": "2026-04-13"
    },
    "school_alert": null,
    "agendas": [],
    "news": []
  }
}
```

## 6. Schedule

Endpoint:

```http
GET /api/v1/schedule
```

Tujuan:

- Menyediakan jadwal KBM mingguan sesuai arah `api-spec`

Butuh autentikasi:

- ya

Query yang saat ini didukung:

- `week_start=YYYY-MM-DD`

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/schedule`
- `week_start` sudah didukung
- `student_id` belum dipakai karena flow `wali_siswa` belum diimplementasi
- backend mengembalikan `date` nyata untuk tiap item jadwal sesuai minggu yang diminta

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/schedule?week_start=2026-04-13" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "date": "2026-04-13",
      "day": "Senin",
      "subject": "Matematika",
      "teacher": "Ust. Fikri",
      "start_time": "07:15",
      "end_time": "08:35",
      "room": "6A"
    },
    {
      "id": "01...",
      "date": "2026-04-15",
      "day": "Rabu",
      "subject": "IPA",
      "teacher": "Ust. Fikri",
      "start_time": "09:00",
      "end_time": "10:20",
      "room": "6A"
    }
  ]
}
```

## 7. Attendance

Endpoint:

```http
GET /api/v1/attendance
```

Tujuan:

- Menyediakan riwayat absensi siswa sesuai arah `api-spec`

Butuh autentikasi:

- ya

Query yang saat ini didukung:

- `start_date=YYYY-MM-DD`
- `end_date=YYYY-MM-DD`
- `status=hadir|sakit|izin|alfa`

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/attendance`
- `student_id` belum dipakai karena flow `wali_siswa` belum diimplementasi

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/attendance?start_date=2026-04-01&end_date=2026-04-30&status=sakit" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "date": "2026-04-17",
      "status": "Sakit",
      "subject": "Matematika",
      "note": "Demam"
    }
  ]
}
```

## 8. Attendance Summary

Endpoint:

```http
GET /api/v1/attendance/summary
```

Tujuan:

- Menyediakan rekap absensi siswa sesuai arah `api-spec`

Butuh autentikasi:

- ya

Query yang saat ini didukung:

- `semester_id=<id>`

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/attendance/summary`
- `student_id` belum dipakai karena flow `wali_siswa` belum diimplementasi

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/attendance/summary?semester_id=01..." \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": {
    "hadir": 2,
    "sakit": 0,
    "izin": 1,
    "alfa": 1
  }
}
```

## 9. Grades

Endpoint:

```http
GET /api/v1/grades
```

Tujuan:

- Menyediakan nilai siswa per mata pelajaran sesuai arah `api-spec`

Butuh autentikasi:

- ya

Query yang saat ini didukung:

- `semester_id=<id>`

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/grades`
- data dikelompokkan per mata pelajaran
- `teacher` masih `null` karena relasi guru untuk komponen nilai belum tersedia langsung di model penilaian saat ini
- `student_id` belum dipakai karena flow `wali_siswa` belum diimplementasi

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/grades?semester_id=01..." \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "subject": "Matematika",
      "teacher": null,
      "score": 87.8,
      "predicate": "A-",
      "components": [
        {
          "id": "01...",
          "name": "PTS",
          "score": 89,
          "weight": 40
        },
        {
          "id": "01...",
          "name": "PAS",
          "score": 87,
          "weight": 60
        }
      ]
    }
  ]
}
```

## 10. Reports

Endpoint:

```http
GET /api/v1/reports
```

Tujuan:

- Menyediakan daftar rapor siswa sesuai arah `api-spec`

Butuh autentikasi:

- ya

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/reports`
- `student_id` belum dipakai karena flow `wali_siswa` belum diimplementasi

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/reports" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "semester": "2025/2026 Genap",
      "status": "Final",
      "average": 88.3,
      "published_at": "2026-04-10"
    }
  ]
}
```

## 11. Report Detail

Endpoint:

```http
GET /api/v1/reports/{reportId}
```

Tujuan:

- Menyediakan detail rapor siswa sesuai arah `api-spec`

Butuh autentikasi:

- ya

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/reports/{reportId}`
- akses dibatasi hanya untuk rapor milik siswa login
- `principal_note` dan `document_url` masih `null` karena field tersebut belum tersedia di schema saat ini
- `skill_score` masih `null` karena struktur detail rapor saat ini hanya memiliki satu nilai angka per mapel

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/reports/01..." \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
    "semester": "2025/2026 Genap",
    "status": "Final",
    "average": 88,
    "homeroom_note": "Perkembangan sangat baik.",
    "principal_note": null,
    "document_url": null,
    "subjects": [
      {
        "id": "01...",
        "subject": "Matematika",
        "knowledge_score": 88,
        "skill_score": null,
        "note": "Mampu menyelesaikan soal dengan teliti."
      }
    ]
  }
}
```

## 12. Children

Endpoint:

```http
GET /api/v1/children
```

Tujuan:

- Menyediakan daftar anak untuk akun `wali_siswa` sesuai arah `api-spec`

Butuh autentikasi:

- ya

Catatan terhadap `api-spec`:

- path sudah sesuai dengan spec: `/children`
- hanya aktif untuk user dengan role `wali_siswa`
- fondasi relasinya menggunakan `orang_tua.user_id`
- untuk user non-`wali_siswa`, endpoint saat ini mengembalikan `data: []`

### Contoh Request cURL

```bash
curl -X GET "http://bis-academic.test/api/v1/children" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|plain-text-token-example"
```

### Contoh Response Sukses

```json
{
  "message": "OK",
  "data": [
    {
      "relation_id": "01...",
      "relationship": "Ayah",
      "student": {
        "id": "01...",
        "name": "Anak Pertama",
        "nickname": "Pertama",
        "nis": "2024001",
        "nisn": "1111111111",
        "school": "Sekolah Dasar Islam Terpadu",
        "school_unit": "SDIT"
      }
    }
  ]
}
```

## Endpoint Yang Masih Belum Bisa Diimplementasi Sekarang

### `GET /api/v1/notifications`
### `POST /api/v1/notifications/{notificationId}/read`

Belum tersedia karena:

- belum ada model/tabel notifikasi aplikasi di project
- belum ada domain pengumuman/notifikasi PWA yang bisa di-query oleh API
