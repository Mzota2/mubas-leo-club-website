import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PortalHeader } from "@/components/layout/portal-header"
import { PortalNav } from "@/components/layout/portal-nav"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#F59E0B] via-[#DC2626] to-[#991B1B] pb-20">
        <PortalHeader />
        <main className="container max-w-screen-sm mx-auto">{children}</main>
        <PortalNav />
      </div>
    </ProtectedRoute>
  )
}
