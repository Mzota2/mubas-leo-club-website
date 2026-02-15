"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useDonations } from "@/lib/hooks/use-donations"
import type { Donation } from "@/lib/types"

export default function DonationsPage() {
  const { data: donations, isLoading } = useDonations()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const isSameMonth = (dateString: string) => {
    const d = new Date(dateString)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  }

  const stats = useMemo(() => {
    const list: Donation[] = donations ?? []
    const completed = list.filter((d) => d.paymentStatus === "completed")

    const totalThisYear = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    const thisMonth = completed.filter((d) => isSameMonth(d.createdAt)).reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    const totalDonors = new Set(completed.map((d) => d.donorEmail?.toLowerCase()).filter(Boolean)).size

    return { totalThisYear, thisMonth, totalDonors }
  }, [donations])

  const yearlyData = useMemo(() => {
    const list: Donation[] = donations ?? []
    const completed = list.filter((d) => d.paymentStatus === "completed")

    const grouped: Record<string, number> = {}
    for (const d of completed) {
      const year = new Date(d.createdAt).getFullYear().toString()
      grouped[year] = (grouped[year] ?? 0) + (Number(d.amount) || 0)
    }

    return Object.entries(grouped)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => Number(a.year) - Number(b.year))
  }, [donations])

  const recentDonations = useMemo(() => {
    return (donations ?? []).slice(0, 20)
  }, [donations])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Donations Management</h1>
        <p className="text-gray-600">Track and manage all donations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total This Year</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : `MWK ${stats.totalThisYear.toLocaleString()}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : `MWK ${stats.thisMonth.toLocaleString()}`}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Donors</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : stats.totalDonors.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Trends by Fiscal Year</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : yearlyData.length === 0 ? (
            <p className="text-sm text-gray-600">No donation data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Donor Name</TableHead>
                <TableHead>Amount (MWK)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : recentDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-600">
                    No donations found.
                  </TableCell>
                </TableRow>
              ) : (
                recentDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">{donation.txRef ?? donation.id}</TableCell>
                    <TableCell>{donation.donorName || "Anonymous"}</TableCell>
                    <TableCell>{Number(donation.amount).toLocaleString()}</TableCell>
                    <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={donation.paymentStatus === "completed" ? "bg-green-500" : "bg-yellow-500"}>
                        {donation.paymentStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
