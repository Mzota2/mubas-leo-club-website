"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, Calendar, DollarSign } from "lucide-react"
import { useUsers } from "@/lib/hooks/use-users"
import { useEvents } from "@/lib/hooks/use-events"
import { useDonations } from "@/lib/hooks/use-donations"
import type { Donation, Event, User } from "@/lib/types"

export default function ReportsPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: donations, isLoading: donationsLoading } = useDonations()

  const generatedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const donationTotals = useMemo(() => {
    const completed = (donations ?? []).filter((d) => d.paymentStatus === "completed")
    const amount = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    return { completedCount: completed.length, amount }
  }, [donations])

  const reports = useMemo(
    () => [
      {
        id: "members",
        title: "Membership Report",
        description: `Members: ${usersLoading ? "..." : (users ?? []).length}`,
        icon: Users,
        color: "bg-blue-100 text-blue-600",
        date: `Generated on ${generatedDate}`,
      },
      {
        id: "donations",
        title: "Donations Report",
        description: `Completed donations: ${donationsLoading ? "..." : donationTotals.completedCount} · Total: MWK ${donationsLoading ? "..." : donationTotals.amount.toLocaleString()}`,
        icon: DollarSign,
        color: "bg-green-100 text-green-600",
        date: `Generated on ${generatedDate}`,
      },
      {
        id: "events",
        title: "Events Report",
        description: `Events: ${eventsLoading ? "..." : (events ?? []).length}`,
        icon: Calendar,
        color: "bg-purple-100 text-purple-600",
        date: `Generated on ${generatedDate}`,
      },
      {
        id: "summary",
        title: "Activity Summary",
        description: "High-level overview for leadership",
        icon: FileText,
        color: "bg-orange-100 text-orange-600",
        date: `Generated on ${generatedDate}`,
      },
    ],
    [usersLoading, users, donationsLoading, donationTotals, eventsLoading, events, generatedDate],
  )

  const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
    const headers = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((k) => set.add(k))
        return set
      }, new Set<string>()),
    )

    const escape = (value: unknown) => {
      const s = value === null || value === undefined ? "" : String(value)
      const escaped = s.replace(/\"/g, '""')
      return `"${escaped}"`
    }

    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleDownload = (reportId: string) => {
    if (reportId === "members") {
      const rows = (users ?? []).map((u: User) => ({
        id: u.id,
        firstName: u.firstName,
        middleName: u.middleName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        membershipStatus: u.membershipStatus,
        position: u.position,
        leoId: u.leoId,
        createdAt: u.createdAt,
      }))
      downloadCsv(`members-report-${Date.now()}.csv`, rows)
      return
    }

    if (reportId === "events") {
      const rows = (events ?? []).map((e: Event) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        status: e.status,
        date: e.date,
        time: e.time,
        location: e.location,
        attendeesCount: e.attendees?.length ?? 0,
        createdBy: e.createdBy,
        createdAt: e.createdAt,
      }))
      downloadCsv(`events-report-${Date.now()}.csv`, rows)
      return
    }

    if (reportId === "donations") {
      const rows = (donations ?? []).map((d: Donation) => ({
        id: d.id,
        txRef: d.txRef,
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        amount: d.amount,
        currency: d.currency,
        paymentStatus: d.paymentStatus,
        fiscalYear: d.fiscalYear,
        createdAt: d.createdAt,
      }))
      downloadCsv(`donations-report-${Date.now()}.csv`, rows)
      return
    }

    const rows = [
      {
        members: (users ?? []).length,
        events: (events ?? []).length,
        donationsCompleted: donationTotals.completedCount,
        donationsTotalAmount: donationTotals.amount,
        generatedOn: generatedDate,
      },
    ]
    downloadCsv(`activity-summary-${Date.now()}.csv`, rows)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-gray-600">Generate and download club reports</p>
        </div>
        <Button className="bg-leo-primary hover:bg-leo-primary-dark text-white">
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    disabled={usersLoading || eventsLoading || donationsLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                <p className="text-xs text-gray-500">{report.date}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Report Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-1">Membership Report</h4>
              <p className="text-sm text-gray-600">Includes member details, growth trends, and demographics</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-1">Financial Report</h4>
              <p className="text-sm text-gray-600">Complete financial overview with donations and expenses</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-1">Event Report</h4>
              <p className="text-sm text-gray-600">Event participation, attendance tracking, and impact analysis</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-1">Custom Report</h4>
              <p className="text-sm text-gray-600">Build custom reports with specific data points and date ranges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
