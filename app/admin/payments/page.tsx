"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CreditCard, DollarSign, GraduationCap, ShoppingBag, Wallet } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { PaymentsTable } from "@/components/payments/payments-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useDonations } from "@/lib/hooks/use-donations"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { useOrders } from "@/lib/hooks/use-orders"
import { useUsers } from "@/lib/hooks/use-users"
import { SAMPLE_PAYMENTS } from "@/lib/payments/defaults"
import { donationToRecord, feeToRecord, orderToRecord, paymentTotals } from "@/lib/payments/receipt"
import { formatMoney } from "@/lib/utils/format"
import type { PaymentKind } from "@/lib/payments/types"

function parseTab(value: string | null): "all" | PaymentKind {
  if (value === "donation" || value === "membership" || value === "joining" || value === "order") return value
  return "all"
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminPaymentsContent />
    </Suspense>
  )
}

function AdminPaymentsContent() {
  const searchParams = useSearchParams()
  const { data: donations, isLoading: donationsLoading } = useDonations()
  const { data: fees, isLoading: feesLoading } = useMembershipFees()
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: users } = useUsers()
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<"all" | PaymentKind>(parseTab(searchParams.get("tab")))

  const liveRecords = useMemo(() => {
    const userById = new Map((users ?? []).map((user) => [user.id, user]))
    const donationRecords = (donations ?? []).map(donationToRecord)
    const feeRecords = (fees ?? []).map((fee) => feeToRecord(fee, userById.get(fee.userId)))
    const orderRecords = (orders ?? []).map(orderToRecord)
    return [...donationRecords, ...feeRecords, ...orderRecords].sort((a, b) => b.date.localeCompare(a.date))
  }, [donations, fees, orders, users])

  const loading = donationsLoading || feesLoading || ordersLoading
  const usingSamples = !loading && liveRecords.length === 0
  const source = usingSamples ? SAMPLE_PAYMENTS : liveRecords

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return source.filter((record) => {
      if (tab !== "all" && record.kind !== tab) return false
      if (!q) return true
      return (
        record.payerName.toLowerCase().includes(q) ||
        record.payerEmail?.toLowerCase().includes(q) ||
        record.title.toLowerCase().includes(q) ||
        record.txRef?.toLowerCase().includes(q)
      )
    })
  }, [query, source, tab])

  const totals = useMemo(() => paymentTotals(source), [source])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Donations, membership fees, joining fees, and shop orders collected through PayChangu."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/fees">Fee settings</Link>
            </Button>
            <Button asChild className="bg-leo-primary text-white">
              <Link href="/admin/donation-causes">Causes</Link>
            </Button>
          </div>
        }
      />

      {usingSamples ? (
        <Alert>
          <AlertDescription>
            Showing sample payment records until live PayChangu donations and fees appear. Totals on the dashboard use the
            same live data and will replace these examples automatically.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
        <AdminStatCard title="Donations collected" value={formatMoney(totals.donations)} icon={DollarSign} accent="green" loading={loading} />
        <AdminStatCard title="Membership fees" value={formatMoney(totals.membership)} icon={Wallet} accent="orange" loading={loading} />
        <AdminStatCard title="Joining fees" value={formatMoney(totals.joining)} icon={GraduationCap} accent="blue" loading={loading} />
        <AdminStatCard title="Shop orders" value={formatMoney(totals.shop)} icon={ShoppingBag} accent="purple" loading={loading} />
        <AdminStatCard title="Pending payments" value={totals.pending} icon={CreditCard} accent="amber" loading={loading} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="donation">Donations</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="joining">Joining</TabsTrigger>
            <TabsTrigger value="order">Shop</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search payer, cause, or reference"
          className="sm:max-w-xs"
        />
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : <PaymentsTable records={filtered} />}
    </div>
  )
}
