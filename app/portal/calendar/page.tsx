"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { PortalPageHeader } from "@/components/portal/page-header"
import { BirthdayCelebrationCard } from "@/components/portal/birthday-celebration-card"
import { useEvents } from "@/lib/hooks/use-events"
import { useBirthdayCalendar } from "@/lib/hooks/use-birthday-posts"
import { usePlatformSettings } from "@/lib/hooks/use-settings"
import { birthdayMonthDay, nextBirthday, upcomingBirthdays } from "@/lib/content/academic"
import { birthdayStyle, celebrationEntries } from "@/lib/content/birthdays"
import { withLeoTitle } from "@/lib/utils/format"
import { eventOccursOnDay, eventOverlapsMonth, formatEventSchedule, isLiveEvent } from "@/lib/content/events"
import { useAuth } from "@/lib/hooks/use-auth"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageInner />
    </Suspense>
  )
}

function CalendarPageInner() {
  const searchParams = useSearchParams()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { user } = useAuth()
  const { data: liveEvents = [] } = useEvents()
  const { data: birthdayEntries = [] } = useBirthdayCalendar()
  const { data: settings } = usePlatformSettings()
  const showBirthdays = settings?.notifications.birthdayNotifications !== false
  const celebrations = useMemo(
    () => (showBirthdays ? celebrationEntries(birthdayEntries, user) : []),
    [birthdayEntries, showBirthdays, user],
  )
  const focusId = searchParams.get("focus") || ""
  const appliedFocus = useRef("")

  useEffect(() => {
    const year = Number(searchParams.get("year"))
    const month = Number(searchParams.get("month"))
    const key = `${focusId}-${searchParams.get("year")}-${searchParams.get("month")}`
    if (!focusId || appliedFocus.current === key) return
    appliedFocus.current = key
    if (year && month) {
      setCurrentDate(new Date(year, month - 1, 1))
      return
    }
    const entry = celebrations.find((item) => (item.memberId || item.id) === focusId)
    const next = nextBirthday(entry?.dateOfBirth)
    if (next) setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1))
  }, [celebrations, focusId, searchParams])

  const monthEvents = useMemo(() => {
    return liveEvents.filter((event) =>
      eventOverlapsMonth(event, currentDate.getFullYear(), currentDate.getMonth()),
    )
  }, [liveEvents, currentDate])

  const monthBirthdays = useMemo(() => {
    return celebrations.filter((entry) => {
      const parts = birthdayMonthDay(entry.dateOfBirth)
      return parts?.month === currentDate.getMonth()
    })
  }, [celebrations, currentDate])

  const upcomingCelebrations = useMemo(
    () => upcomingBirthdays(celebrations, new Date(), 60, user?.id ? [user.id] : []).filter((birthday) => !birthday.isToday),
    [celebrations, user?.id],
  )

  useEffect(() => {
    if (!focusId) return
    const timer = window.setTimeout(() => {
      document.getElementById(`birthday-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [focusId, upcomingCelebrations])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getItemsForDay = (day: number) => {
    const events = monthEvents.filter((event) =>
      eventOccursOnDay(event, currentDate.getFullYear(), currentDate.getMonth(), day),
    )
    const birthdays = monthBirthdays.filter((entry) => birthdayMonthDay(entry.dateOfBirth)?.day === day)
    return { events, birthdays }
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })
  const focusedDay = Number(searchParams.get("day"))

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:pb-8">
      <PortalPageHeader title="Calendar" description="Club events and birthday celebrations" />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg sm:text-xl">{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2 sm:gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={`${day}-${index}`} className="p-1 text-center text-[11px] font-semibold text-gray-600 sm:p-2 sm:text-sm">
                <span className="sm:hidden">{day}</span>
                <span className="hidden sm:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const { events, birthdays } = getItemsForDay(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
              const isFocused =
                Boolean(focusId) &&
                (birthdays.some((birthday) => (birthday.memberId || birthday.id) === focusId) || focusedDay === day)

              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-10 rounded-md border p-1 sm:min-h-0 sm:aspect-square sm:rounded-lg sm:p-2 hover:bg-gray-50",
                    isToday ? "border-leo-primary bg-leo-primary/5" : "",
                    isFocused ? "ring-2 ring-pink-400 ring-offset-1" : "",
                  )}
                >
                  <div className="text-xs font-semibold sm:mb-1 sm:text-sm">{day}</div>
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="hidden text-xs bg-leo-primary/10 text-leo-primary px-1 py-0.5 rounded mb-1 truncate sm:block"
                    >
                      {event.title}
                    </div>
                  ))}
                  {birthdays.map((birthday) => {
                    const style = birthdayStyle(birthday.style)
                    const isMine = Boolean(user?.id && (birthday.memberId || birthday.id) === user.id)
                    return (
                      <div
                        key={birthday.id}
                        className={cn("hidden truncate rounded px-1 py-0.5 text-xs sm:block", style.chip)}
                      >
                        {isMine ? "You" : withLeoTitle(birthday.memberName)}
                      </div>
                    )
                  })}
                  {events.length + birthdays.length > 0 ? (
                    <div className="mt-0.5 flex justify-center gap-0.5 sm:hidden">
                      {events.map((event) => (
                        <span key={event.id} className="h-1.5 w-1.5 rounded-full bg-leo-primary" />
                      ))}
                      {birthdays.map((birthday) => (
                        <span
                          key={birthday.id}
                          className={cn("h-1.5 w-1.5 rounded-full", birthdayStyle(birthday.style).dot)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {showBirthdays ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming birthdays</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCelebrations.length === 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No birthday celebrations in the next 60 days.</p>
                {user && !user.dateOfBirth ? (
                  <Link href="/portal/profile" className="text-sm font-medium text-leo-primary">
                    Add your birthday to celebrate
                  </Link>
                ) : user?.birthdayVisible === false ? (
                  <Link href="/portal/profile" className="text-sm font-medium text-leo-primary">
                    Show your birthday on the calendar
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingCelebrations.map((birthday) => (
                  <BirthdayCelebrationCard
                    key={birthday.memberId}
                    birthday={birthday}
                    viewerId={user?.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming events</CardTitle>
        </CardHeader>
        <CardContent>
          {liveEvents.filter((event) => isLiveEvent(event)).length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          ) : (
            <div className="space-y-4">
              {liveEvents
                .filter((event) => isLiveEvent(event))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 8)
                .map((event) => (
                  <Link
                    key={event.id}
                    href="/portal/events"
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-lg bg-leo-primary/10 p-3">
                        <CalendarIcon className="h-5 w-5 text-leo-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="mb-1 font-semibold">{event.title}</h3>
                        <p className="text-sm text-gray-600">{formatEventSchedule(event)}</p>
                        <Badge variant="outline" className="mt-1">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
