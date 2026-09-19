export const STUDY_PROGRAMS: readonly string[] = []

export const STUDY_YEARS = [
  { value: "1", label: "Year 1" },
  { value: "2", label: "Year 2" },
  { value: "3", label: "Year 3" },
  { value: "4", label: "Year 4" },
  { value: "5", label: "Year 5" },
] as const

export function graduationStatus(expectedGraduationDate?: string | null, now = new Date()) {
  if (!expectedGraduationDate) return { label: "Unknown", tone: "neutral" as const, ended: false }
  const date = new Date(expectedGraduationDate)
  if (Number.isNaN(date.getTime())) return { label: expectedGraduationDate, tone: "neutral" as const, ended: false }

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  if (date < today) return { label: "Graduated", tone: "rose" as const, ended: true }

  const inSixMonths = new Date(today)
  inSixMonths.setMonth(inSixMonths.getMonth() + 6)
  if (date <= inSixMonths) return { label: "Graduating soon", tone: "amber" as const, ended: false }

  return { label: "Active student", tone: "emerald" as const, ended: false }
}

export function birthdayMonthDay(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null
  const date = new Date(dateOfBirth)
  if (Number.isNaN(date.getTime())) return null
  return { month: date.getMonth(), day: date.getDate() }
}

export function nextBirthday(dateOfBirth?: string | null, now = new Date()) {
  const parts = birthdayMonthDay(dateOfBirth)
  if (!parts) return null
  const next = new Date(now.getFullYear(), parts.month, parts.day)
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1)
  }
  return next
}

export function isBirthdayToday(dateOfBirth?: string | null, now = new Date()) {
  const parts = birthdayMonthDay(dateOfBirth)
  if (!parts) return false
  return parts.month === now.getMonth() && parts.day === now.getDate()
}

export function daysUntilBirthday(dateOfBirth?: string | null, now = new Date()) {
  const next = nextBirthday(dateOfBirth, now)
  if (!next) return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((next.getTime() - start.getTime()) / 86400000)
}

export function yearOfStudyLabel(value?: string | null) {
  if (!value) return "—"
  return STUDY_YEARS.find((year) => year.value === value)?.label ?? value
}

export type UpcomingBirthday = {
  memberId: string
  memberName: string
  memberImage?: string
  dateOfBirth: string
  nextDate: Date
  daysAway: number
  isToday: boolean
  style?: string
  message?: string
}

export function upcomingBirthdays(
  entries: {
    memberId?: string
    memberName?: string
    memberImage?: string
    dateOfBirth?: string
    style?: string
    message?: string
  }[],
  now = new Date(),
  withinDays = 60,
  alwaysIncludeIds: string[] = [],
): UpcomingBirthday[] {
  return entries
    .map((entry) => {
      const next = nextBirthday(entry.dateOfBirth, now)
      const daysAway = daysUntilBirthday(entry.dateOfBirth, now)
      if (!next || daysAway == null || !entry.dateOfBirth) return null
      const memberId = entry.memberId || entry.memberName || entry.dateOfBirth
      if (daysAway > withinDays && !alwaysIncludeIds.includes(memberId)) return null
      return {
        memberId: entry.memberId || entry.memberName || entry.dateOfBirth,
        memberName: entry.memberName || "Leo",
        memberImage: entry.memberImage,
        dateOfBirth: entry.dateOfBirth,
        nextDate: next,
        daysAway,
        isToday: daysAway === 0,
        style: entry.style,
        message: entry.message,
      }
    })
    .filter((entry): entry is UpcomingBirthday => Boolean(entry))
    .sort((a, b) => a.daysAway - b.daysAway)
}

export function todayBirthdays(
  entries: Parameters<typeof upcomingBirthdays>[0],
  now = new Date(),
): UpcomingBirthday[] {
  return upcomingBirthdays(entries, now, 0).filter((entry) => entry.isToday)
}
