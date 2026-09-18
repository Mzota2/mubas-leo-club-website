"use client"

import { useMemo } from "react"
import Link from "next/link"
import { CreditCard, GraduationCap, Heart, ShoppingBag, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentsTable } from "@/components/payments/payments-table"
import { PortalPageHeader } from "@/components/portal/page-header"
import { useAuth } from "@/lib/hooks/use-auth"
import { useMyDonations } from "@/lib/hooks/use-donations"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { useOrders } from "@/lib/hooks/use-orders"
import { SAMPLE_PAYMENTS } from "@/lib/payments/defaults"
import { donationToRecord, feeToRecord, orderToRecord, paymentTotals } from "@/lib/payments/receipt"
import { formatMoney } from "@/lib/utils/format"
import { needsJoiningFee } from "@/lib/membership/billing"
import { portalCanvasMuted } from "@/components/portal/styles"

export default function PortalPaymentsPage() {
  const { user } = useAuth()
  const { data: fees = [], isLoading: feesLoading } = useMembershipFees(user?.id, true)
  const { data: donations = [], isLoading: donationsLoading } = useMyDonations(user?.id, user?.email)
  const { data: orders = [], isLoading: ordersLoading } = useOrders(user?.id, true)

  const liveRecords = useMemo(() => {
    const ownDonations = donations
      .filter((donation) => donation.userId === user?.id || donation.donorEmail?.toLowerCase() === user?.email?.toLowerCase())
      .map(donationToRecord)
    const ownFees = fees.map((fee) => feeToRecord(fee, user))
    const ownOrders = orders.map(orderToRecord)
    return [...ownDonations, ...ownFees, ...ownOrders].sort((a, b) => b.date.localeCompare(a.date))
  }, [donations, fees, orders, user])

  const loading = feesLoading || donationsLoading || ordersLoading
  const usingSamples = !loading && liveRecords.length === 0
  const records = usingSamples ? SAMPLE_PAYMENTS.filter((item) => item.status === "paid").slice(0, 3) : liveRecords
  const totals = paymentTotals(records)
  const showJoiningCta = needsJoiningFee(user)

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <PortalPageHeader
        title="Payments"
        description="Your donations, membership fees, joining fee, and shop orders. Download a PDF receipt for any completed PayChangu payment."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="bg-white/15 text-white lg:bg-white lg:text-neutral-900">
              <Link href="/portal">Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/15 text-white lg:bg-white lg:text-neutral-900">
              <Link href="/donate">Donate</Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/15 text-white lg:bg-white lg:text-neutral-900">
              <Link href="/portal/membership">Pay fees</Link>
            </Button>
            <Button asChild className="bg-white text-neutral-900 lg:bg-leo-primary lg:text-white">
              <Link href="/portal/shop">Shop</Link>
            </Button>
          </div>
        }
      />

      {usingSamples ? (
        <Alert className="border-none bg-white/90">
          <AlertDescription>
            No live payments yet. These example receipts show how donations, membership, and joining fees will appear after
            PayChangu checkout. The dashboard uses the same records and switches to live data automatically.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <Heart className="h-4 w-4" />
            Donations
          </p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatMoney(totals.donations)}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <Wallet className="h-4 w-4" />
            Membership
          </p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatMoney(totals.membership)}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <GraduationCap className="h-4 w-4" />
            Joining fee
          </p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatMoney(totals.joining)}</p>
        </div>
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <ShoppingBag className="h-4 w-4" />
            Shop
          </p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatMoney(totals.shop)}</p>
        </div>
      </div>

      {showJoiningCta ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-950">Joining fee still outstanding</p>
          <p className="mt-1 text-sm text-amber-900">Pay the once-off joining fee before taking training quizzes.</p>
          <Button asChild size="sm" className="mt-3 bg-amber-600 text-white hover:bg-amber-700">
            <Link href="/portal/join-fee">Pay joining fee</Link>
          </Button>
        </div>
      ) : null}

      <div className="rounded-md bg-white p-3 shadow-sm lg:p-4">
        <p className={`mb-3 text-sm ${portalCanvasMuted} lg:text-muted-foreground`}>
          <CreditCard className="mr-1 inline h-4 w-4" />
          Completed payments can be downloaded as PDF receipts.
        </p>
        <PaymentsTable records={records} />
      </div>
    </div>
  )
}
