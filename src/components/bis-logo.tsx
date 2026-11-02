import { cn } from '@/lib/utils'
import { BIS_LOGO_PRIMARY_PATH, BIS_LOGO_SECONDARY_PATH, BIS_LOGO_VIEWBOX } from './bis-logo-paths'

type BisLogoVariant = 'color' | 'on-primary' | 'mono'

const variantFills: Record<BisLogoVariant, [string, string]> = {
    color: ['#008236', '#111111'],
    'on-primary': ['#FFFFFF', '#FFFFFF'],
    mono: ['currentColor', 'currentColor'],
}

export function BisLogo({ variant = 'color', className }: { variant?: BisLogoVariant, className?: string }) {
    const [primary, secondary] = variantFills[variant]

    return (
        <svg role="img" aria-label="Logo Balikpapan Islamic School" viewBox={BIS_LOGO_VIEWBOX} className={cn('block h-11 w-auto shrink-0', className)}>
            <path fill={primary} fillRule="evenodd" d={BIS_LOGO_PRIMARY_PATH} />
            <path fill={secondary} fillRule="evenodd" d={BIS_LOGO_SECONDARY_PATH} />
        </svg>
    )
}
