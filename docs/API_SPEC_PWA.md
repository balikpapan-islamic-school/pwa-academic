# API SPEC PWA

Dokumen ini mendefinisikan kebutuhan API untuk PWA informasi akademik siswa dan wali siswa BIS.

Tujuan dokumen ini:
- menjadi kontrak kerja antara frontend dan backend
- menjelaskan endpoint yang dibutuhkan PWA, terlepas dari apakah endpoint itu sudah tersedia atau belum
- memisahkan kebutuhan API target dari dokumen `API_USAGE.md` yang hanya berisi endpoint yang sudah aktif saat ini

---

## 1. Prinsip Umum

- Base URL lokal saat ini: `http://bis-academic.test/api/v1`
- Semua endpoint private memakai bearer token
- Semua request API harus mengirim header:

```http
Accept: application/json
Authorization: Bearer <token>
```

- Semua response sukses sebaiknya konsisten dalam format:

```json
{
  "message": "OK",
  "data": {}
}
```

- Semua error validasi sebaiknya konsisten dalam format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

---

## 2. Role dan Akses

Role minimal yang perlu didukung PWA:

- `siswa`
- `wali_siswa`

Aturan akses:

- `siswa` hanya boleh melihat data dirinya sendiri
- `wali_siswa` hanya boleh melihat data anak yang terhubung ke akunnya
- backend harus menjadi sumber kebenaran untuk otorisasi relasi user dan siswa

---

## 3. Endpoint Auth

### 3.1 Login

**Method**: `POST`  
**Path**: `/auth/login`  
**Auth**: tidak

Request body:

```json
{
  "username": "arifin",
  "password": "password",
  "device_name": "PWA Siswa"
}
```

Response sukses minimal yang dibutuhkan frontend:

```json
{
  "message": "Login berhasil.",
  "data": {
    "token": "plain-text-token",
    "user": {
      "id": "01...",
      "name": "Misbahul Arifin",
      "username": "arifin",
      "email": "arifin@bis.test",
      "role": "siswa",
      "sekolah": {
        "id": "01...",
        "nama": "Sekolah Dasar Islam Terpadu",
        "jenis": "SDIT"
      },
      "peserta_didik": {
        "id": "01...",
        "nama_lengkap": "Misbahul Arifin",
        "nama_panggilan": "Arifin",
        "nisn": "1111111111",
        "status_aktif": true
      }
    }
  }
}
```

Catatan:
- `role` sebaiknya eksplisit pada response user
- token harus bisa langsung dipakai untuk endpoint private berikutnya

### 3.2 Auth Me

**Method**: `GET`  
**Path**: `/auth/me`  
**Auth**: ya

Tujuan:
- bootstrap session setelah token tersimpan
- validasi bahwa token masih aktif

Response minimal:

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
    "name": "Misbahul Arifin",
    "username": "arifin",
    "email": "arifin@bis.test",
    "role": "siswa",
    "sekolah": {
      "id": "01...",
      "nama": "Sekolah Dasar Islam Terpadu",
      "jenis": "SDIT"
    },
    "peserta_didik": {
      "id": "01...",
      "nama_lengkap": "Misbahul Arifin",
      "nama_panggilan": "Arifin",
      "nisn": "1111111111",
      "status_aktif": true
    }
  }
}
```

### 3.3 Logout

**Method**: `POST`  
**Path**: `/auth/logout`  
**Auth**: ya

Response sukses:

```json
{
  "message": "Logout berhasil.",
  "data": null
}
```

---

## 4. Endpoint Profil Siswa

### 4.1 Profil Siswa Detail

**Method**: `GET`  
**Path**: `/me`  
**Auth**: ya

Tujuan:
- mengambil profil siswa yang lebih lengkap daripada `auth/me`
- menjadi data utama untuk halaman `Profil`

Response minimal yang dibutuhkan frontend:

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
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
      "id": "01...",
      "nama": "Sekolah Dasar Islam Terpadu",
      "jenis": "SDIT"
    },
    "alamat": {
      "jenis": "domisili",
      "jalan": "jl pandan arum"
    }
  }
}
```

Catatan:
- jika kelas aktif, semester aktif, dan wali kelas sudah tersedia, sebaiknya ikut dikirim di response ini atau lewat endpoint terpisah yang ringan

---

## 5. Endpoint Konteks Siswa / Multi-Anak

### 5.1 Daftar Anak Terhubung

**Method**: `GET`  
**Path**: `/children`  
**Auth**: ya  
**Role**: `wali_siswa`

Tujuan:
- menampilkan daftar anak yang terhubung ke akun wali siswa
- menjadi dasar halaman `Pilih Anak`

Response minimal:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "nama_lengkap": "Anak Pertama",
      "nama_panggilan": "Alya",
      "nisn": "1111111111",
      "sekolah": {
        "id": "01...",
        "nama": "SMPIT BIS",
        "jenis": "SMPIT"
      },
      "kelas_aktif": {
        "id": "01...",
        "nama": "8B"
      },
      "semester_aktif": {
        "id": "01...",
        "label": "2025/2026 Genap"
      },
      "wali_kelas": {
        "id": "01...",
        "nama": "Ustazah Hana"
      }
    }
  ]
}
```

Catatan:
- untuk role `siswa`, frontend tidak perlu endpoint ini jika `auth/me` atau `me` sudah cukup untuk menetapkan siswa aktif

---

## 6. Endpoint Dashboard / Beranda

### 6.1 Dashboard Ringkasan

**Method**: `GET`  
**Path**: `/dashboard`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
```

