"use client"

import Link from "next/link"
import { LayoutDashboard, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { canAccessAdmin } from "@/components/portal/nav-config"

interface WorkspaceSwitcherProps {
  current: "portal" | "admin"
  className?: string
  compact?: boolean
}

export function WorkspaceSwitcher({ current, className, compact = false }: WorkspaceSwitcherProps) {
  const { user } = useAuth()
  if (!canAccessAdmin(user?.role)) return null

  if (compact) {
    const href = current === "portal" ? "/admin" : "/portal"
    const label = current === "portal" ? "Admin" : "Portal"
    const Icon = current === "portal" ? Shield : LayoutDashboard
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
          current === "portal"
            ? "bg-white/20 text-white hover:bg-white/30 lg:bg-transparent lg:text-neutral-700 lg:hover:bg-neutral-100 lg:hover:text-leo-primary"
            : "bg-amber-50 text-leo-primary hover:bg-amber-100",
          className,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Link>
    )
  }

  return (
    <div className={cn("inline-flex rounded-md border border-border/80 bg-white p-0.5 text-sm shadow-sm", className)}>
      <Link
        href="/portal"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 font-medium transition-colors",
          current === "portal" ? "bg-leo-primary text-white shadow-sm" : "text-neutral-600 hover:text-leo-primary",
        )}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Portal
      </Link>
      <Link
        href="/admin"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 font-medium transition-colors",
          current === "admin" ? "bg-leo-primary text-white shadow-sm" : "text-neutral-600 hover:text-leo-primary",
        )}
      >
        <Shield className="h-3.5 w-3.5" />
        Admin
      </Link>
    </div>
  )
}
