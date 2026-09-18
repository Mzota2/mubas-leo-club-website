"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/use-auth"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { usePlatformSettings } from "@/lib/hooks/use-settings"
import { initiatePayment } from "@/lib/paychangu/client"
import { useToast } from "@/hooks/use-toast"
import { billingFromSettings, coverageFor, hasPaidJoiningFee, toIsoDate } from "@/lib/membership/billing"
import { formatMoney } from "@/lib/utils/format"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

export default function JoinFeePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: settings } = usePlatformSettings()
  const { data: fees = [] } = useMembershipFees(user?.id)
  const billing = billingFromSettings(settings)
  const [paying, setPaying] = useState(false)
  const paid = user ? hasPaidJoiningFee(fees, user.id, user) : false

  useEffect(() => {
    if (!user) return
    if (user.membershipType !== "prospective-leo") {
      router.replace("/portal")
      return
    }
    if (paid) router.replace("/portal/training")
  }, [paid, router, user])

  const handlePay = async () => {
    if (!user) return
    const amount = billing.joiningFee
    const range = coverageFor("joining", new Date(), billing)
    setPaying(true)
    try {
      const result = await initiatePayment({
        amount,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: "MWK",
        purpose: "joining",
        userId: user.id,
        period: "joining",
        coverageStart: toIsoDate(range.start),
        coverageEnd: toIsoDate(range.end),
        dueDate: toIsoDate(range.end),
        returnUrl: `${window.location.origin}/portal/join-fee/return`,
        customization: {
          title: "Leo Club joining fee",
          description: `Once-off joining fee of ${formatMoney(amount)}`,
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
      setPaying(false)
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <div>
        <h1 className={`text-2xl font-semibold ${portalCanvasTitle}`}>Joining fee</h1>
        <p className={`mt-1 text-sm ${portalCanvasMuted}`}>
          Prospective members pay this once-off fee before taking training quizzes. It is separate from monthly, semester, or yearly membership dues.
        </p>
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-amber-100 p-2 text-amber-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500">Once-off joining fee</p>
              <p className="mt-1 text-3xl font-semibold text-neutral-900">{formatMoney(billing.joiningFee)}</p>
              <p className="mt-2 text-sm text-neutral-600">
                After payment you can start the new member training program and take each module quiz.
              </p>
              <Button
                className="mt-5 w-full rounded-md bg-leo-primary text-white sm:w-auto"
                onClick={handlePay}
                disabled={paying || paid}
              >
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Pay joining fee
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className={`text-sm ${portalCanvasMuted}`}>
        Already paid outside the platform? Ask an admin to mark your joining fee as paid.{" "}
        <Link href="/portal/training" className="underline">
          View training
        </Link>
      </p>
    </div>
  )
}