Catatan:
- untuk role `siswa`, backend bisa mengabaikan `student_id` dan memakai siswa milik akun login
- untuk `wali_siswa`, `student_id` dapat dipakai untuk memilih anak aktif

Response minimal:

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
      "hadir": 18,
      "sakit": 1,
      "izin": 1,
      "alfa": 0
    },
    "latest_report": {
      "id": "01...",
      "semester": "2025/2026 Genap",
      "status": "Final",
      "average": 88.3,
      "published_at": "2026-04-10"
    },
    "school_alert": {
      "id": "01...",
      "title": "Pengumuman UTS",
      "message": "UTS dimulai Senin depan.",
      "tone": "warning",
      "action_label": "Lihat KBM",
      "action_href": "/jadwal"
    },
    "agendas": [],
    "news": []
  }
}
```

Catatan:
- `school_alert`, `agendas`, dan `news` boleh kosong jika belum tersedia

---

## 7. Endpoint KBM / Jadwal

### 7.1 Jadwal KBM

**Method**: `GET`  
**Path**: `/schedule`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
week_start=2026-04-13
```

Response minimal:

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
    }
  ]
}
```

Catatan:
- backend sebaiknya mengirim `date` nyata agar mode mingguan lebih akurat dibanding hanya `day`

---

## 8. Endpoint Absensi

### 8.1 Riwayat Absensi

**Method**: `GET`  
**Path**: `/attendance`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
start_date=2026-04-01
end_date=2026-04-30
status=hadir
```

Response minimal:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "date": "2026-04-17",
      "status": "Hadir",
      "subject": "Matematika",
      "note": null
    }
  ]
}
```

### 8.2 Rekap Absensi

**Method**: `GET`  
**Path**: `/attendance/summary`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
semester_id=<id>
```

Response minimal:

```json
{
  "message": "OK",
  "data": {
    "hadir": 18,
    "sakit": 1,
    "izin": 1,
    "alfa": 0
  }
}
```

---

## 9. Endpoint Nilai

### 9.1 Nilai Siswa

**Method**: `GET`  
**Path**: `/grades`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
semester_id=<id>
```

Response minimal:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "subject": "Matematika",
      "teacher": "Ust. Fikri",
      "score": 88,
      "predicate": "A-",
      "components": [
        {
          "id": "01...",
          "name": "PTS",
          "score": 89,
          "weight": 35
        }
      ]
    }
  ]
}
```

---

## 10. Endpoint Rapor

### 10.1 Daftar Rapor

**Method**: `GET`  
**Path**: `/reports`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
```

Response minimal:

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

### 10.2 Detail Rapor

**Method**: `GET`  
**Path**: `/reports/{reportId}`  
**Auth**: ya

Response minimal:

```json
{
  "message": "OK",
  "data": {
    "id": "01...",
    "semester": "2025/2026 Genap",
    "status": "Final",
    "average": 88.3,
    "homeroom_note": "Perkembangan sangat baik.",
    "principal_note": "Pertahankan semangat belajar.",
    "document_url": "https://.../rapor.pdf",
    "subjects": [
      {
        "id": "01...",
        "subject": "Matematika",
        "knowledge_score": 88,
        "skill_score": 87,
        "note": "Mampu menyelesaikan soal dengan teliti."
      }
    ]
  }
}
```

---

## 11. Endpoint Notifikasi

### 11.1 Daftar Notifikasi

**Method**: `GET`  
**Path**: `/notifications`  
**Auth**: ya

Query opsional:

```text
student_id=<id>
```

Response minimal:

```json
{
  "message": "OK",
  "data": [
    {
      "id": "01...",
      "title": "Rapor telah final",
      "body": "Rapor semester genap sudah tersedia.",
      "time": "2026-04-17T08:00:00Z",
      "href": "/rapor",
      "read": false
    }
  ]
}
```

### 11.2 Tandai Dibaca

**Method**: `POST`  
**Path**: `/notifications/{notificationId}/read`  
**Auth**: ya

Response minimal:

```json
{
  "message": "Notifikasi ditandai sudah dibaca.",
  "data": null
}
```

---

## 12. Urutan Implementasi Backend yang Disarankan

Urutan paling aman agar frontend bisa migrasi bertahap:

1. `POST /auth/login`
2. `GET /auth/me`
3. `POST /auth/logout`
4. `GET /me`
5. `GET /children`
6. `GET /dashboard`
7. `GET /schedule`
8. `GET /attendance`
9. `GET /attendance/summary`
10. `GET /grades`
11. `GET /reports`
12. `GET /reports/{reportId}`
13. `GET /notifications`
14. `POST /notifications/{notificationId}/read`

---

## 13. Catatan Implementasi Frontend

- frontend saat ini sudah memakai facade `academicService`
- auth sudah mulai memakai endpoint nyata
- endpoint akademik lain masih bisa memakai fallback mock sampai backend tersedia
- backend sebaiknya menjaga konsistensi penamaan field agar frontend tidak perlu banyak adapter tambahan

---

## 14. Catatan Akhir

Dokumen ini adalah target API spec untuk PWA BIS.

Jika ada perbedaan antara backend yang tersedia saat ini dengan dokumen ini, maka:
- `API_USAGE.md` menjadi sumber kebenaran untuk endpoint yang sudah aktif
- `API_SPEC_PWA.md` menjadi target implementasi untuk endpoint yang masih perlu dibangun
