"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  UserPlus,
  ClipboardCheck,
  Image as ImageIcon,
  CalendarPlus,
  CreditCard,
  GraduationCap,
  Wallet,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUsers } from "@/lib/hooks/use-users"
import { useEvents } from "@/lib/hooks/use-events"
import { useDonations } from "@/lib/hooks/use-donations"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { useOrders } from "@/lib/hooks/use-orders"
import { displayName, formatMoney, formatRelativeTime, greetingForHour } from "@/lib/utils/format"
import { SAMPLE_PAYMENTS, SAMPLE_PAYMENT_TOTALS } from "@/lib/payments/defaults"
import { donationToRecord, feeToRecord, orderToRecord, paymentTotals } from "@/lib/payments/receipt"
import { PaymentsTable } from "@/components/payments/payments-table"
import { periodLabel } from "@/lib/membership/billing"
import { categoryColors } from "@/lib/constants/theme"
import { formatEventSchedule, isLiveEvent } from "@/lib/content/events"
import type { Event, User } from "@/lib/types"

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const categoryMeta: Record<Event["category"], string> = {
  health: "Health",
  environment: "Environment",
  community: "Community",
  meeting: "Meetings",
  fundraising: "Fundraising",
  social: "Social",
}

function ChartTooltip({
  active,
  payload,
  label,
  valuePrefix,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  valuePrefix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">
        {valuePrefix}
        {Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: donations, isLoading: donationsLoading } = useDonations()
  const { data: fees, isLoading: feesLoading } = useMembershipFees()
  const { data: orders, isLoading: ordersLoading } = useOrders()

  const isLoading = usersLoading || eventsLoading || donationsLoading || feesLoading || ordersLoading
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const userById = useMemo(() => {
    const map = new Map<string, User>()
    for (const member of users ?? []) map.set(member.id, member)
    return map
  }, [users])

  const paymentRecords = useMemo(() => {
    const live = [
      ...(donations ?? []).map(donationToRecord),
      ...(fees ?? []).map((fee) => feeToRecord(fee, userById.get(fee.userId))),
      ...(orders ?? []).map(orderToRecord),
    ].sort((a, b) => b.date.localeCompare(a.date))
    return live.length > 0 ? live : SAMPLE_PAYMENTS
  }, [donations, fees, orders, userById])

  const paymentSummary = useMemo(() => {
    const live = paymentTotals(paymentRecords)
    const usingSamples = (donations ?? []).length === 0 && (fees ?? []).length === 0 && (orders ?? []).length === 0
    return {
      ...live,
      donations: live.donations || (usingSamples ? SAMPLE_PAYMENT_TOTALS.donationTotal : 0),
      membership: live.membership || (usingSamples ? SAMPLE_PAYMENT_TOTALS.feesCollected : 0),
      joining: live.joining || (usingSamples ? SAMPLE_PAYMENT_TOTALS.joiningCollected : 0),
      pending: live.pending || (usingSamples ? SAMPLE_PAYMENT_TOTALS.pendingDonations : 0),
      usingSamples,
    }
  }, [paymentRecords, donations, fees, orders])

  const totals = useMemo(() => {
    const members = users ?? []
    const leoCount = members.filter((member) => member.membershipType === "leo").length
    const prospectiveCount = members.filter((member) => member.membershipType === "prospective-leo").length
    const activeCount = members.filter((member) => (member.membershipStatus ?? "active") === "active").length

    const completedDonations = (donations ?? []).filter((donation) => donation.paymentStatus === "completed")
    const donationTotal = completedDonations.reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0)
    const donationThisMonth = completedDonations
      .filter((donation) => {
        const date = new Date(donation.createdAt)
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth
      })
      .reduce((sum, donation) => sum + (Number(donation.amount) || 0), 0)
    const pendingDonations = (donations ?? []).filter((donation) => donation.paymentStatus === "pending").length

    const yearEvents = (events ?? []).filter((event) => {
      const date = new Date(event.date)
      return !Number.isNaN(date.getTime()) && date.getFullYear() === currentYear
    })
    const upcomingEvents = (events ?? []).filter((event) => isLiveEvent(event)).length

    const attendees = new Set<string>()
    for (const event of events ?? []) {
      for (const uid of event.attendees ?? []) attendees.add(uid)
    }
    const participationRate = members.length ? Math.round((attendees.size / members.length) * 100) : 0

    return {
      members: members.length,
      leoCount,
      prospectiveCount,
      activeCount,
      donationTotal,
      donationThisMonth,
      pendingDonations,
      eventsThisYear: yearEvents.length,
      upcomingEvents,
      participationRate,
      uniqueAttendees: attendees.size,
    }
  }, [users, donations, events, currentYear, currentMonth])

  const membershipData = useMemo(() => {
    const createdBeforeYear = (users ?? []).filter((member) => {
      const date = new Date(member.createdAt)
      return !Number.isNaN(date.getTime()) && date.getFullYear() < currentYear
    }).length

    const createdByMonth: Record<number, number> = {}
    for (const member of users ?? []) {
      const date = new Date(member.createdAt)
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) continue
      createdByMonth[date.getMonth()] = (createdByMonth[date.getMonth()] ?? 0) + 1
    }

    let running = createdBeforeYear
    return monthLabels.map((label, index) => {
      running += createdByMonth[index] ?? 0
      return { month: label, members: running }
    })
  }, [users, currentYear])

  const donationData = useMemo(() => {
    const amountByMonth: Record<number, number> = {}
    for (const donation of (donations ?? []).filter((item) => item.paymentStatus === "completed")) {
      const date = new Date(donation.createdAt)
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) continue
      amountByMonth[date.getMonth()] = (amountByMonth[date.getMonth()] ?? 0) + (Number(donation.amount) || 0)
    }
    return monthLabels.map((label, index) => ({ month: label, amount: amountByMonth[index] ?? 0 }))
  }, [donations, currentYear])

  const eventCategoryData = useMemo(() => {
    const counts: Partial<Record<Event["category"], number>> = {}
    for (const event of events ?? []) {
      counts[event.category] = (counts[event.category] ?? 0) + 1
    }

    return (Object.keys(categoryMeta) as Event["category"][])
      .map((category) => ({
        category: categoryMeta[category],
        count: counts[category] ?? 0,
        fill: categoryColors[category],
      }))
      .filter((item) => item.count > 0)
  }, [events])

  const upcomingEvents = useMemo(() => {
    return [...(events ?? [])]
      .filter((event) => isLiveEvent(event))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [events])

  const recentActivity = useMemo(() => {
    const activities: {
      id: string
      action: string
      user: string
      time: string
      timestamp: number
      tone: string
      icon: typeof Sparkles
    }[] = []

    for (const member of users ?? []) {
      activities.push({
        id: `user-${member.id}`,
        action: "New member registered",
        user: displayName(member),
        time: formatRelativeTime(member.createdAt),
        timestamp: new Date(member.createdAt).getTime(),
        tone: "bg-sky-50 text-sky-600",
        icon: UserPlus,
      })
    }

    for (const donation of donations ?? []) {
      if (donation.paymentStatus !== "completed") continue
      activities.push({
        id: `donation-${donation.id}`,
        action: `Donation of ${formatMoney(Number(donation.amount) || 0)}`,
        user: donation.donorName || donation.donorEmail || "Anonymous",
        time: formatRelativeTime(donation.createdAt),
        timestamp: new Date(donation.createdAt).getTime(),
        tone: "bg-emerald-50 text-emerald-600",
        icon: DollarSign,
      })
    }

    for (const fee of fees ?? []) {
      if (fee.status !== "paid") continue
      const member = userById.get(fee.userId)
      activities.push({
        id: `fee-${fee.id}`,
        action: `${periodLabel(fee.period)} of ${formatMoney(Number(fee.amount) || 0)}`,
        user: member ? displayName(member) : fee.userId,
        time: formatRelativeTime(fee.paymentDate || fee.createdAt),
        timestamp: new Date(fee.paymentDate || fee.createdAt).getTime(),
        tone: "bg-orange-50 text-orange-600",
        icon: CreditCard,
      })
    }

    for (const event of events ?? []) {
      const creator = userById.get(event.createdBy)
      activities.push({
        id: `event-${event.id}`,
        action: "Event created",
        user: creator ? displayName(creator) : event.title,
        time: formatRelativeTime(event.createdAt),
        timestamp: new Date(event.createdAt).getTime(),
        tone: "bg-violet-50 text-violet-600",
        icon: CalendarPlus,
      })
    }

    return activities
      .filter((item) => Number.isFinite(item.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 7)
  }, [users, donations, events, fees, userById])

  const prospectiveLeos = useMemo(
    () => (users ?? []).filter((member) => member.membershipType === "prospective-leo"),
    [users],
  )

  const todayLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-md bg-gradient-to-br from-[#F59E0B] via-[#F59E0B] to-[#DC2626] p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/80">{todayLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {greetingForHour(now)}, {user?.firstName || "Leader"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
              Review club activity, follow up on members, and keep events and fundraising moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="bg-white text-neutral-900 hover:bg-white/90">
              <Link href="/admin/events">
                <Plus className="h-4 w-4" />
                New event
              </Link>
            </Button>
            <Button asChild variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/admin/members">
                <Users className="h-4 w-4" />
                Manage members
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total members"
          value={totals.members.toLocaleString()}
          hint={`${totals.leoCount} Leo · ${totals.prospectiveCount} prospective`}
          icon={Users}
          accent="blue"
          loading={isLoading}
        />
        <Link href="/admin/payments" className="block">
        <AdminStatCard
          title="Donations received"
          value={formatMoney(paymentSummary.donations)}
          hint={
            paymentSummary.usingSamples
              ? "Sample total until live PayChangu donations arrive · Open payments"
              : `${formatMoney(totals.donationThisMonth)} this month · Open payments`
          }
          icon={DollarSign}
          accent="green"
          loading={isLoading}
        />
        </Link>
        <AdminStatCard
          title={`Events in ${currentYear}`}
          value={totals.eventsThisYear.toLocaleString()}
          hint={`${totals.upcomingEvents} upcoming`}
          icon={Calendar}
          accent="purple"
          loading={isLoading}
        />
        <AdminStatCard
          title="Event reach"
          value={`${totals.participationRate}%`}
          hint={`${totals.uniqueAttendees} unique attendees`}
          icon={TrendingUp}
          accent="orange"
          loading={isLoading}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/admin/payments?tab=membership" className="block">
          <AdminStatCard
            title="Membership fees"
            value={formatMoney(paymentSummary.membership)}
            hint="Collected monthly, semester, and yearly dues"
            icon={Wallet}
            accent="orange"
            loading={isLoading}
          />
        </Link>
        <Link href="/admin/payments?tab=joining" className="block">
          <AdminStatCard
            title="Joining fees"
            value={formatMoney(paymentSummary.joining)}
            hint="Once-off fees from prospective members"
            icon={GraduationCap}
            accent="blue"
            loading={isLoading}
          />
        </Link>
        <Link href="/admin/payments" className="block">
          <AdminStatCard
            title="Pending payments"
            value={paymentSummary.pending}
            hint="Donations and fees waiting on PayChangu"
            icon={CreditCard}
            accent="amber"
            loading={isLoading}
          />
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/admin/payments", label: "Review payments", icon: DollarSign },
          { href: "/admin/events", label: "Create event", icon: Calendar },
          { href: "/admin/attendance", label: "Record attendance", icon: ClipboardCheck },
          { href: "/admin/donation-causes", label: "Add a cause", icon: Plus },
          { href: "/admin/gallery", label: "Upload photos", icon: ImageIcon },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center justify-between rounded-md border border-border/60 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:border-leo-primary/40 hover:shadow-md"
          >
            <span className="flex items-center gap-2">
              <action.icon className="h-4 w-4 text-leo-primary" />
              {action.label}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <Card className="min-w-0 rounded-md border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Membership growth</CardTitle>
            <CardDescription>Cumulative members through {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={membershipData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="members" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-md border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Donation trends</CardTitle>
            <CardDescription>Completed donations in {currentYear} (MWK)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={donationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip valuePrefix="MWK " />} />
                  <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="rounded-md border-border/60 shadow-sm xl:col-span-3">
          <CardHeader>
            <CardTitle>Events by category</CardTitle>
            <CardDescription>All recorded events across the club</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : eventCategoryData.length === 0 ? (
              <AdminEmptyState icon={Calendar} title="No events yet" description="Create an event to see category analytics." />
            ) : (
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={eventCategoryData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={80}
                    tick={{ fontSize: 11, fill: "#78716C" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {eventCategoryData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming events</CardTitle>
              <CardDescription>Next scheduled activities</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/events">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <AdminEmptyState icon={Calendar} title="Nothing upcoming" description="Schedule the next club event." />
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-md border border-border/60 bg-[#FBF9F6] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{event.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatEventSchedule(event)} · {event.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>
              {paymentSummary.usingSamples
                ? "Sample ledger until live PayChangu donations and fees arrive"
                : "Latest donations, membership fees, and joining fees"}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/payments">Open ledger</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <PaymentsTable records={paymentRecords.slice(0, 6)} />}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="rounded-md border-border/60 shadow-sm xl:col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest members, donations, fees, and events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentActivity.length === 0 ? (
              <AdminEmptyState icon={Sparkles} title="No activity yet" description="Club activity will appear here as it happens." />
            ) : (
              <div className="divide-y">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                  <div key={activity.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`rounded-md p-2 ${activity.tone}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{activity.action}</p>
                        <p className="truncate text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 shadow-sm xl:col-span-2">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Items that may need a follow-up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/members"
              className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4 text-amber-700" />
                <div>
                  <p className="text-sm font-medium text-amber-950">Prospective Leos</p>
                  <p className="text-xs text-amber-800">Waiting for promotion</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-amber-900">{isLoading ? "—" : prospectiveLeos.length}</span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center justify-between rounded-md border border-sky-200 bg-sky-50 px-4 py-3 transition-colors hover:bg-sky-100"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-sky-700" />
                <div>
                  <p className="text-sm font-medium text-sky-950">Pending payments</p>
                  <p className="text-xs text-sky-800">Donations and fees not yet completed</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-sky-900">{isLoading ? "—" : paymentSummary.pending}</span>
            </Link>
            <Link
              href="/admin/members"
              className="flex items-center justify-between rounded-md border border-border/60 bg-white px-4 py-3 transition-colors hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-neutral-600" />
                <div>
                  <p className="text-sm font-medium">Active members</p>
                  <p className="text-xs text-muted-foreground">Currently in good standing</p>
                </div>
              </div>
              <span className="text-lg font-semibold">{isLoading ? "—" : totals.activeCount}</span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
