import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Ikon PWA dari logo resmi BIS (public/logo.svg). Jalankan ulang `npm run generate-pwa-assets` bila logo berubah.
// Ikon maskable & Apple diberi latar putih karena launcher memotong ikon menjadi lingkaran/rounded square.
// Padding maskable 0.42 agar seluruh logo (termasuk sudut pita nama sekolah) masuk safe zone lingkaran 80%.
export default defineConfig({
    headLinkOptions: {
        preset: '2023',
    },
    preset: {
        ...minimal2023Preset,
        maskable: {
            ...minimal2023Preset.maskable,
            padding: 0.42,
            resizeOptions: { background: '#FFFFFF' },
        },
        apple: {
            ...minimal2023Preset.apple,
            resizeOptions: { background: '#FFFFFF' },
        },
    },
    images: ['public/logo.svg'],
})
