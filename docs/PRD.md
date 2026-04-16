# PRD - PWA Informasi Akademik Siswa BIS

**Versi:** 0.1  
**Tanggal:** 17 April 2026  
**Project:** `bis/pwa-academic`

---

## 1. Ringkasan Produk

PWA Informasi Akademik Siswa BIS adalah aplikasi pendamping dari Sistem Informasi Akademik (SIA) utama yang berfokus pada penyajian informasi kegiatan belajar mengajar untuk `siswa` dan `wali siswa`.

Aplikasi ini tidak ditujukan untuk operasional internal sekolah seperti input nilai, input absensi, atau pengelolaan data master. PWA ini berfungsi sebagai kanal akses informasi akademik yang cepat, ringan, mobile-friendly, dan mudah diakses melalui perangkat pribadi.

Data yang ditampilkan di PWA bersumber dari sistem akademik utama BIS dan bersifat dominan read-only.

---

## 2. Latar Belakang

Sistem akademik utama BIS dirancang untuk kebutuhan operasional sekolah, termasuk pengelolaan peserta didik, guru, rombongan belajar, jadwal pelajaran, absensi, nilai, dan rapor. Namun, kebutuhan `siswa` dan `wali siswa` berbeda dengan pengguna internal sekolah.

Pengguna eksternal tidak membutuhkan akses ke modul administrasi. Mereka hanya membutuhkan informasi akademik yang relevan, ringkas, dan selalu tersedia, terutama terkait kegiatan belajar mengajar harian dan perkembangan akademik siswa.

Tanpa kanal khusus untuk siswa dan wali siswa, informasi penting seperti jadwal pelajaran, absensi, nilai, dan rapor menjadi kurang praktis diakses. Hal ini menurunkan visibilitas orang tua terhadap perkembangan anak dan membuat pengalaman akses informasi akademik kurang efisien.

PWA ini hadir untuk menjembatani kebutuhan tersebut dalam bentuk aplikasi web yang dapat dibuka seperti aplikasi mobile.

---

## 3. Tujuan Produk

### Tujuan Bisnis

- Meningkatkan transparansi informasi akademik kepada siswa dan wali siswa.
- Menyediakan kanal resmi untuk pemantauan kegiatan belajar mengajar.
- Mengurangi ketergantungan pada penyampaian informasi manual melalui chat atau dokumen terpisah.
- Menjadi lapisan pengalaman pengguna eksternal di atas sistem akademik utama BIS.

### Tujuan Pengguna

- Siswa dapat melihat informasi belajar yang relevan untuk dirinya.
- Wali siswa dapat memantau aktivitas akademik dan perkembangan anak secara mandiri.
- Pengguna dapat mengakses informasi akademik penting dengan cepat melalui perangkat mobile.

---

## 4. Target Pengguna

### 1. Siswa

Kebutuhan utama:
- Melihat jadwal pelajaran.
- Melihat kehadiran.
- Melihat nilai dan rapor.
- Mengetahui informasi akademik terbaru yang berkaitan dengan dirinya.

### 2. Wali Siswa

Kebutuhan utama:
- Memantau jadwal kegiatan belajar anak.
- Memantau kehadiran anak.
- Melihat perkembangan nilai dan rapor.
- Mengakses data lebih dari satu anak dalam satu akun jika diperlukan.

---

## 5. Problem Statement

### Masalah Saat Ini

- Informasi akademik siswa tersebar di sistem internal yang tidak dirancang untuk konsumsi pengguna eksternal.
- Wali siswa membutuhkan akses yang mudah dan cepat terhadap informasi perkembangan anak.
- Siswa membutuhkan tampilan yang sederhana untuk melihat aktivitas belajar hari ini dan hasil akademiknya.
- Belum ada antarmuka mobile-first yang khusus untuk kebutuhan informasi akademik siswa dan wali siswa.

### Solusi yang Diajukan

