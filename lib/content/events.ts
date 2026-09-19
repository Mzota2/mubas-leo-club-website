import type { Event } from "@/lib/types"
import { formatDate } from "@/lib/utils/format"

function dayStamp(value?: string) {
  if (!value) return null
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function eventEndDate(event: Pick<Event, "date" | "endDate" | "category">) {
  if (event.category === "fundraising" && event.endDate) return event.endDate
  return event.date
}

export function resolveEventStatus(
  event: Pick<Event, "date" | "endDate" | "category" | "status">,
  now = new Date(),
): Event["status"] {
  if (event.status === "cancelled") return "cancelled"

  const start = dayStamp(event.date)
  const end = dayStamp(eventEndDate(event))
  if (!start) return "upcoming"

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const startDay = new Date(start)
  startDay.setHours(0, 0, 0, 0)
  const endDay = new Date(end ?? start)
  endDay.setHours(0, 0, 0, 0)

  if (today < startDay) return "upcoming"
  if (today > endDay) return "completed"
  return "ongoing"
}

export function isLiveEvent(event: Event, now = new Date()) {
  const status = resolveEventStatus(event, now)
  return status === "upcoming" || status === "ongoing"
}

export function isPastEvent(event: Event, now = new Date()) {
  const status = resolveEventStatus(event, now)
  return status === "completed" || status === "cancelled"
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDayLabel(value?: string) {
  if (!value) return "—"
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return formatDate(value)
  const day = Number(match[3])
  const month = Number(match[2])
  const year = match[1]
  if (!day || !month) return formatDate(value)
  return `${day} ${MONTHS[month - 1]} ${year}`
}

export function formatEventSchedule(event: Pick<Event, "date" | "endDate" | "time" | "category">) {
  const start = formatDayLabel(event.date)
  const spans =
    event.category === "fundraising" && event.endDate && event.endDate.slice(0, 10) !== event.date.slice(0, 10)

  if (spans) {
    return `${start} – ${formatDayLabel(event.endDate)}`
  }

  return event.time ? `${start} · ${event.time}` : start
}

export function eventStatusLabel(status: Event["status"]) {
  if (status === "upcoming") return "Upcoming"
  if (status === "ongoing") return "Ongoing"
  if (status === "completed") return "Completed"
  return "Cancelled"
}

export function eventStatusClass(status: Event["status"]) {
  if (status === "upcoming") return "border-transparent bg-sky-500 text-white"
  if (status === "ongoing") return "border-transparent bg-amber-500 text-white"
  if (status === "cancelled") return "border-transparent bg-rose-500 text-white"
  return "border-transparent bg-emerald-500 text-white"
}

export function eventOverlapsMonth(
  event: Pick<Event, "date" | "endDate" | "category">,
  year: number,
  month: number,
) {
  const start = dayStamp(event.date)
  const end = dayStamp(eventEndDate(event)) ?? start
  if (!start || !end) return false
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  monthStart.setHours(0, 0, 0, 0)
  monthEnd.setHours(0, 0, 0, 0)
  return start <= monthEnd && end >= monthStart
}

export function eventOccursOnDay(
  event: Pick<Event, "date" | "endDate" | "category">,
  year: number,
  month: number,
  day: number,
) {
  const start = dayStamp(event.date)
  const end = dayStamp(eventEndDate(event)) ?? start
  if (!start || !end) return false
  const target = new Date(year, month, day)
  target.setHours(0, 0, 0, 0)
  return target >= start && target <= end
}
