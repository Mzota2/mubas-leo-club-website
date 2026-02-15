"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers } from "@/lib/hooks/use-users"
import { useEvents } from "@/lib/hooks/use-events"
import { useDonations } from "@/lib/hooks/use-donations"
import type { Donation, Event, User } from "@/lib/types"

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: donations, isLoading: donationsLoading } = useDonations()

  const isLoading = usersLoading || eventsLoading || donationsLoading

  const now = new Date()
  const currentYear = now.getFullYear()

  const totals = useMemo(() => {
    const members = (users ?? []).length
    const completedDonations = (donations ?? []).filter((d) => d.paymentStatus === "completed")
    const donationTotal = completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

    const eventsThisYear = (events ?? []).filter((e) => {
      const d = new Date(e.date)
      return !Number.isNaN(d.getTime()) && d.getFullYear() === currentYear
    }).length

    const attendees = new Set<string>()
    for (const e of events ?? []) {
      for (const uid of e.attendees ?? []) attendees.add(uid)
    }
    const participationRate = members ? Math.round((attendees.size / members) * 100) : 0

    return { members, donationTotal, eventsThisYear, participationRate }
  }, [users, donations, events, currentYear])

  const stats = useMemo(
    () => [
      {
        title: "Total Members",
        value: isLoading ? "..." : totals.members.toLocaleString(),
        change: "",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Total Donations",
        value: isLoading ? "..." : `MWK ${totals.donationTotal.toLocaleString()}`,
        change: "",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Events This Year",
        value: isLoading ? "..." : totals.eventsThisYear.toLocaleString(),
        change: "",
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      {
        title: "Participation Rate",
        value: isLoading ? "..." : `${totals.participationRate}%`,
        change: "",
        icon: TrendingUp,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
    ],
    [isLoading, totals],
  )

  const membershipData = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const createdByMonth: Record<number, number> = {}
    for (const u of users ?? []) {
      const d = new Date(u.createdAt)
      if (Number.isNaN(d.getTime()) || d.getFullYear() !== currentYear) continue
      createdByMonth[d.getMonth()] = (createdByMonth[d.getMonth()] ?? 0) + 1
    }

    let running = 0
    return monthLabels.map((label, idx) => {
      running += createdByMonth[idx] ?? 0
      return { month: label, members: running }
    })
  }, [users, currentYear])

  const donationData = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const amountByMonth: Record<number, number> = {}
    for (const d of (donations ?? []).filter((x) => x.paymentStatus === "completed")) {
      const dt = new Date(d.createdAt)
      if (Number.isNaN(dt.getTime()) || dt.getFullYear() !== currentYear) continue
      amountByMonth[dt.getMonth()] = (amountByMonth[dt.getMonth()] ?? 0) + (Number(d.amount) || 0)
    }
    return monthLabels.map((label, idx) => ({ month: label, amount: amountByMonth[idx] ?? 0 }))
  }, [donations, currentYear])

  const eventCategoryData = useMemo(() => {
    const categoryMeta: Record<Event["category"], string> = {
      health: "Health",
      environment: "Environment",
      community: "Community",
      meeting: "Meetings",
      fundraising: "Fundraising",
      social: "Social",
    }

    const counts: Partial<Record<Event["category"], number>> = {}
    for (const e of events ?? []) {
      counts[e.category] = (counts[e.category] ?? 0) + 1
    }

    return (Object.keys(categoryMeta) as Event["category"][])
      .map((cat) => ({ category: categoryMeta[cat], count: counts[cat] ?? 0 }))
      .filter((x) => x.count > 0)
  }, [events])

  const recentActivity = useMemo(() => {
    const activities: { action: string; user: string; time: string }[] = []

    const recentUsers = [...(users ?? [])]
      .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
    for (const u of recentUsers) {
      activities.push({
        action: "New member registered",
        user: `${u.firstName} ${u.lastName}`,
        time: new Date(u.createdAt).toLocaleString(),
      })
    }

    const recentDonations = [...(donations ?? [])]
      .filter((d: Donation) => d.paymentStatus === "completed")
      .sort((a: Donation, b: Donation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
    for (const d of recentDonations) {
      activities.push({
        action: "Donation received",
        user: d.donorName || d.donorEmail,
        time: new Date(d.createdAt).toLocaleString(),
      })
    }

    const recentEvents = [...(events ?? [])]
      .sort((a: Event, b: Event) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
    for (const e of recentEvents) {
      activities.push({
        action: "Event created",
        user: e.createdBy,
        time: new Date(e.createdAt).toLocaleString(),
      })
    }

    return activities.slice(0, 6)
  }, [users, donations, events])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of club performance and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Membership Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={membershipData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="members" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Donation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Trends (MWK)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Events by Category (2024)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : eventCategoryData.length === 0 ? (
            <p className="text-sm text-gray-600">No events found yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-600">No recent activity yet.</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
