import type { FeePeriod, MembershipBillingSettings, MembershipFee, PlatformSettings } from "@/lib/types"

export const defaultMembershipBilling: MembershipBillingSettings = {
  monthlyFee: 1000,
  semesterFee: 5000,
  yearlyFee: 10000,
  joiningFee: 5000,
  semesterStart: `${new Date().getFullYear()}-01-01`,
  semesterEnd: `${new Date().getFullYear()}-06-30`,
}

export function billingFromSettings(settings?: PlatformSettings | null): MembershipBillingSettings {
  return {
    ...defaultMembershipBilling,
    ...settings?.membership,
  }
}

export function amountForPeriod(period: FeePeriod, billing: MembershipBillingSettings) {
  if (period === "monthly") return billing.monthlyFee
  if (period === "semester") return billing.semesterFee
  if (period === "joining") return billing.joiningFee
  return billing.yearlyFee
}

export function coverageFor(period: FeePeriod, at: Date, billing: MembershipBillingSettings) {
  if (period === "joining") {
    return { start: at, end: new Date("2099-12-31T23:59:59.999Z") }
  }
  if (period === "monthly") {
    const start = new Date(at.getFullYear(), at.getMonth(), 1)
    const end = new Date(at.getFullYear(), at.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end }
  }
  if (period === "yearly") {
    const start = new Date(at.getFullYear(), 0, 1)
    const end = new Date(at.getFullYear(), 11, 31, 23, 59, 59, 999)
    return { start, end }
  }
  const start = new Date(billing.semesterStart)
  const end = new Date(billing.semesterEnd)
  end.setHours(23, 59, 59, 999)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return coverageFor("yearly", at, billing)
  }
  return { start, end }
}

export function toIsoDate(date: Date) {
  return date.toISOString()
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && aEnd >= bStart
}

export function feeCoversRange(fee: MembershipFee, rangeStart: Date, rangeEnd: Date) {
  if (fee.status !== "paid" || fee.period === "joining") return false
  const start = new Date(fee.coverageStart || fee.paymentDate || fee.createdAt)
  const end = new Date(fee.coverageEnd || fee.dueDate || fee.createdAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false
  return rangesOverlap(start, end, rangeStart, rangeEnd)
}

export function memberPaidInRange(fees: MembershipFee[], userId: string, rangeStart: Date, rangeEnd: Date) {
  return fees.some((fee) => fee.userId === userId && feeCoversRange(fee, rangeStart, rangeEnd))
}

export function collectedInRange(fees: MembershipFee[], rangeStart: Date, rangeEnd: Date) {
  return fees
    .filter((fee) => feeCoversRange(fee, rangeStart, rangeEnd))
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0)
}

export function periodLabel(period: FeePeriod) {
  if (period === "monthly") return "Monthly"
  if (period === "semester") return "Semester"
  if (period === "joining") return "Joining"
  return "Yearly"
}

export function hasPaidJoiningFee(
  fees: MembershipFee[],
  userId: string,
  user?: { joiningFeePaid?: boolean; membershipType?: string } | null,
) {
  if (user?.membershipType === "leo") return true
  if (user?.joiningFeePaid) return true
  return fees.some((fee) => fee.userId === userId && fee.period === "joining" && fee.status === "paid")
}

export function needsJoiningFee(user?: { membershipType?: string; joiningFeePaid?: boolean } | null) {
  return user?.membershipType === "prospective-leo" && !user.joiningFeePaid
}
