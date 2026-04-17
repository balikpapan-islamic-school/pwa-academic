# Implementation Plan - PWA Informasi Akademik Siswa BIS

**Versi:** 0.1  
**Tanggal:** 17 April 2026  
**Project:** `bis/pwa-academic`

Dokumen ini adalah turunan implementasi dari `docs/PRD.md` dan berfokus pada perencanaan delivery frontend untuk MVP.

---

## 1. Tujuan Dokumen

Dokumen ini digunakan untuk menerjemahkan kebutuhan produk ke bentuk yang siap diimplementasikan pada codebase frontend saat ini.

Fokus dokumen:
- struktur halaman aplikasi
- sitemap dan route map
- modul dan komponen utama
- kebutuhan state dan data
- dependensi API
- breakdown pekerjaan implementasi frontend

Dokumen ini tidak menggantikan PRD. Semua keputusan produk tetap merujuk ke `docs/PRD.md`.

---

## 2. Kondisi Codebase Saat Ini

Berdasarkan struktur repo saat ini:

- project masih menggunakan starter `React + Vite + TypeScript + shadcn/ui`
- routing masih sangat minimal dan belum merepresentasikan struktur produk akhir
- halaman yang ada masih berupa placeholder seperti `Dashboard`, `Sample`, dan `ComingSoon`
- menu aplikasi masih template-oriented dan belum sesuai domain akademik
- layout dasar sudah tersedia melalui `AppLayout`, `AppHeader`, dan `AppFooter`

Implikasi implementasi:
- kita perlu mengganti struktur starter menjadi struktur aplikasi PWA akademik
- kita perlu menata ulang route dan menu sebagai fondasi tahap awal
- kita bisa memanfaatkan komponen UI yang sudah ada untuk mempercepat implementasi MVP

---

## 3. Target MVP Frontend

MVP frontend yang akan dibangun pada tahap awal mencakup:

- login
- dashboard ringkasan
- jadwal pelajaran
- absensi
- nilai
- rapor
- profil siswa
- pergantian anak aktif untuk wali siswa
- notifikasi in-app dasar jika backend memungkinkan

Catatan:
- jika backend notifikasi belum siap, halaman notifikasi dapat disiapkan sebagai placeholder terstruktur tanpa integrasi final

---

## 4. Sitemap MVP

Struktur informasi aplikasi yang direkomendasikan:

1. `Login`
2. `Beranda`
3. `Jadwal`
4. `Absensi`
5. `Nilai`
6. `Rapor`
7. `Profil`
8. `Pilih Anak` untuk wali siswa
9. `Notifikasi`

Relasi navigasi utama:

- `Login` -> `Beranda`
- `Beranda` -> `Jadwal`
- `Beranda` -> `Absensi`
- `Beranda` -> `Nilai`
- `Beranda` -> `Rapor`
- `Beranda` -> `Profil`
- `Beranda` -> `Notifikasi`
- `Beranda` -> `Pilih Anak` untuk role `wali_siswa`

---

## 5. Route Map yang Direkomendasikan

Struktur route sebaiknya dibagi menjadi route publik dan route terproteksi.

### Public Routes

- `/login`

### Protected Routes

- `/`
- `/jadwal`
- `/absensi`
- `/nilai`
- `/rapor`
- `/profil`
- `/notifikasi`
- `/pilih-anak`

### Fallback Routes

- `*` untuk not found

### Catatan Routing

- `/` diarahkan ke halaman `Beranda`
- route `/pilih-anak` hanya relevan untuk role `wali_siswa`
- jika anak aktif belum dipilih, role `wali_siswa` dapat diarahkan ke `/pilih-anak` setelah login
- data siswa aktif harus menjadi konteks global, bukan query state per halaman saja

---

## 6. Struktur Modul Frontend yang Direkomendasikan

Struktur berikut lebih cocok untuk domain aplikasi akademik daripada struktur starter umum.

```txt
src/
  components/
    app/
    dashboard/
    jadwal/
    absensi/
    nilai/
    rapor/
    profil/
    siswa/
    notifications/
    shared/
    ui/
  contexts/
  hooks/
  lib/
  pages/
    auth/
    dashboard/
    jadwal/
    absensi/
    nilai/
    rapor/
    profil/
    notifications/
    siswa/
  services/
  types/
  config/
```

