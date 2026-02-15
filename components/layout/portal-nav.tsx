"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, User, ShoppingCart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function PortalNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/portal", icon: Home, label: "Home" },
    { href: "/portal/search", icon: Search, label: "Search" },
    { href: "/portal/profile", icon: User, label: "Profile" },
    { href: "/portal/shop", icon: ShoppingCart, label: "Shop" },
    { href: "/portal/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#F59E0B] border-t border-[#D97706]">
      <div className="container max-w-screen-sm mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive ? "text-white" : "text-[#FCD34D] hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
