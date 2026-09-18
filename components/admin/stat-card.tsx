import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const accentStyles = {
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-sky-50 text-sky-600",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-rose-50 text-rose-600",
  orange: "bg-orange-50 text-orange-600",
} as const

interface AdminStatCardProps {
  title: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: keyof typeof accentStyles
  loading?: boolean
  className?: string
}

export function AdminStatCard({
  title,
  value,
  hint,
  icon: Icon,
  accent = "amber",
  loading = false,
  className,
}: AdminStatCardProps) {
  return (
    <Card className={cn("rounded-md border-border/60 shadow-sm hover:shadow-md", className)}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 break-words text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">{value}</p>
          )}
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("rounded-md p-2.5", accentStyles[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