Membangun PWA yang menyajikan informasi akademik siswa secara terfokus, sederhana, dan aman, dengan integrasi data dari sistem akademik utama BIS.

---

## 6. Prinsip Produk

- **Read-first**: fokus utama adalah konsumsi informasi, bukan input operasional.
- **Mobile-first**: pengalaman utama dioptimalkan untuk smartphone.
- **Ringkas dan relevan**: informasi yang tampil harus langsung berguna untuk siswa dan wali siswa.
- **Terhubung ke sistem utama**: PWA tidak menjadi sumber data akademik utama.
- **Aman dan tersegmentasi**: pengguna hanya dapat melihat data yang menjadi hak aksesnya.

---

## 7. Scope Produk

### In Scope

- Autentikasi pengguna `siswa` dan `wali siswa`.
- Dashboard ringkasan akademik.
- Jadwal pelajaran.
- Kehadiran / absensi.
- Nilai akademik.
- Rapor semester.
- Profil siswa dan konteks akademik aktif.
- Dukungan multi-anak untuk akun wali siswa.
- Notifikasi akademik penting.

### Out of Scope

- Input absensi oleh guru.
- Input nilai oleh guru.
- CRUD data master sekolah.
- Manajemen kurikulum, kelas, rombel, dan pengguna internal.
- Operasional administrasi sekolah.
- Chat, tugas, PR, atau LMS penuh.
- Pembayaran, keuangan, atau administrasi non-akademik.

---

## 8. Fitur MVP

### 8.1 Login dan Akses Pengguna

Pengguna dapat masuk ke aplikasi menggunakan akun yang terhubung dengan sistem akademik utama.

Kebutuhan MVP:
- Login aman.
- Sesi pengguna tersimpan di perangkat.
- Logout.
- Role minimal: `siswa` dan `wali_siswa`.
- Wali siswa dapat mengakses data anak yang terhubung ke akunnya.

### 8.2 Dashboard Ringkasan Akademik

Halaman utama setelah login yang menampilkan ringkasan informasi terpenting.

Konten utama:
- identitas siswa
- sekolah / unit
- kelas atau rombel aktif
- semester aktif
- jadwal hari ini
- status kehadiran terbaru
- ringkasan nilai terbaru
- status rapor terakhir

Tujuan:
- memberi gambaran cepat tentang kondisi akademik siswa tanpa perlu membuka banyak halaman

### 8.3 Jadwal Pelajaran

Menampilkan jadwal kegiatan belajar mengajar siswa.

Kebutuhan MVP:
- tampilan harian dan/atau mingguan
- nama mata pelajaran
- jam mulai dan jam selesai
- nama guru pengajar
- rombel atau kelas terkait

### 8.4 Kehadiran / Absensi

Menampilkan riwayat kehadiran siswa yang sudah diinput pada sistem utama.

Kebutuhan MVP:
- daftar absensi harian
- status kehadiran: hadir, sakit, izin, alfa
- filter periode waktu sederhana
- ringkasan rekap kehadiran

### 8.5 Nilai Akademik

Menampilkan perkembangan nilai siswa dari data sistem utama.

Kebutuhan MVP:
- daftar nilai per mata pelajaran
- nilai per semester aktif atau semester yang dipilih
- jika tersedia, tampilkan komponen nilai sebagai rincian

### 8.6 Rapor Semester

Menampilkan hasil rapor siswa sebagai informasi akademik resmi.

Kebutuhan MVP:
- daftar rapor per semester
- detail nilai rapor per mata pelajaran
- catatan wali kelas
- status rapor, misalnya draft atau final
- jika tersedia, akses ke versi unduh / cetak

### 8.7 Multi-Anak untuk Wali Siswa

Fitur khusus wali siswa untuk melihat lebih dari satu anak dalam satu akun.

Kebutuhan MVP:
- daftar anak yang terhubung
- berpindah konteks anak dengan cepat
- seluruh halaman menyesuaikan berdasarkan anak yang dipilih

