import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

interface AdminEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <Empty className="rounded-md border border-dashed bg-white/60">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="rounded-md">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
