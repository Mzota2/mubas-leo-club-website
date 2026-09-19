import { displayName } from "@/lib/utils/format"
import type { BirthdayCalendarEntry, User } from "@/lib/types"

export const BIRTHDAY_STYLES = [
  {
    id: "classic",
    label: "Classic Leo",
    card: "bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white",
    caption: "bg-gradient-to-t from-[#DC2626] via-[#F59E0B]/90 to-transparent",
    chip: "bg-pink-100 text-pink-700",
    dot: "bg-pink-500",
    hover: "hover:bg-pink-50",
  },
  {
    id: "sunset",
    label: "Sunset",
    card: "bg-gradient-to-br from-orange-400 to-rose-500 text-white",
    caption: "bg-gradient-to-t from-rose-500 via-orange-400/90 to-transparent",
    chip: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
    hover: "hover:bg-orange-50",
  },
  {
    id: "ocean",
    label: "Ocean",
    card: "bg-gradient-to-br from-sky-400 to-indigo-600 text-white",
    caption: "bg-gradient-to-t from-indigo-600 via-sky-400/90 to-transparent",
    chip: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    hover: "hover:bg-sky-50",
  },
  {
    id: "forest",
    label: "Forest",
    card: "bg-gradient-to-br from-emerald-400 to-teal-700 text-white",
    caption: "bg-gradient-to-t from-teal-700 via-emerald-400/90 to-transparent",
    chip: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    hover: "hover:bg-emerald-50",
  },
  {
    id: "sparkle",
    label: "Sparkle",
    card: "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white",
    caption: "bg-gradient-to-t from-fuchsia-500 via-violet-500/90 to-transparent",
    chip: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    hover: "hover:bg-violet-50",
  },
] as const

export type BirthdayStyleId = (typeof BIRTHDAY_STYLES)[number]["id"]

export function birthdayStyle(id?: string | null) {
  return BIRTHDAY_STYLES.find((style) => style.id === id) ?? BIRTHDAY_STYLES[0]
}

export function hasProfilePhoto(url?: string | null) {
  if (!url) return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.includes("placeholder")) return false
  return true
}

export function birthdayCalendarHref(memberId: string, nextDate?: Date) {
  const params = new URLSearchParams({ focus: memberId })
  if (nextDate) {
    params.set("year", String(nextDate.getFullYear()))
    params.set("month", String(nextDate.getMonth() + 1))
    params.set("day", String(nextDate.getDate()))
  }
  return `/portal/calendar?${params.toString()}`
}

export function celebrationEntries(
  entries: BirthdayCalendarEntry[],
  viewer?: Pick<
    User,
    | "id"
    | "firstName"
    | "lastName"
    | "middleName"
    | "username"
    | "profileImage"
    | "dateOfBirth"
    | "birthdayStyle"
    | "birthdayMessage"
    | "birthdayVisible"
  > | null,
): BirthdayCalendarEntry[] {
  if (!viewer?.id || !viewer.dateOfBirth || viewer.birthdayVisible === false) {
    return entries
  }

  const own: BirthdayCalendarEntry = {
    id: viewer.id,
    memberId: viewer.id,
    memberName: displayName(viewer),
    memberImage: viewer.profileImage,
    dateOfBirth: viewer.dateOfBirth,
    style: viewer.birthdayStyle || "classic",
    message: viewer.birthdayMessage,
    updatedAt: new Date().toISOString(),
  }

  return [...entries.filter((entry) => (entry.memberId || entry.id) !== viewer.id), own]
}
