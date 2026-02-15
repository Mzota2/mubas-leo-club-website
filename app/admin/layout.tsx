import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { RoleGate } from "@/components/auth/role-gate"
import { AdminNav } from "@/components/layout/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <RoleGate allowedRoles={["leader", "admin"]}>
        <div className="min-h-screen bg-gray-50">
          <AdminNav />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </RoleGate>
    </ProtectedRoute>
  )
}
