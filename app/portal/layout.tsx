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
      <div className="min-h-dvh overflow-x-clip bg-gradient-to-b from-[#F59E0B] via-[#DC2626] to-[#991B1B] lg:bg-none lg:bg-[#F6F3EE] [&_[data-slot=card]]:!rounded-md">
        <PortalHeader />
        <main className="mx-auto w-full max-w-lg min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:max-w-6xl lg:pb-10">
          {children}
        </main>
        <PortalNav />
      </div>
    </ProtectedRoute>
  )
}
