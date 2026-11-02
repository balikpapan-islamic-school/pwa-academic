import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BisLogo } from '@/components/bis-logo'
import { features } from '@/config/app'

export const ONBOARDING_STORAGE_KEY = 'pwa-academic-onboarding-seen'

function markOnboardingSeen() {
    try {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
    } catch {
        // Storage bisa diblokir; onboarding cukup tampil lagi di kunjungan berikutnya.
    }
}

// Elemen SVG dianimasikan per bagian; transform-box agar rotasi/skala berporos di elemen itu sendiri.
const svgPart = 'motion-safe:[transform-box:fill-box] motion-safe:[transform-origin:center]'

function OnboardingIllustration() {
    return (
        <svg width="300" height="270" viewBox="0 0 300 270" aria-hidden="true" className="h-auto w-full max-w-[300px] overflow-visible">
            <circle cx="150" cy="150" r="118" fill="#FFE9C7" className={`${svgPart} motion-safe:animate-pop-in`} />
            <path d="M48 52 Q48 64 60 64 Q48 64 48 76 Q48 64 36 64 Q48 64 48 52Z" fill="#FBC93D" className={`${svgPart} motion-safe:animate-twinkle`} />
            <path d="M252 140 Q252 150 262 150 Q252 150 252 160 Q252 150 242 150 Q252 150 252 140Z" fill="#8F7CF2" className={`${svgPart} motion-safe:animate-twinkle motion-safe:[animation-delay:0.8s]`} />
            <circle cx="244" cy="58" r="7" fill="#F58E86" className={`${svgPart} motion-safe:animate-float motion-safe:[animation-delay:0.4s]`} />
            <circle cx="40" cy="190" r="6" fill="#45BFB4" className={`${svgPart} motion-safe:animate-float motion-safe:[animation-delay:1.2s]`} />
            <g className={`${svgPart} motion-safe:animate-pop-in motion-safe:[animation-delay:0.5s]`}>
                <rect x="62" y="218" width="176" height="36" rx="10" fill="#8F7CF2" />
                <rect x="74" y="227" width="152" height="6" rx="3" fill="#FFFFFF" opacity="0.55" />
            </g>
            <g className={`${svgPart} motion-safe:animate-pop-in motion-safe:[animation-delay:0.65s]`}>
                <rect x="78" y="184" width="146" height="34" rx="10" fill="#45BFB4" />
                <rect x="90" y="193" width="122" height="6" rx="3" fill="#FFFFFF" opacity="0.55" />
            </g>
            <g className={`${svgPart} motion-safe:animate-pop-in motion-safe:[animation-delay:0.8s]`}>
                <rect x="58" y="150" width="168" height="34" rx="10" fill="#F58E86" />
                <rect x="70" y="159" width="144" height="6" rx="3" fill="#FFFFFF" opacity="0.55" />
            </g>
            <g className={`${svgPart} motion-safe:animate-pop-in motion-safe:[animation-delay:1s]`}>
                <g className="motion-safe:animate-float motion-safe:[animation-delay:1.7s]">
                    <path d="M108 104v26c0 14 84 14 84 0v-26l-42 16z" fill="#2B2B2B" />
                    <path d="M150 60 232 92 150 124 68 92z" fill="#111111" />
                    <path d="M150 92 212 100v38" fill="none" stroke="#FBC93D" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="212" cy="142" r="7" fill="#FBC93D" />
                </g>
            </g>
        </svg>
    )
}

// Muncul bertahap dari bawah; tanpa animasi bila pengguna memilih reduced motion.
const enter = 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:fill-mode-both'

export default function Onboarding() {
    return (
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-[#FFFBF4] px-7 pb-9 pt-14 text-ink">
            <div aria-hidden="true" className="absolute -left-[60px] top-10 size-[140px] rounded-full bg-[#FFE9C7] motion-safe:animate-drift" />
            <div aria-hidden="true" className="absolute -right-20 top-[430px] size-[220px] rounded-full bg-[#F3E8FF] motion-safe:animate-drift motion-safe:[animation-delay:-4s]" />

            <div className={`relative flex items-center gap-2.5 ${enter}`}>
                <BisLogo className="h-[46px]" />
                <span className="font-display text-[15px] font-semibold leading-[1.15]">Balikpapan<br />Islamic School</span>
            </div>

            <h1 className={`relative mt-9 font-display text-[42px] font-bold leading-[1.05] tracking-[-0.5px] ${enter} motion-safe:delay-150`}>
                Belajar Seru,<br />Prestasi <span className="text-primary">Melaju</span>
            </h1>
            <p className={`relative mt-3.5 max-w-[310px] text-base leading-normal text-subtle ${enter} motion-safe:delay-300`}>
                {features.payments
                    ? 'Pantau nilai, kehadiran, jadwal, dan pembayaran sekolah dalam satu aplikasi yang ramah dan mudah.'
                    : 'Pantau nilai, kehadiran, dan jadwal sekolah dalam satu aplikasi yang ramah dan mudah.'}
            </p>

            <div className="relative flex flex-grow items-center justify-center py-6">
                <OnboardingIllustration />
                <p className={`absolute right-0 top-[18px] ${enter} motion-safe:delay-1000`}>
                    <span className="block -rotate-[8deg] text-center font-hand text-[22px] leading-[1.05] text-[#3F3A6B] motion-safe:animate-wiggle">
                        Belajar.<br />Tumbuh.<br />Berprestasi.
                    </span>
                </p>
            </div>

            <div className={`relative ${enter} motion-safe:delay-500`}>
                <Link
                    to="/login"
                    onClick={markOnboardingSeen}
                    className="group flex h-[58px] items-center justify-center gap-2.5 rounded-full bg-ink text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition-transform active:scale-[0.97]">
                    Mulai Sekarang
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
                </Link>
                <p className="mt-[18px] text-center text-[15px] text-subtle">
                    Sudah punya akun? <Link to="/login" onClick={markOnboardingSeen} className="font-extrabold text-primary">Masuk</Link>
                </p>
            </div>
        </div>
    )
}
