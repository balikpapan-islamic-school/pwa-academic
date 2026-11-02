# Deploy ke Coolify

Aplikasi dibangun jadi file statis (Vite) lalu disajikan Nginx di dalam container (`Dockerfile`, `docker/nginx.conf`).

## Langkah

1. Coolify → **New Resource** → pilih repository ini, branch yang akan dirilis.
2. Build pack: **Docker Compose** (file `docker-compose.yml`). Bisa juga **Dockerfile**; port yang diekspos `80`.
3. Isi **Environment Variables** (semuanya dipakai saat build):

   | Variabel | Wajib | Contoh |
   |---|---|---|
   | `VITE_API_BASE_URL` | ya | `https://academic.balikpapanislamicschool.sch.id/api/v1` |
   | `VITE_DATA_SOURCE` | – | `api` (bawaan) |
   | `VITE_APP_NAME` | – | `BIS - Student` |
   | `VITE_GOOGLE_CLIENT_ID` | – | kosong = tombol Google disembunyikan |
   | `VITE_SPMB_URL` | – | kosong = banner SPMB disembunyikan |
   | `VITE_SPMB_SCHOOL_YEAR` | – | `2027/2028` |

   Jika memakai build pack **Dockerfile**, centang **Build Variable** pada tiap variabel di atas.
4. Atur **Domain** untuk service `web` (port 80) dengan `https://`. Coolify mengurus sertifikat SSL.
5. **Deploy**. Health check: `GET /healthz`.

## Penting

- Variabel `VITE_*` ditanam saat build. Mengubah nilainya perlu **Redeploy**, bukan Restart.
- **HTTPS wajib**: service worker (install aplikasi & notifikasi pembaruan) tidak berjalan di HTTP.
- **Login Google**: tambahkan domain produksi ke *Authorized JavaScript origins* di Google Cloud Console.
- **CORS backend**: izinkan origin domain produksi PWA, termasuk untuk signed URL file nilai (dibaca pdf.js).
- Nginx mengirim `Cache-Control: no-cache` untuk `sw.js`, `manifest.webmanifest`, dan `index.html`. Jangan ditimpa cache di proxy/CDN, atau notifikasi "Versi baru tersedia" akan terlambat.