### Penjelasan Modul

- `components/app`: layout, header, nav, shell aplikasi
- `components/dashboard`: kartu ringkasan dashboard
- `components/jadwal`: daftar jadwal, filter hari, empty state
- `components/absensi`: tabel atau list absensi, badge status, rekap
- `components/nilai`: list nilai, selector semester, rincian nilai
- `components/rapor`: daftar semester, detail rapor, summary card
- `components/profil`: kartu identitas siswa
- `components/siswa`: pemilih anak aktif dan ringkasan konteks siswa
- `components/notifications`: list notifikasi dan indikator belum dibaca
- `services`: adapter API per domain
- `types`: type frontend untuk entity akademik yang dipakai UI

---

## 7. Halaman MVP dan Komponen Inti

### 7.1 Login Page

Tanggung jawab halaman:
- autentikasi pengguna
- redirect ke route yang benar setelah login

Komponen inti:
- `LoginForm`
- `AuthCard`
- `AuthErrorAlert`

### 7.2 Dashboard Page

Tanggung jawab halaman:
- menjadi titik masuk utama setelah login
- menampilkan informasi ringkas siswa aktif

Komponen inti:
- `StudentContextHeader`
- `TodayScheduleCard`
- `AttendanceSummaryCard`
- `GradeSummaryCard`
- `ReportStatusCard`
- `QuickLinkGrid`

### 7.3 Jadwal Page

Tanggung jawab halaman:
- menampilkan KBM siswa dalam dua mode tampilan utama: `kalender` dan `timeline`

Komponen inti:
- `ScheduleModeSwitcher`
- `ScheduleCalendarView`
- `ScheduleTimelineView`
- `ScheduleDateSummary`
- `ScheduleEmptyState`

Catatan implementasi terbaru:
- halaman `Jadwal` diposisikan ulang sebagai halaman `KBM`
- default mode adalah `timeline`
- user dapat berpindah antara mode `kalender` dan `timeline`
- kedua mode berbagi state `selectedDate` / hari aktif yang sama
- mode kalender berfungsi sebagai overview tanggal yang memiliki sesi KBM
- mode timeline berfungsi sebagai detail urutan sesi pada hari yang dipilih

### 7.4 Absensi Page

Tanggung jawab halaman:
- menampilkan riwayat dan rekap kehadiran

Komponen inti:
- `AttendanceSummary`
- `AttendanceFilter`
- `AttendanceList`
- `AttendanceStatusBadge`
- `AttendanceEmptyState`

### 7.5 Nilai Page

Tanggung jawab halaman:
- menampilkan perkembangan nilai akademik

Komponen inti:
- `SemesterSelector`
- `GradeList`
- `GradeCard`
- `GradeComponentDetail`
- `GradeEmptyState`

### 7.6 Rapor Page

Tanggung jawab halaman:
- menampilkan daftar dan detail rapor per semester

Komponen inti:
- `ReportSemesterList`
- `ReportStatusBadge`
- `ReportDetailCard`
- `TeacherNotesCard`
- `ReportDocumentAction`
- `ReportEmptyState`

### 7.7 Profil Page

Tanggung jawab halaman:
- menampilkan identitas akademik siswa aktif

Komponen inti:
- `StudentProfileCard`
- `SchoolInfoCard`
- `ClassInfoCard`
- `HomeroomTeacherCard`

### 7.8 Pilih Anak Page

Tanggung jawab halaman:
- memfasilitasi wali siswa mengganti konteks anak aktif

Komponen inti:
- `StudentSwitcher`
- `StudentListCard`
- `ActiveStudentIndicator`

### 7.9 Notifikasi Page

Tanggung jawab halaman:
- menampilkan notifikasi akademik yang relevan

Komponen inti:
- `NotificationList`
- `NotificationItem`
- `NotificationBadge`
- `NotificationEmptyState`

---

## 8. Shell Aplikasi yang Perlu Dibangun

Karena produk ini adalah PWA mobile-first, shell aplikasi perlu disesuaikan dari layout starter saat ini.

### Komponen Shell Prioritas

