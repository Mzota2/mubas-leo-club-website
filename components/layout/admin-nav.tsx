"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, DollarSign, Calendar, Settings, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { Logo } from "@/components/ui/logo"

export function AdminNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "Dashboard" },
    { href: "/admin/members", icon: Users, label: "Members" },
    { href: "/admin/donations", icon: DollarSign, label: "Donations" },
    { href: "/admin/events", icon: Calendar, label: "Events" },
    { href: "/admin/gallery", icon: ImageIcon, label: "Gallery" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size="sm" showText={true} textClassName="text-xl" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      isActive ? "text-leo-primary" : "text-gray-600 hover:text-leo-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName} ({user?.position})
          </div>
        </div>
      </div>
    </nav>
  )
}
