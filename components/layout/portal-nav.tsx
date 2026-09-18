"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { isPortalNavActive, portalMobileNav } from "@/components/portal/nav-config"

export function PortalNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-[#F59E0B] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {portalMobileNav.map((item) => {
          const active = isPortalNavActive(pathname, item.href, item.match)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex h-full min-w-0 flex-1 items-center justify-center"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  active ? "bg-[#DC2626] text-white" : "text-[#7F1D1D]",
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