- `AppShell`
- `TopHeader`
- `BottomNavigation`
- `StudentContextBar`
- `ProtectedRoute`
- `PageContainer`

### Catatan UX

- untuk mobile, bottom navigation lebih cocok daripada sidebar template saat ini
- header harus menampilkan identitas anak aktif atau siswa aktif
- aksi penting seperti notifikasi dan ganti anak harus mudah dijangkau

---

## 9. State Management yang Dibutuhkan

Frontend MVP belum membutuhkan state management yang berat, tetapi membutuhkan pemisahan state yang jelas.

### State Global Minimum

- `authUser`
- `userRole`
- `activeStudent`
- `linkedStudents` untuk wali siswa
- `activeSemester` atau semester terpilih bila perlu
- `notificationUnreadCount`

### State per Halaman

- loading
- error
- empty
- success data state
- filter state sederhana seperti hari atau semester

### Rekomendasi Pendekatan

- gunakan `context` untuk auth dan active student
- gunakan hooks domain-specific untuk pengambilan data halaman
- hindari state global besar pada tahap awal

---

## 10. Draft Domain Types Frontend

Beberapa type minimum yang kemungkinan dibutuhkan:

- `AuthUser`
- `StudentSummary`
- `StudentProfile`
- `LinkedStudent`
- `ScheduleItem`
- `AttendanceItem`
- `AttendanceSummary`
- `GradeItem`
- `GradeComponentItem`
- `ReportSummary`
- `ReportDetail`
- `NotificationItem`

Tujuan type ini:
- menjaga kontrak data UI tetap konsisten
- memudahkan adaptasi saat backend final tersedia
- memisahkan response mentah API dari kebutuhan render UI bila diperlukan

---

## 11. Kebutuhan API per Halaman

### Auth

- login endpoint
- current user endpoint
- logout endpoint

### Student Context

- endpoint siswa aktif untuk role siswa
- endpoint daftar anak terhubung untuk role wali siswa
- endpoint set atau choose active student jika konteks perlu disimpan server-side

### Dashboard

- endpoint ringkasan dashboard siswa

Minimum payload dashboard:
- identitas siswa
- kelas atau rombel
- semester aktif
- jadwal hari ini
- status absensi terbaru
- ringkasan nilai
- status rapor terbaru

### Jadwal

- endpoint jadwal siswa per hari atau minggu

### Absensi

- endpoint daftar absensi siswa
- endpoint rekap absensi siswa

### Nilai

- endpoint nilai siswa per semester
- endpoint detail komponen nilai jika tersedia terpisah

### Rapor

- endpoint daftar rapor siswa
- endpoint detail rapor siswa
- endpoint dokumen rapor jika tersedia

### Notifikasi

- endpoint daftar notifikasi
- endpoint tandai dibaca

### Persiapan Integrasi API

- frontend menggunakan facade `academicService` sebagai satu pintu akses data
- consumer di page dan context tidak boleh mengimpor mock service secara langsung
- source data ditentukan melalui environment variable `VITE_DATA_SOURCE`
- nilai `mock` menggunakan mock service lokal untuk development UI
- nilai `api` menggunakan HTTP service dengan base URL dari `VITE_API_BASE_URL`

Contoh environment:
- `VITE_DATA_SOURCE=mock`
- `VITE_DATA_SOURCE=api`
- `VITE_API_BASE_URL=https://domain-api.example.com`

---

## 12. Skenario Loading, Empty, dan Error

Setiap halaman MVP sebaiknya memiliki tiga state minimum selain success.

### Loading

- gunakan skeleton untuk dashboard cards, daftar jadwal, absensi, nilai, dan rapor
- loading harus tampil cepat untuk memberi feedback visual

### Empty

Contoh:
- belum ada jadwal untuk hari ini
- belum ada data nilai pada semester ini
- belum ada rapor yang dipublikasikan
- belum ada notifikasi

### Error

Contoh:
- gagal memuat data
- sesi login habis
- data siswa aktif tidak valid

Perilaku minimum:
- tampilkan pesan jelas
- sediakan aksi retry bila memungkinkan

---

## 13. Rencana Adaptasi dari Struktur Starter Saat Ini

Perubahan yang direkomendasikan terhadap struktur saat ini:

### Router

