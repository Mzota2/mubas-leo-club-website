import { cn } from "@/lib/utils"

export const portalCanvasTitle = "text-white lg:text-neutral-900"
export const portalCanvasMuted = "text-white/85 lg:text-muted-foreground"

export function portalChipClass(active: boolean) {
  return cn(
    "shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-white text-leo-primary lg:bg-leo-primary lg:text-white!"
      : "bg-white/15 text-white hover:bg-white/25 lg:border lg:border-border lg:bg-white lg:text-neutral-700 lg:hover:bg-amber-50 lg:hover:text-leo-primary",
  )
}

export const portalTabsListClass =
  "grid w-full grid-cols-2 bg-white/15 lg:border lg:border-border lg:bg-white"

export const portalTabsTriggerClass =
  "data-[state=active]:bg-white data-[state=active]:text-leo-primary lg:data-[state=active]:bg-leo-primary lg:data-[state=active]:text-white"
