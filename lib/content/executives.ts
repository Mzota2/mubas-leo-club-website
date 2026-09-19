import { displayName } from "@/lib/utils/format"
import type { ExecutiveTerm, Leader, User } from "@/lib/types"
import { sortLeaders } from "@/lib/content/defaults"

export type ExecutiveRow = {
  key: string
  user: User
  term: ExecutiveTerm
}

export function leoYearOptions(around = new Date().getFullYear()) {
  return [around - 3, around - 2, around - 1, around, around + 1].map((year) => `${year}-${year + 1}`)
}

export function memberTerms(user: User): ExecutiveTerm[] {
  if (user.executiveTerms?.length) return user.executiveTerms
  if (!user.position) return []
  return [
    {
      position: user.position,
      term: user.executiveTerm || "",
      status: user.executiveStatus || "current",
      order: user.executiveOrder,
    },
  ]
}

export function flattenExecutiveRows(users: User[]): ExecutiveRow[] {
  return users.flatMap((user) =>
    memberTerms(user).map((term, index) => ({
      key: `${user.id}-${term.term}-${term.position}-${index}`,
      user,
      term,
    })),
  )
}

export function currentExecutiveRows(users: User[]) {
  return flattenExecutiveRows(users).filter((row) => row.term.status === "current")
}

export function pastExecutiveRows(users: User[]) {
  return flattenExecutiveRows(users).filter((row) => row.term.status === "past")
}

export function userToPublicLeader(user: User): Leader {
  const termLabel = user.executiveTerm ? ` for the ${user.executiveTerm} term` : ""
  return {
    id: user.id,
    name: displayName(user),
    position: user.position || "Executive",
    bio: user.executiveBio?.trim() || (user.position ? `Serving as ${user.position}${termLabel}.` : ""),
    image: user.profileImage || "",
    email: user.email,
    phone: user.phone,
    order: user.executiveOrder,
  }
}

export function sortPublicLeaders(leaders: Leader[]) {
  return sortLeaders(leaders)
}