### 8.8 Notifikasi Akademik Penting

Memberikan pemberitahuan terhadap pembaruan akademik yang relevan.

Contoh notifikasi:
- absensi baru tercatat
- nilai baru tersedia
- rapor semester telah final
- perubahan jadwal yang signifikan

Catatan:
- pada MVP, notifikasi dapat dimulai dari in-app notification terlebih dahulu

---

## 9. Workflow Utama Pengguna

Dokumen ini menggunakan satu workflow utama karena PWA berfokus pada akses informasi akademik, bukan operasional data.

### Workflow Utama

1. Pengguna login ke PWA.
2. Sistem mengenali role pengguna sebagai `siswa` atau `wali_siswa`.
3. Jika pengguna adalah wali siswa dan memiliki lebih dari satu anak, pengguna memilih profil anak yang ingin dilihat.
4. Pengguna masuk ke Dashboard untuk melihat ringkasan akademik.
5. Dari Dashboard, pengguna menavigasi ke informasi detail sesuai kebutuhan:
   - jadwal pelajaran
   - absensi
   - nilai
   - rapor
6. Pengguna kembali ke Dashboard atau berpindah ke anak lain jika diperlukan.
7. Pengguna menerima notifikasi saat ada pembaruan akademik penting.

### Implikasi Desain

- Dashboard harus menjadi pusat orientasi utama.
- Navigasi harus sederhana dan konsisten.
- Pergantian konteks anak untuk wali siswa harus mudah ditemukan.
- Informasi penting harus bisa dipahami cepat tanpa banyak langkah.

---

## 10. User Stories MVP

### Sebagai Siswa

- Saya ingin melihat jadwal pelajaran hari ini agar saya tahu pelajaran yang akan diikuti.
- Saya ingin melihat riwayat kehadiran saya agar saya tahu status absensi saya.
- Saya ingin melihat nilai saya agar saya bisa memantau hasil belajar.
- Saya ingin melihat rapor saya agar saya tahu hasil akademik per semester.

### Sebagai Wali Siswa

- Saya ingin melihat ringkasan akademik anak saya agar saya dapat memantau kondisinya dengan cepat.
- Saya ingin melihat absensi anak saya agar saya tahu kehadirannya di sekolah.
- Saya ingin melihat nilai dan rapor anak saya agar saya dapat memantau perkembangan akademiknya.
- Saya ingin berpindah antar profil anak dalam satu akun agar saya dapat memantau semua anak saya dengan mudah.

---

## 11. Arsitektur Informasi

### Struktur Halaman Utama MVP

- `Login`
- `Dashboard`
- `Jadwal`
- `Absensi`
- `Nilai`
- `Rapor`
- `Profil Siswa`
- `Pilih Anak` untuk role `wali_siswa`
- `Notifikasi`

### Navigasi Utama

Navigasi utama PWA harus sederhana, konsisten, dan mudah dipahami dalam konteks mobile.

Rekomendasi menu utama:
- `Beranda`
- `Jadwal`
- `Absensi`
- `Nilai`
- `Rapor`

Rekomendasi akses sekunder:
- `Profil`
- `Pilih Anak` untuk wali siswa
- `Notifikasi`
- `Logout`

### Hierarki Informasi

1. Pengguna masuk ke `Dashboard` sebagai titik orientasi utama.
2. Informasi terpenting yang perlu muncul pertama adalah konteks siswa aktif, jadwal hari ini, dan status akademik terkini.
3. Informasi detail dikelompokkan per topik agar pengguna tidak harus memahami struktur backend akademik.
4. Untuk wali siswa, konteks anak aktif harus selalu terlihat di area atas atau header halaman.

### Prinsip Navigasi

