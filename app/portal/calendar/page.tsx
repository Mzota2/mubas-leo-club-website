"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { PortalPageHeader } from "@/components/portal/page-header"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events = [
    {
      id: 1,
      title: "Blood Donation Drive",
      date: new Date(2024, 6, 15),
      category: "Health Causes",
      attended: false,
    },
    {
      id: 2,
      title: "Tree Planting Campaign",
      date: new Date(2024, 6, 22),
      category: "Environment",
      attended: false,
    },
    {
      id: 3,
      title: "General Meeting",
      date: new Date(2024, 6, 18),
      category: "General Meeting",
      attended: true,
    },
  ]

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

  const getEventsForDay = (day: number) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear(),
    )
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:pb-8">
      <PortalPageHeader title="Calendar" description="Track events and mark your attendance" />

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
              const dayEvents = getEventsForDay(day)
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`min-h-10 rounded-md border p-1 sm:min-h-0 sm:aspect-square sm:rounded-lg sm:p-2 hover:bg-gray-50 ${
                    isToday ? "border-leo-primary bg-leo-primary/5" : ""
                  }`}
                >
                  <div className="text-xs font-semibold sm:mb-1 sm:text-sm">{day}</div>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="hidden text-xs bg-leo-primary/10 text-leo-primary px-1 py-0.5 rounded mb-1 truncate sm:block"
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 0 ? (
                    <div className="mt-0.5 flex justify-center gap-0.5 sm:hidden">
                      {dayEvents.map((event) => (
                        <span key={event.id} className="h-1.5 w-1.5 rounded-full bg-leo-primary" />
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="p-3 rounded-lg bg-leo-primary/10">
                    <CalendarIcon className="h-5 w-5 text-leo-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {event.date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {event.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={event.attended ? "outline" : "default"}
                  className={event.attended ? "w-full sm:w-auto" : "w-full bg-leo-primary hover:bg-leo-primary-dark sm:w-auto"}
                >
                  {event.attended ? "Attended" : "Mark Attendance"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
