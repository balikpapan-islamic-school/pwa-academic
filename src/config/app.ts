type AppConfigType = {
    name: string,
    github: {
        title: string,
        url: string
    },
    author: {
        name: string,
        url: string
    },
}

export const appConfig: AppConfigType = {
    name: import.meta.env.VITE_APP_NAME || 'BIS - Student',
    github: {
        title: 'PWA - ACADEMIC',
        url: 'https://github.com/balikpapan-islamic-school/pwa-academic',
    },
    author: {
        name: 'Balikpapan Islamic School',
        url: 'https://github.com/balikpapan-islamic-school',
    }
}

// Fitur yang sementara disembunyikan dari UI; ubah ke true untuk menampilkan kembali.
export const features = {
    payments: false,
}

// SPMB dikelola sistem terpisah; banner di Beranda (wali belum terhubung) hanya menautkan ke sana.
// Banner disembunyikan bila URL pendaftaran tidak diisi.
export const spmb = {
    // `||` agar nilai kosong dari build args Docker tetap memakai bawaan.
    schoolYear: import.meta.env.VITE_SPMB_SCHOOL_YEAR || '2027/2028',
    registrationUrl: import.meta.env.VITE_SPMB_URL ?? '',
}

// Versi aplikasi yang sedang berjalan (lihat `define` di vite.config.ts); commit kosong bila build tanpa git/SOURCE_COMMIT.
export const appVersion = {
    version: __APP_VERSION__,
    commit: __APP_COMMIT__,
    builtAt: __APP_BUILD_TIME__,
}

export const baseUrl = import.meta.env.VITE_BASE_URL ?? ""
