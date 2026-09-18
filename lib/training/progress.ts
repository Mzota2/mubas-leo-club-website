import type { TrainingModule, TrainingProgress } from "@/lib/types"
import { awardBadges, passingScoreFor, PERFECT_QUIZ_XP, RESOURCE_XP, TRAINING_PASSING_SCORE } from "@/lib/training/gamify"

export function emptyProgress(userId: string): TrainingProgress {
  const now = new Date().toISOString()
  return {
    id: userId,
    userId,
    xp: 0,
    badges: [],
    completedModuleIds: [],
    viewedResourceIds: [],
    quizAttempts: [],
    status: "not_started",
    createdAt: now,
    updatedAt: now,
  }
}

export function publishedModules(modules: TrainingModule[]) {
  return [...modules].filter((module) => module.isPublished).sort((a, b) => a.order - b.order)
}

export function isModuleUnlocked(modules: TrainingModule[], progress: TrainingProgress | null, moduleId: string) {
  const list = publishedModules(modules)
  const index = list.findIndex((module) => module.id === moduleId)
  if (index <= 0) return true
  const previous = list[index - 1]
  return progress?.completedModuleIds.includes(previous.id) ?? false
}

export function overallScore(progress: TrainingProgress | null, moduleIds: string[]) {
  if (!progress || moduleIds.length === 0) return 0
  const latest = moduleIds.map((id) =>
    [...progress.quizAttempts].reverse().find((attempt) => attempt.moduleId === id),
  )
  const scored = latest.filter(Boolean) as NonNullable<(typeof latest)[number]>[]
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, attempt) => sum + attempt.score, 0) / scored.length)
}

export function withResourceView(progress: TrainingProgress, resourceId: string): TrainingProgress {
  if (progress.viewedResourceIds.includes(resourceId)) return progress
  const viewedResourceIds = [...progress.viewedResourceIds, resourceId]
  const xp = progress.xp + RESOURCE_XP
  return refreshBadges({
    ...progress,
    viewedResourceIds,
    xp,
    status: progress.status === "not_started" ? "in_progress" : progress.status,
  })
}

export function moduleStreak(modules: TrainingModule[], progress: TrainingProgress | null) {
  let streak = 0
  for (const module of publishedModules(modules)) {
    if (progress?.completedModuleIds.includes(module.id)) streak += 1
    else break
  }
  return streak
}

export function withQuizAttempt(
  progress: TrainingProgress,
  module: TrainingModule,
  score: number,
): TrainingProgress {
  const passed = score >= passingScoreFor(module.quiz.passingScore)
  const quizAttempts = [
    ...progress.quizAttempts,
    { moduleId: module.id, score, passed, attemptedAt: new Date().toISOString() },
  ]
  const alreadyComplete = progress.completedModuleIds.includes(module.id)
  const completedModuleIds = passed && !alreadyComplete
    ? [...progress.completedModuleIds, module.id]
    : progress.completedModuleIds
  const bonus = passed && !alreadyComplete && score >= 100 ? PERFECT_QUIZ_XP : 0
  const xp = passed && !alreadyComplete ? progress.xp + module.xp + bonus : progress.xp
  return refreshBadges({
    ...progress,
    quizAttempts,
    completedModuleIds,
    xp,
    status: progress.status === "completed" || progress.status === "waived" ? progress.status : "in_progress",
  })
}

export function withWaiver(progress: TrainingProgress, adminId: string, reason: string): TrainingProgress {
  const now = new Date().toISOString()
  return refreshBadges({
    ...progress,
    status: "waived",
    waived: true,
    waivedBy: adminId,
    waivedReason: reason,
    waivedAt: now,
    completedAt: now,
  })
}

export function withGraduation(progress: TrainingProgress, modules: TrainingModule[]): TrainingProgress {
  const required = publishedModules(modules)
  if (required.length === 0) return progress
  const allPassed = required.every((module) => progress.completedModuleIds.includes(module.id))
  const score = overallScore(progress, required.map((module) => module.id))
  if (!allPassed || score < TRAINING_PASSING_SCORE) return progress
  return refreshBadges({
    ...progress,
    status: "completed",
    completedAt: progress.completedAt ?? new Date().toISOString(),
  })
}

function refreshBadges(progress: TrainingProgress): TrainingProgress {
  const hasPerfectScore = progress.quizAttempts.some((attempt) => attempt.score >= 100)
  return {
    ...progress,
    badges: awardBadges({
      viewedCount: progress.viewedResourceIds.length,
      passedCount: progress.completedModuleIds.length,
      hasPerfectScore,
      completedProgram: progress.status === "completed" || progress.status === "waived",
    }),
  }
}
