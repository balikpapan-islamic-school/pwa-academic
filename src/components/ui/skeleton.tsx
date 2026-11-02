import { cn } from "@/lib/utils"

// Warna tulang mengikuti permukaan di bawahnya: kartu putih, kartu gelap/hijau, atau ubin pastel.
const toneClasses = {
  default: "bg-muted before:via-white/70",
  inverse: "bg-white/15 before:via-white/15",
  pastel: "bg-white/55 before:via-white/60",
}

type SkeletonProps = React.ComponentProps<"div"> & {
  tone?: keyof typeof toneClasses
}

function Skeleton({ className, tone = "default", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-linear-to-r before:from-transparent before:to-transparent motion-reduce:before:hidden",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
