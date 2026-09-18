"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, Calendar, DollarSign } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { useUsers } from "@/lib/hooks/use-users"
import { useEvents } from "@/lib/hooks/use-events"
import { useDonations } from "@/lib/hooks/use-donations"
import { downloadCsv } from "@/lib/utils/csv"
import { formatMoney } from "@/lib/utils/format"
import type { Donation, Event, User } from "@/lib/types"

export default function ReportsPage() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: donations, isLoading: donationsLoading } = useDonations()

  const generatedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const donationTotals = useMemo(() => {
    const completed = (donations ?? []).filter((donation) => donation.paymentStatus === "completed")
    const amount = completed.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0)
    return { completedCount: completed.length, amount }
  }, [donations])

  const isBusy = usersLoading || eventsLoading || donationsLoading

  const reports = useMemo(
    () => [
      {
        id: "members",
        title: "Membership report",
        description: `Members: ${usersLoading ? "…" : (users ?? []).length}`,
        icon: Users,
        color: "bg-sky-50 text-sky-600",
      },
      {
        id: "donations",
        title: "Donations report",
        description: `Completed: ${donationsLoading ? "…" : donationTotals.completedCount} · ${donationsLoading ? "…" : formatMoney(donationTotals.amount)}`,
        icon: DollarSign,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        id: "events",
        title: "Events report",
        description: `Events: ${eventsLoading ? "…" : (events ?? []).length}`,
        icon: Calendar,
        color: "bg-violet-50 text-violet-600",
      },
      {
        id: "summary",
        title: "Activity summary",
        description: "High-level overview for leadership",
        icon: FileText,
        color: "bg-orange-50 text-orange-600",
      },
    ],
    [usersLoading, users, donationsLoading, donationTotals, eventsLoading, events],
  )

  const handleDownload = (reportId: string) => {
    if (reportId === "members") {
      downloadCsv(
        `members-report-${Date.now()}.csv`,
        (users ?? []).map((user: User) => ({
          id: user.id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          membershipType: user.membershipType,
          membershipStatus: user.membershipStatus,
          position: user.position,
          leoId: user.leoId,
          createdAt: user.createdAt,
        })),
      )
      return
    }

    if (reportId === "events") {
      downloadCsv(
        `events-report-${Date.now()}.csv`,
        (events ?? []).map((event: Event) => ({
          id: event.id,
          title: event.title,
          category: event.category,
          status: event.status,
          date: event.date,
          time: event.time,
          location: event.location,
          attendeesCount: event.attendees?.length ?? 0,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
        })),
      )
      return
    }

    if (reportId === "donations") {
      downloadCsv(
        `donations-report-${Date.now()}.csv`,
        (donations ?? []).map((donation: Donation) => ({
          id: donation.id,
          txRef: donation.txRef,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          amount: donation.amount,
          currency: donation.currency,
          paymentStatus: donation.paymentStatus,
          causeTitle: donation.causeTitle,
          fiscalYear: donation.fiscalYear,
          createdAt: donation.createdAt,
        })),
      )
      return
    }

    downloadCsv(`activity-summary-${Date.now()}.csv`, [
      {
        members: (users ?? []).length,
        events: (events ?? []).length,
        donationsCompleted: donationTotals.completedCount,
        donationsTotalAmount: donationTotals.amount,
        generatedOn: generatedDate,
      },
    ])
  }

  const downloadAll = () => {
    handleDownload("members")
    handleDownload("events")
    handleDownload("donations")
    handleDownload("summary")
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Export club data as CSV files for leadership and record-keeping."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={downloadAll} disabled={isBusy}>
            <Download className="h-4 w-4" />
            Download all
          </Button>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="rounded-md border-border/60 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-md p-3 ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)} disabled={isBusy}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <h3 className="mb-1 text-lg font-semibold">{report.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{report.description}</p>
                <p className="text-xs text-muted-foreground">Generated on {generatedDate}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">What’s included</CardTitle>
          <CardDescription>Each download contains the latest data from Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border/60 p-4">
              <h4 className="font-semibold">Membership</h4>
              <p className="mt-1 text-sm text-muted-foreground">Names, contact details, roles, Leo IDs, and status.</p>
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <h4 className="font-semibold">Donations</h4>
              <p className="mt-1 text-sm text-muted-foreground">Donor info, amounts, causes, and payment status.</p>
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <h4 className="font-semibold">Events</h4>
              <p className="mt-1 text-sm text-muted-foreground">Titles, dates, categories, locations, and attendance counts.</p>
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <h4 className="font-semibold">Summary</h4>
              <p className="mt-1 text-sm text-muted-foreground">A one-row snapshot of members, events, and donations.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
