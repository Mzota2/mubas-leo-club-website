"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, DollarSign, Search, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { ReceiptButton } from "@/components/payments/receipt-button"
import { donationToRecord } from "@/lib/payments/receipt"
import { useDonations } from "@/lib/hooks/use-donations"
import { SAMPLE_PAYMENTS } from "@/lib/payments/defaults"
import { formatDate, formatMoney } from "@/lib/utils/format"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Donation } from "@/lib/types"

export default function DonationsPage() {
  const { data: donations, isLoading } = useDonations()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Donation["paymentStatus"]>("all")

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const usingSamples = !isLoading && (donations ?? []).length === 0

  const donationList = useMemo((): Donation[] => {
    if ((donations ?? []).length > 0) return donations ?? []
    return SAMPLE_PAYMENTS.filter((record) => record.kind === "donation").map((record) => ({
      id: record.id,
      amount: record.amount,
      donorName: record.payerName,
      donorEmail: record.payerEmail || "",
      causeTitle: record.title,
      txRef: record.txRef,
      currency: record.currency,
      paymentStatus: record.status === "paid" ? "completed" : record.status === "failed" ? "failed" : "pending",
      fiscalYear: `${currentYear}/${currentYear + 1}`,
      createdAt: record.date,
      message: record.detail,
    }))
  }, [donations, currentYear])

  const stats = useMemo(() => {
    const list: Donation[] = donationList
    const completed = list.filter((donation) => donation.paymentStatus === "completed")

    const totalThisYear = completed.reduce((sum, donation) => {
      const date = new Date(donation.createdAt)
      return date.getFullYear() === currentYear ? sum + (Number(donation.amount) || 0) : sum
    }, 0)
    const thisMonth = completed
      .filter((donation) => {
        const date = new Date(donation.createdAt)
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth
      })
      .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0)
    const totalDonors = new Set(completed.map((donation) => donation.donorEmail?.toLowerCase()).filter(Boolean)).size
    const pending = list.filter((donation) => donation.paymentStatus === "pending").length

    return { totalThisYear, thisMonth, totalDonors, pending }
  }, [donationList, currentYear, currentMonth])

  const yearlyData = useMemo(() => {
    const completed = donationList.filter((donation) => donation.paymentStatus === "completed")
    const grouped: Record<string, number> = {}
    for (const donation of completed) {
      const year = new Date(donation.createdAt).getFullYear().toString()
      grouped[year] = (grouped[year] ?? 0) + (Number(donation.amount) || 0)
    }

    return Object.entries(grouped)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => Number(a.year) - Number(b.year))
  }, [donationList])

  const recentDonations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return [...donationList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((donation) => (statusFilter === "all" ? true : donation.paymentStatus === statusFilter))
      .filter((donation) => {
        if (!query) return true
        return (
          donation.donorName?.toLowerCase().includes(query) ||
          donation.donorEmail?.toLowerCase().includes(query) ||
          donation.causeTitle?.toLowerCase().includes(query) ||
          donation.txRef?.toLowerCase().includes(query)
        )
      })
  }, [donationList, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Donations"
        description="Track completed gifts, pending payments, and yearly fundraising trends."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/payments">All payments</Link>
          </Button>
        }
      />

      {usingSamples ? (
        <Alert>
          <AlertDescription>
            Showing sample donations until live PayChangu gifts arrive. Open the payments ledger for membership and joining
            fees too.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title={`Raised in ${currentYear}`}
          value={formatMoney(stats.totalThisYear)}
          icon={DollarSign}
          accent="green"
          loading={isLoading}
        />
        <AdminStatCard
          title="This month"
          value={formatMoney(stats.thisMonth)}
          icon={Calendar}
          accent="blue"
          loading={isLoading}
        />
        <AdminStatCard title="Unique donors" value={stats.totalDonors} icon={Users} accent="purple" loading={isLoading} />
        <AdminStatCard title="Pending payments" value={stats.pending} icon={DollarSign} accent="amber" loading={isLoading} />
      </div>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Donation trends by year</CardTitle>
          <CardDescription>Completed donations grouped by calendar year</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : yearlyData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donation data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatMoney(Number(value ?? 0))} />
                <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">All donations</CardTitle>
              <CardDescription>Search by donor, cause, or transaction reference</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search donations..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-9 sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="space-y-2 py-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : recentDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No donations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">{donation.txRef ?? donation.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p>{donation.donorName || "Anonymous"}</p>
                          {donation.donorEmail ? (
                            <p className="text-xs text-muted-foreground">{donation.donorEmail}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{donation.causeTitle || "General"}</TableCell>
                      <TableCell>{formatMoney(Number(donation.amount) || 0)}</TableCell>
                      <TableCell>{formatDate(donation.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            donation.paymentStatus === "completed"
                              ? "border-transparent bg-emerald-500 text-white"
                              : donation.paymentStatus === "failed"
                                ? "border-transparent bg-rose-500 text-white"
                                : "border-transparent bg-amber-500 text-white"
                          }
                        >
                          {donation.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ReceiptButton record={donationToRecord(donation)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
