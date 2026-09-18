"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Award, CheckCircle, CreditCard, GraduationCap, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { usePlatformSettings } from "@/lib/hooks/use-settings"
import { PaymentsTable } from "@/components/payments/payments-table"
import { initiatePayment } from "@/lib/paychangu/client"
import { useToast } from "@/hooks/use-toast"
import { amountForPeriod, billingFromSettings, coverageFor, memberPaidInRange, periodLabel, toIsoDate } from "@/lib/membership/billing"
import type { FeePeriod } from "@/lib/types"
import { formatDate, formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"
import { SAMPLE_PAYMENTS } from "@/lib/payments/defaults"
import { feeToRecord } from "@/lib/payments/receipt"
import { Alert, AlertDescription } from "@/components/ui/alert"

const periods: FeePeriod[] = ["monthly", "semester", "yearly"]

export default function MembershipPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: settings } = usePlatformSettings()
  const { data: fees = [], isLoading: feesLoading } = useMembershipFees(user?.id, true)
  const billing = billingFromSettings(settings)
  const [paying, setPaying] = useState<FeePeriod | null>(null)
  const usingSampleHistory = !feesLoading && fees.length === 0
  const history = usingSampleHistory
    ? SAMPLE_PAYMENTS.filter((record) => record.kind !== "donation")
    : fees.map((fee) => feeToRecord(fee, user))

  const now = new Date()
  const paidByPeriod = useMemo(() => {
    return Object.fromEntries(
      periods.map((period) => {
        const range = coverageFor(period, now, billing)
        return [period, user ? memberPaidInRange(fees, user.id, range.start, range.end) : false]
      }),
    ) as Record<FeePeriod, boolean>
  }, [billing, fees, now, user])

  const handlePay = async (period: FeePeriod) => {
    if (!user) return
    const amount = amountForPeriod(period, billing)
    const range = coverageFor(period, now, billing)
    setPaying(period)
    try {
      const result = await initiatePayment({
        amount,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: "MWK",
        purpose: "membership",
        userId: user.id,
        period,
        coverageStart: toIsoDate(range.start),
        coverageEnd: toIsoDate(range.end),
        dueDate: toIsoDate(range.end),
        returnUrl: `${window.location.origin}/portal/membership/return`,
        customization: {
          title: `Leo Club ${periodLabel(period)} membership`,
          description: `${periodLabel(period)} fee of ${formatMoney(amount)}`,
        },
      })
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
        return
      }
      toast({
        title: "Payment error",
        description: result.error || "Could not start payment.",
        variant: "destructive",
      })
    } catch {
      toast({ title: "Payment error", description: "Try again in a moment.", variant: "destructive" })
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      {user?.membershipStatus === "pending" ? (
        <Card className="border-none bg-amber-50 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-amber-950">Waiting for admin approval</h3>
            <p className="mt-1 text-sm text-amber-900">
              Your joining request is with club leadership. You can still complete training while you wait.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {user?.membershipType === "prospective-leo" ? (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-amber-100 p-2 text-amber-700">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">New member training</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  This is the only training program for new members. Pass each module quiz with at least 50% to become a
                  full Leo.
                </p>
                <Button asChild className="mt-4 rounded-md bg-leo-primary text-white">
                  <Link href="/portal/training">Continue training</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="overflow-hidden border-none bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white shadow-lg">
        <CardContent className="relative p-6">
          <div className="mb-4 flex items-center justify-between">
            <Badge className="border-none bg-white text-[#DC2626]">
              {user?.membershipType === "leo" ? "Leo member" : "Prospective member"}
            </Badge>
            <Award className="h-8 w-8" />
          </div>
          <h2 className="mb-1 break-words text-2xl font-bold">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="mb-4 opacity-90">ID: {user?.leoId}</p>
          <p className="text-sm opacity-90">Status: {user?.membershipStatus ?? "active"}</p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className={`text-xl font-semibold ${portalCanvasTitle}`}>Pay membership fee</h2>
          <p className={`mt-1 text-sm ${portalCanvasMuted}`}>
            Choose monthly, semester, or yearly. Semester dates are set by admin
            {billing.semesterStart ? ` (${formatDate(billing.semesterStart)} – ${formatDate(billing.semesterEnd)})` : ""}.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {periods.map((period) => {
            const paid = paidByPeriod[period]
            const amount = amountForPeriod(period, billing)
            return (
              <Card key={period} className="border-none bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-neutral-500">{periodLabel(period)}</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-900">{formatMoney(amount)}</p>
                  {paid ? (
                    <p className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4" />
                      Paid for this period
                    </p>
                  ) : (
                    <Button
                      className="mt-3 w-full rounded-md bg-leo-primary text-white"
                      onClick={() => handlePay(period)}
                      disabled={paying !== null}
                    >
                      {paying === period ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      Pay now
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Payment history</h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/portal/payments">All payments</Link>
            </Button>
          </div>
          {usingSampleHistory ? (
            <Alert className="mb-3">
              <AlertDescription>
                Example membership and joining receipts until your first PayChangu payment is recorded.
              </AlertDescription>
            </Alert>
          ) : null}
          <PaymentsTable records={history} />
        </CardContent>
      </Card>
    </div>
  )
}