- Maksimal 1 sampai 2 langkah dari dashboard ke informasi penting.
- Konteks siswa aktif harus persisten saat pengguna berpindah halaman.
- Istilah menu harus menggunakan bahasa yang familier bagi siswa dan wali siswa.
- Struktur informasi tidak boleh menampilkan istilah internal yang membingungkan jika tidak diperlukan.

---

## 12. Detail Kebutuhan Per Halaman

### 12.1 Login

Tujuan halaman:
- memfasilitasi pengguna masuk ke sistem secara aman

Konten utama:
- input identitas login
- input kata sandi
- tombol masuk
- pesan kesalahan bila login gagal

Perilaku utama:
- jika login berhasil, pengguna diarahkan ke dashboard
- jika akun memiliki role wali siswa dengan lebih dari satu anak, sistem dapat langsung menampilkan anak terakhir yang dipilih atau mengarahkan ke pemilihan anak

### 12.2 Dashboard

Tujuan halaman:
- memberikan gambaran ringkas dan cepat tentang kondisi akademik siswa aktif

Konten utama:
- identitas siswa aktif
- nama sekolah atau unit
- kelas atau rombel aktif
- semester aktif
- kartu jadwal hari ini
- kartu kehadiran terbaru
- kartu ringkasan nilai
- kartu status rapor

Perilaku utama:
- setiap kartu harus dapat mengarahkan pengguna ke halaman detail terkait
- jika data kosong, sistem menampilkan empty state yang jelas

### 12.3 Jadwal

Tujuan halaman:
- menampilkan aktivitas belajar siswa berdasarkan jadwal resmi

Konten utama:
- daftar jadwal per hari
- nama mata pelajaran
- jam mulai dan selesai
- nama guru
- informasi kelas atau rombel

Perilaku utama:
- pengguna dapat melihat jadwal hari ini dengan cepat
- pengguna dapat berpindah ke hari lain atau tampilan minggu jika data tersedia

### 12.4 Absensi

Tujuan halaman:
- memberikan visibilitas terhadap kehadiran siswa

Konten utama:
- daftar kehadiran per tanggal
- status kehadiran
- keterangan bila tersedia
- rekap sederhana total hadir, sakit, izin, alfa

Perilaku utama:
- pengguna dapat memfilter data berdasarkan rentang waktu sederhana
- pengguna dapat memahami pola kehadiran tanpa membaca seluruh daftar detail

### 12.5 Nilai

Tujuan halaman:
- menampilkan perkembangan hasil belajar siswa

Konten utama:
- daftar mata pelajaran
- nilai utama per mata pelajaran
- semester aktif atau semester pilihan
- rincian komponen nilai bila tersedia

Perilaku utama:
- pengguna dapat memahami performa belajar tanpa harus melihat struktur penilaian yang kompleks
- jika hanya ada nilai akhir, halaman tetap harus informatif

### 12.6 Rapor

Tujuan halaman:
- memberikan akses ke hasil rapor sebagai informasi akademik resmi

Konten utama:
- daftar rapor berdasarkan semester
- status rapor
- nilai rapor per mata pelajaran
- catatan wali kelas
- catatan kepala sekolah jika tersedia
- tombol unduh atau lihat dokumen jika tersedia

Perilaku utama:
- pengguna dapat berpindah antar semester
- status rapor harus terlihat jelas agar pengguna tahu apakah rapor sudah final

### 12.7 Profil Siswa

Tujuan halaman:
- menampilkan konteks identitas akademik siswa aktif

Konten utama:
- nama lengkap siswa
- unit sekolah
- kelas atau rombel
- semester aktif
- wali kelas

Perilaku utama:
- halaman ini bersifat informatif dan tidak menyediakan edit data pada MVP

### 12.8 Pilih Anak

Tujuan halaman:
- memudahkan wali siswa berpindah antar anak yang terhubung ke akun

Konten utama:
- daftar anak
- identitas ringkas setiap anak
- indikator anak aktif

Perilaku utama:
- setelah memilih anak, seluruh konteks aplikasi harus diperbarui
- pilihan anak aktif sebaiknya dipertahankan selama sesi berjalan

