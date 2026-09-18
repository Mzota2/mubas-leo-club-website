import type { JoinIntent, MembershipStatus, MembershipType, User } from "@/lib/types"

export function membershipFromJoinIntent(intent: JoinIntent) {
  if (intent === "existing") {
    return {
      joinIntent: "existing" as const,
      membershipType: "leo" as MembershipType,
      membershipStatus: "active" as MembershipStatus,
      trainingStatus: "waived" as const,
      trainingCompletedAt: new Date().toISOString(),
      joiningFeePaid: true,
    }
  }

  return {
    joinIntent: "joining" as const,
    membershipType: "prospective-leo" as MembershipType,
    membershipStatus: "pending" as MembershipStatus,
    trainingStatus: "pending" as const,
    joiningFeePaid: false,
  }
}

export function postAuthPath(
  user?: Pick<User, "membershipType" | "joiningFeePaid"> | null,
  fallback = "/portal",
) {
  if (user?.membershipType === "prospective-leo" && !user.joiningFeePaid) return "/portal/join-fee"
  if (user?.membershipType === "prospective-leo") return "/portal/training"
  return fallback
}
