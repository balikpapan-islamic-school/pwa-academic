# PROGRESS

Dokumen ini mencatat rencana kerja bertahap untuk pengembangan PWA akademik dengan pendekatan UI-first, sebelum integrasi API penuh.

---

## Prinsip Eksekusi

- Mulai dari pengalaman pengguna dan struktur visual aplikasi.
- Gunakan mock data lebih dulu agar alur produk bisa divalidasi cepat.
- Pastikan shell aplikasi dan halaman utama stabil sebelum integrasi backend.
- Integrasi API dilakukan setelah kebutuhan data frontend sudah jelas.

---

## Fase 1 - Fondasi UI

Tujuan:
- mengubah repo dari template starter menjadi kerangka aplikasi akademik

Pekerjaan:
- [x] rapikan route utama aplikasi
- [x] hapus route placeholder yang tidak relevan
- [x] buat struktur navigasi utama produk
- [x] bangun shell aplikasi mobile-first
- [x] siapkan layout dasar untuk halaman protected

Output:
- route MVP sudah tersedia
- app shell sudah terbentuk
- bottom navigation dan header dasar sudah siap

---

## Fase 2 - Halaman UI Statis MVP

Tujuan:
- menghadirkan seluruh halaman MVP dalam bentuk visual statis

Pekerjaan:
- [x] buat halaman `Login`
- [x] buat halaman `Beranda`
- [x] buat halaman `Jadwal`
- [x] buat halaman `Absensi`
- [x] buat halaman `Nilai`
- [x] buat halaman `Rapor`
- [x] buat halaman `Profil`
- [x] buat halaman `Pilih Anak`
- [x] buat halaman `Notifikasi`

Output:
- semua halaman utama sudah bisa dinavigasi
- struktur konten tiap halaman sudah terlihat
- pengalaman produk bisa direview tanpa backend

---

## Fase 3 - Komponen Reusable dan Design Language

Tujuan:
- membuat UI konsisten dan tidak terasa seperti template generik

Pekerjaan:
- [x] buat komponen ringkasan dashboard
- [x] buat komponen kartu jadwal
- [x] buat badge status absensi
- [x] buat komponen nilai dan rapor
- [x] buat komponen empty state
- [x] buat komponen skeleton loading
- [x] rapikan spacing, typography, dan hierarchy visual

Output:
- halaman menggunakan komponen domain yang konsisten
- style dasar aplikasi sudah terbentuk

---

## Fase 4 - Mock Data dan Simulasi Flow

Tujuan:
- menguji kecocokan UI dengan data akademik nyata sebelum integrasi API

Pekerjaan:
- [x] buat mock data untuk user login
- [x] buat mock data siswa aktif dan daftar anak
- [x] buat mock data dashboard
- [x] buat mock data jadwal
- [x] buat mock data absensi
- [x] buat mock data nilai
- [x] buat mock data rapor
- [x] buat mock data notifikasi

Output:
- semua halaman menampilkan data realistis
- alur user bisa diuji end-to-end

---

## Fase 5 - State Frontend dan Validasi UX

Tujuan:
- menyiapkan fondasi state agar mudah disambungkan ke backend

Pekerjaan:
- [x] siapkan auth context mock
- [x] siapkan active student context
- [x] siapkan linked students state untuk wali siswa
- [x] siapkan semester selection state bila diperlukan
- [x] siapkan loading, empty, dan error state per halaman
- [x] uji flow siswa dan wali siswa di mobile

Output:
- alur UI stabil
- state aplikasi sudah siap untuk integrasi service layer

---

## Fase 6 - Kontrak Data Frontend

Tujuan:
- memastikan frontend tahu bentuk data yang dibutuhkan sebelum API final

Pekerjaan:
- [x] definisikan type untuk user dan role
- [x] definisikan type untuk student context
- [x] definisikan type untuk jadwal
- [x] definisikan type untuk absensi
- [x] definisikan type untuk nilai
- [x] definisikan type untuk rapor
- [x] definisikan type untuk notifikasi

Output:
- type frontend lebih stabil
- kebutuhan payload per halaman lebih jelas

---

## Fase 7 - Integrasi API Bertahap

Tujuan:
- mengganti mock data dengan data nyata dari backend

Pekerjaan:
- [x] integrasi auth
- [x] integrasi current user
- [x] integrasi active student atau linked students
- [x] integrasi dashboard
- [x] integrasi jadwal
- [x] integrasi absensi
- [x] integrasi nilai
- [x] integrasi rapor
- [x] integrasi notifikasi

Output:
- frontend berjalan dengan data nyata
- mock data bisa dikurangi atau dihapus bertahap

---

## Fase 8 - Polish dan QA

Tujuan:
- memastikan aplikasi siap dipakai dan stabil di device utama

Pekerjaan:
- [x] cek responsif mobile dan desktop
- [x] cek konsistensi navigasi
- [x] cek akses berdasarkan role
- [x] cek empty, loading, dan error state
- [x] cek performa dasar PWA
- [x] rapikan detail visual akhir

Output:
- UI siap untuk review final
- fondasi MVP lebih aman untuk dirilis

---

## Prioritas Eksekusi

Urutan kerja yang disarankan:

1. Fase 1 - Fondasi UI
2. Fase 2 - Halaman UI Statis MVP
3. Fase 3 - Komponen Reusable dan Design Language
4. Fase 4 - Mock Data dan Simulasi Flow
5. Fase 5 - State Frontend dan Validasi UX
6. Fase 6 - Kontrak Data Frontend
7. Fase 7 - Integrasi API Bertahap
8. Fase 8 - Polish dan QA

---

## Fokus Saat Ini

Fokus awal yang paling tepat adalah:

- membangun fondasi UI
- menata routing dan navigation
- membuat halaman MVP dalam bentuk statis

Tahap ini akan memberi bentuk nyata pada produk sebelum kita masuk ke integrasi backend.
