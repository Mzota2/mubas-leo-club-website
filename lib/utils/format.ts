import { formatDistanceToNow } from "date-fns"

export function formatDate(value?: string | null, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(value?: string | null, fallback = "—") {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatMoney(amount: number, currency = "MWK") {
  return `${currency} ${Number(amount || 0).toLocaleString()}`
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return formatDistanceToNow(date, { addSuffix: true })
}

export function displayName(person?: {
  firstName?: string
  middleName?: string
  lastName?: string
  name?: string
} | null) {
  if (!person) return "Unknown"
  if (person.name) return person.name
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ").trim() || "Unknown"
}

export function greetingForHour(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