- ganti route placeholder dengan route MVP akademik
- tambahkan route `login`
- tambahkan route proteksi untuk halaman internal

### Menu

- ganti `src/config/menu.ts` menjadi menu akademik
- hilangkan menu `Pages`, `Sample`, dan `Coming Soon`

### Layout

- evaluasi `AppLayout` agar cocok untuk mobile-first
- kurangi ketergantungan pada sidebar template
- prioritaskan bottom navigation dan header kontekstual

### Pages

- ganti `src/pages/Dashboard.tsx` dari placeholder menjadi dashboard akademik
- tambahkan folder halaman sesuai domain

### Components

- pertahankan `ui` components yang sudah ada
- tambahkan komponen domain secara bertahap per halaman

---

## 14. Prioritas Implementasi Frontend

Urutan implementasi yang disarankan:

1. fondasi routing dan shell aplikasi
2. autentikasi dasar dan proteksi route
3. active student context
4. dashboard ringkasan
5. jadwal
6. absensi
7. nilai
8. rapor
9. profil siswa
10. notifikasi

Urutan ini menjaga fondasi navigasi dan konteks user selesai terlebih dahulu sebelum fitur konten detail dibangun.

---

## 15. Breakdown Task Frontend MVP

### Fase 1 - App Foundation

- rapikan route utama aplikasi
- buat public route dan protected route
- buat shell layout mobile-first
- ubah menu aplikasi dari template menjadi menu akademik
- siapkan context untuk auth dan active student

### Fase 2 - Auth dan Student Context

- buat halaman login
- implementasi alur login dan logout
- implementasi pengambilan current user
- implementasi daftar anak untuk wali siswa
- implementasi mekanisme memilih anak aktif

### Fase 3 - Dashboard

- buat dashboard akademik
- implementasi kartu jadwal hari ini
- implementasi kartu absensi terbaru
- implementasi kartu ringkasan nilai
- implementasi kartu status rapor

### Fase 4 - Jadwal dan Absensi

- buat halaman jadwal
- buat halaman absensi
- implementasi list, filter sederhana, dan empty state

### Fase 5 - Nilai dan Rapor

- buat halaman nilai
- buat halaman rapor
- implementasi selector semester
- implementasi tampilan detail nilai dan rapor

### Fase 6 - Profil dan Notifikasi

- buat halaman profil siswa
- buat halaman notifikasi
- implementasi badge unread jika tersedia

### Fase 7 - Polish dan QA

- cek pengalaman mobile dan desktop
- rapikan loading, empty, dan error state
- cek konsistensi konteks anak aktif
- validasi akses role siswa dan wali siswa

---

## 16. Risiko Implementasi

### Risiko Produk dan Data

- definisi role `siswa` dan `wali_siswa` di backend belum final
- relasi akun wali ke banyak siswa mungkin belum tersedia secara siap pakai
- struktur endpoint dashboard ringkasan mungkin belum tersedia dan perlu komposisi dari beberapa endpoint

### Risiko Frontend

- starter layout saat ini belum dirancang sebagai PWA akademik mobile-first
- tanpa kontrak API yang jelas, komponen bisa berubah cukup banyak saat integrasi
- jika data akademik tidak konsisten antar sekolah, UI perlu lebih fleksibel dari yang diperkirakan

---

## 17. Rekomendasi Langkah Berikutnya

1. Finalkan kontrak data minimum untuk login, active student, dashboard, jadwal, absensi, nilai, dan rapor.
2. Sepakati struktur route dan navigation sebelum implementasi UI dimulai.
3. Buat mock data frontend agar halaman MVP dapat dibangun tanpa menunggu backend final.
4. Mulai dari foundation app shell dan dashboard agar arah visual aplikasi cepat terlihat.

---

## 18. Ringkasan Implementasi

Untuk repo saat ini, pekerjaan paling penting bukan langsung membuat seluruh halaman detail, tetapi membangun fondasi aplikasi akademik yang benar:

- routing yang sesuai produk
- shell mobile-first
- konteks siswa aktif
- halaman dashboard sebagai entry point

Setelah fondasi ini selesai, halaman `Jadwal`, `Absensi`, `Nilai`, dan `Rapor` dapat dibangun secara bertahap dengan pola komponen yang konsisten.
