import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

interface PortalPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PortalPageHeader({ title, description, actions, className }: PortalPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <h1 className={cn("text-2xl font-semibold tracking-tight", portalCanvasTitle)}>{title}</h1>
        {description ? <p className={cn("mt-1 text-sm", portalCanvasMuted)}>{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