### 12.9 Notifikasi

Tujuan halaman:
- menampilkan pembaruan akademik penting secara terpusat

Konten utama:
- daftar notifikasi terbaru
- jenis notifikasi
- waktu notifikasi
- tautan ke halaman terkait

Perilaku utama:
- notifikasi harus dapat membuka konteks data yang relevan
- notifikasi yang sudah dibuka sebaiknya ditandai berbeda dari yang belum dibuka

---

## 13. Kebutuhan Data dan Integrasi

PWA ini bergantung pada data dari sistem akademik utama. Modul data yang paling relevan untuk MVP adalah:

- `peserta_didik`
- `orang_tua`
- `rombongan_belajar`
- `jadwal_pelajaran`
- `absensi` dan `absensi_detail`
- `nilai` dan `komponen_nilai`
- `rapor` dan `rapor_nilai`
- `semester`, `periode`, `kelas`, `guru`, `mata_pelajaran`

### Kebutuhan Integrasi

- Endpoint autentikasi untuk `siswa` dan `wali_siswa`.
- Endpoint profil siswa aktif.
- Endpoint daftar anak untuk akun wali siswa.
- Endpoint dashboard ringkasan.
- Endpoint jadwal pelajaran.
- Endpoint absensi.
- Endpoint nilai.
- Endpoint rapor.
- Endpoint notifikasi akademik.

### Aturan Akses Data

- Siswa hanya dapat melihat data miliknya sendiri.
- Wali siswa hanya dapat melihat data anak yang terhubung secara resmi ke akunnya.
- Semua akses harus mengikuti kontrol otorisasi dari sistem utama.

---

## 14. Kebutuhan Non-Fungsional

### Performa

- Halaman utama harus terasa cepat dibuka pada koneksi mobile.
- Data ringkasan utama harus diprioritaskan lebih dulu dibanding data detail.

### Responsif

- UI dioptimalkan untuk perangkat mobile.
- Tetap dapat digunakan dengan baik pada tablet dan desktop.

### PWA

- Dapat dipasang ke home screen.
- Mendukung pengalaman seperti aplikasi mobile.
- Memiliki caching dasar untuk aset statis.

### Keamanan

- Autentikasi aman.
- Otorisasi berbasis role dan relasi data.
- Tidak boleh ada data siswa lain yang terbuka lintas akun.

### Ketersediaan Informasi

- Jika data tertentu belum tersedia dari sistem utama, UI harus menampilkan status kosong yang jelas.
- Sinkronisasi data mengikuti ketersediaan backend utama.

---

## 15. Batasan dan Asumsi

### Batasan

- PWA bergantung pada kesiapan API atau sumber data dari sistem akademik utama.
- Role `siswa` dan `wali_siswa` perlu didefinisikan secara eksplisit di sisi sistem utama jika belum tersedia.
- Fitur notifikasi push native mungkin belum masuk tahap awal jika infrastruktur belum siap.

### Asumsi

- Sistem utama sudah atau akan memiliki relasi data yang cukup antara akun, siswa, dan wali siswa.
- Data absensi, nilai, rapor, dan jadwal dihasilkan dari proses operasional internal sekolah.
- PWA tidak menjadi tempat input atau koreksi data akademik.

---

## 16. Acceptance Criteria MVP

### 16.1 Login dan Akses Pengguna

- Pengguna dengan akun valid dapat login ke PWA.
- Pengguna dengan akun tidak valid menerima pesan kesalahan yang jelas.
- Siswa hanya dapat mengakses data miliknya sendiri.
- Wali siswa hanya dapat mengakses data anak yang terhubung ke akunnya.
- Pengguna dapat logout dengan sukses.

### 16.2 Dashboard

