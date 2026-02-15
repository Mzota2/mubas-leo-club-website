import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
  textClassName?: string
}

export function Logo({ size = "md", showText = true, className, textClassName }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
    xl:"h-24 w-24"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: 'text-xl'
  }

  return (
    <div className={cn("flex items-center gap-2 md:gap-3 group", className)}>
      <div className={cn(
        "relative rounded-full overflow-hidden  group-hover:scale-110 transition-transform duration-300",
        sizeClasses[size]
      )}>
        <Image
          src="/logo.jpeg"
          alt="MUBAS Leo Club Logo"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 32px, (max-width: 1200px) 40px, 48px"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-leo-primary hidden sm:inline",
          textSizes[size],
          textClassName
        )}>
          MUBAS Leo Club
        </span>
      )}
    </div>
  )
}
