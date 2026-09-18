import type React from "react"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { RoleGate } from "@/components/auth/role-gate"
import { AdminShell } from "@/components/admin/shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F3EE] p-6">
      <Card className="max-w-md rounded-md border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 rounded-full bg-rose-50 p-3 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is limited to club leaders and administrators. Return to the member portal to continue.
          </p>
          <Button asChild className="mt-6 bg-leo-primary text-white hover:bg-leo-primary-dark">
            <Link href="/portal">Go to member portal</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <RoleGate allowedRoles={["leader", "admin"]} fallback={<AccessDenied />}>
        <AdminShell>{children}</AdminShell>
      </RoleGate>
    </ProtectedRoute>
  )
}