- Setelah login, pengguna masuk ke dashboard.
- Dashboard menampilkan identitas siswa aktif dengan benar.
- Dashboard menampilkan minimal ringkasan jadwal, absensi, nilai, dan rapor.
- Setiap ringkasan memiliki tautan atau aksi menuju detail.
- Jika salah satu data belum tersedia, sistem menampilkan empty state yang jelas.

### 16.3 Jadwal

- Pengguna dapat melihat jadwal pelajaran siswa aktif.
- Jadwal menampilkan mata pelajaran, waktu, dan guru jika tersedia.
- Jadwal hari ini dapat diakses dengan cepat tanpa filter kompleks.
- Jika tidak ada jadwal pada hari tertentu, sistem menampilkan status kosong yang informatif.

### 16.4 Absensi

- Pengguna dapat melihat riwayat absensi siswa aktif.
- Setiap entri absensi menampilkan tanggal dan status kehadiran.
- Rekap dasar absensi tersedia dan mudah dipahami.
- Pengguna dapat memfilter absensi berdasarkan periode sederhana.

### 16.5 Nilai

- Pengguna dapat melihat nilai siswa aktif berdasarkan semester.
- Nilai ditampilkan minimal per mata pelajaran.
- Jika data komponen nilai tersedia, rincian dapat ditampilkan tanpa membingungkan pengguna.
- Jika data nilai belum tersedia, sistem menampilkan status kosong yang jelas.

### 16.6 Rapor

- Pengguna dapat melihat daftar rapor per semester.
- Pengguna dapat membuka detail rapor semester tertentu.
- Status rapor terlihat jelas, misalnya draft atau final.
- Catatan wali kelas tampil jika tersedia.
- Jika dokumen rapor tersedia, pengguna dapat membuka atau mengunduhnya.

### 16.7 Multi-Anak untuk Wali Siswa

- Wali siswa yang memiliki lebih dari satu anak dapat melihat daftar anak yang terhubung.
- Wali siswa dapat mengganti anak aktif tanpa perlu login ulang.
- Setelah anak aktif diganti, semua halaman menampilkan data anak yang benar.
- Identitas anak aktif selalu terlihat jelas pada konteks aplikasi.

### 16.8 Notifikasi

- Pengguna dapat melihat daftar notifikasi akademik terbaru.
- Setiap notifikasi dapat membuka halaman detail yang relevan.
- Sistem dapat membedakan notifikasi sudah dibaca dan belum dibaca.
- Jika belum ada notifikasi, sistem menampilkan status kosong yang jelas.

---

## 17. Prioritas Rilis

### MVP

- login
- dashboard ringkasan
- jadwal pelajaran
- absensi
- nilai
- rapor
- multi-anak untuk wali siswa

### Fase Setelah MVP

- notifikasi akademik yang lebih kaya
- unduh rapor
- riwayat akademik lintas semester yang lebih lengkap
- informasi ekskul
- personalisasi tampilan ringkasan

---

## 18. Indikator Keberhasilan

- Pengguna dapat login dan mengakses data akademik yang sesuai dengan perannya.
- Wali siswa dapat memantau lebih dari satu anak dalam satu akun tanpa kebingungan.
- Pengguna dapat menemukan jadwal, absensi, nilai, dan rapor dengan langkah yang singkat.
- Informasi akademik utama dapat diakses dengan nyaman melalui perangkat mobile.
- Tidak ada akses silang ke data siswa yang bukan hak pengguna.

---

## 19. Ringkasan Scope Final

PWA ini adalah portal informasi akademik untuk `siswa` dan `wali siswa` yang menampilkan informasi kegiatan belajar mengajar dan hasil akademik dari sistem utama BIS.

Fokus MVP adalah:
- melihat jadwal pelajaran
- memantau kehadiran
- melihat nilai
- mengakses rapor
- memantau lebih dari satu anak untuk akun wali siswa

Produk ini harus sederhana, cepat, mobile-first, dan terintegrasi dengan sistem akademik utama sebagai sumber data tunggal.
