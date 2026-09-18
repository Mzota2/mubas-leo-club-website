"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  Award,
  Calendar,
  Heart,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  CreditCard,
  ArrowRight,
  Shield,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { useEvents } from "@/lib/hooks/use-events"
import { useMyDonations } from "@/lib/hooks/use-donations"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { PromoCarousel } from "@/components/shop/promo-carousel"
import { canAccessAdmin } from "@/components/portal/nav-config"
import { promoSlides } from "@/lib/media"
import { SAMPLE_PAYMENTS } from "@/lib/payments/defaults"
import { donationToRecord, feeToRecord, paymentTotals } from "@/lib/payments/receipt"
import { formatDate, formatMoney, greetingForHour } from "@/lib/utils/format"

export default function PortalDashboard() {
  const { user } = useAuth()
  const { data: events } = useEvents()
  const { data: donations = [] } = useMyDonations(user?.id, user?.email)
  const { data: fees = [] } = useMembershipFees(user?.id, true)
  const now = new Date()
  const isProspectiveLeo = user?.membershipType === "prospective-leo"
  const isLeo = user?.membershipType === "leo"
  const showAdmin = canAccessAdmin(user?.role)

  const upcomingEvents = useMemo(() => {
    return [...(events ?? [])]
      .filter((event) => event.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }, [events])

  const paymentRecords = useMemo(() => {
    const live = [
      ...donations
        .filter((donation) => donation.userId === user?.id || donation.donorEmail?.toLowerCase() === user?.email?.toLowerCase())
        .map(donationToRecord),
      ...fees.map((fee) => feeToRecord(fee, user)),
    ].sort((a, b) => b.date.localeCompare(a.date))
    return live.length > 0 ? live : SAMPLE_PAYMENTS.filter((record) => record.status === "paid").slice(0, 3)
  }, [donations, fees, user])

  const payments = paymentTotals(paymentRecords)

  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const categories = [
    { title: "Health", icon: Heart, color: "bg-red-500", href: "/portal/events?category=health" },
    { title: "Environment", icon: Users, color: "bg-emerald-500", href: "/portal/events?category=environment" },
    { title: "Community", icon: Users, color: "bg-violet-500", href: "/portal/events?category=community" },
    { title: "Meetings", icon: Calendar, color: "bg-amber-500", href: "/portal/events?category=meeting" },
    { title: "Fundraising", icon: CreditCard, color: "bg-cyan-500", href: "/portal/events?category=fundraising" },
    { title: "Social", icon: Sparkles, color: "bg-orange-400", href: "/portal/events?category=social" },
  ]

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <section className="overflow-hidden rounded-md bg-gradient-to-br from-[#F59E0B] via-[#F59E0B] to-[#DC2626] p-5 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-white/80">{dateLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">
              {greetingForHour(now)}, {user?.firstName || "Leo"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/90">
              {isProspectiveLeo
                ? "Complete training and membership payment to become a full Leo member."
                : isLeo
                  ? "See what’s happening in the club and jump into the next activity."
                  : "Welcome to MUBAS Leo Club. Start your journey of leadership and service."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user?.leoId ? (
                <Badge variant="secondary" className="border-white/20 bg-white/15 text-white">
                  <Award className="h-3 w-3" />
                  {user.leoId}
                </Badge>
              ) : null}
              {isProspectiveLeo ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Prospective Leo
                </Badge>
              ) : null}
              {isLeo ? (
                <Badge variant="secondary" className="bg-white text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Active Leo
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {showAdmin ? (
              <Button asChild className="bg-white text-neutral-900 hover:bg-white/90">
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                  Open admin
                </Link>
              </Button>
            ) : null}
            {user?.whatsappGroupLink && isLeo ? (
              <Button asChild className="border-white/30 bg-white/15 text-white hover:bg-white/25">
                <a href={user.whatsappGroupLink} target="_blank" rel="noopener noreferrer">
                  WhatsApp group
                </a>
              </Button>
            ) : (
              <Button asChild className="border-white/30 bg-white/15 text-white hover:bg-white/25">
                <Link href="/portal/events">View events</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <form action="/portal/search" className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search events, members, or club info"
          className="h-12 rounded-md border-none bg-white pl-10 shadow-sm"
        />
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PromoCarousel slides={promoSlides} />

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Quick links</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                {[
                  { href: "/portal/training", label: "Training", icon: Award, tone: "from-[#F59E0B] to-[#DC2626]" },
                  { href: "/portal/payments", label: "Payments", icon: CreditCard, tone: "from-[#92400E] to-[#B45309]" },
                  { href: "/portal/membership", label: "Membership", icon: Users, tone: "from-[#92400E] to-[#B45309]" },
                  { href: "/donate", label: "Donate", icon: Heart, tone: "from-[#F59E0B] to-[#DC2626]" },
                  { href: "/portal/club", label: "My club", icon: Users, tone: "from-[#DC2626] to-[#991B1B]" },
                  { href: "/portal/events", label: "Events", icon: Calendar, tone: "from-[#D97706] to-[#B45309]" },
                  { href: "/portal/shop", label: "Shop", icon: CreditCard, tone: "from-[#F59E0B] to-[#B45309]" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex aspect-square flex-col items-center justify-center rounded-md bg-gradient-to-br ${item.tone} p-3 text-center text-white transition-transform hover:scale-[1.02]`}
                  >
                    <item.icon className="mb-2 h-6 w-6" />
                    <span className="text-[11px] font-medium leading-tight lg:text-xs">{item.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-md border-none bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white shadow-sm">
            <CardContent>
              <p className="text-sm text-white/80">{now.toLocaleDateString("en-GB", { weekday: "long" })}</p>
              <p className="mt-1 text-5xl font-bold">{now.getDate()}</p>
              <p className="mt-1 text-sm uppercase tracking-wide text-white/80">
                {now.toLocaleDateString("en-GB", { month: "long" })}
              </p>
              <Button asChild className="mt-4 w-full rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]">
                <Link href="/portal/calendar">Open calendar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Upcoming events</h2>
                <Link href="/portal/events" className="text-sm font-medium text-leo-primary">
                  View all
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      href="/portal/events"
                      className="block rounded-md border border-border/60 p-3 transition-colors hover:bg-amber-50"
                    >
                      <p className="truncate font-medium">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(event.date)}
                        {event.time ? ` · ${event.time}` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-md border-none bg-white shadow-sm">
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Your payments</h2>
                <Link href="/portal/payments" className="text-sm font-medium text-leo-primary">
                  View all
                </Link>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-amber-50 p-2">
                  <p className="text-[11px] text-neutral-500">Donations</p>
                  <p className="text-xs font-semibold">{formatMoney(payments.donations)}</p>
                </div>
                <div className="rounded-md bg-amber-50 p-2">
                  <p className="text-[11px] text-neutral-500">Membership</p>
                  <p className="text-xs font-semibold">{formatMoney(payments.membership)}</p>
                </div>
                <div className="rounded-md bg-amber-50 p-2">
                  <p className="text-[11px] text-neutral-500">Joining</p>
                  <p className="text-xs font-semibold">{formatMoney(payments.joining)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {paymentRecords.slice(0, 3).map((record) => (
                  <Link
                    key={record.id}
                    href="/portal/payments"
                    className="block rounded-md border border-border/60 p-3 transition-colors hover:bg-amber-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{record.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(record.date)} · {record.status}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">{formatMoney(record.amount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isProspectiveLeo ? (
        <Card className="rounded-md border-amber-200 bg-amber-50 shadow-sm">
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="rounded-md bg-amber-100 p-3 text-amber-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {!user?.joiningFeePaid
                    ? "Pay your joining fee"
                    : user?.membershipStatus === "pending"
                      ? "Complete training while we approve you"
                      : "Become a full Leo member"}
                </h3>
                <p className="mt-1 text-sm text-neutral-700">
                  {!user?.joiningFeePaid
                    ? "The once-off joining fee is required before you can take training quizzes. Membership dues are separate."
                    : user?.membershipStatus === "pending"
                      ? "An admin still needs to approve your joining request. Meanwhile, go through the new member training program — it is the only training required."
                      : "Complete the new member training program (50% or higher on each quiz) and pay membership fees to become a full Leo."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!user?.joiningFeePaid ? (
                    <Button asChild size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                      <Link href="/portal/join-fee">Pay joining fee</Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-800">
                      <Link href="/portal/training">Start training</Link>
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-800">
                    <Link href="/portal/membership">Pay membership</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="flex items-center justify-between rounded-md bg-white px-4 py-3 shadow-sm transition-colors hover:bg-amber-50"
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <span className={`rounded-md p-2 text-white ${category.color}`}>
                <category.icon className="h-4 w-4" />
              </span>
              {category.title}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <Link href="/portal/calendar" className="block">
        <Card className="rounded-md border-none bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#DC2626]" />
              <span className="font-semibold">Club calendar & activity</span>
            </div>
            <ArrowRight className="h-4 w-4 text-leo-primary" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
