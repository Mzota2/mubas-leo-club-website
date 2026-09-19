import type { TrainingModule } from "@/lib/types"

export const TRAINING_PASSING_SCORE = 50
export const RESOURCE_XP = 15
export const PERFECT_QUIZ_XP = 25

export function passingScoreFor(score?: number) {
  return Math.max(TRAINING_PASSING_SCORE, score || TRAINING_PASSING_SCORE)
}

export const trainingBadges = [
  { id: "first_step", name: "First Step", description: "Opened your first learning resource", emoji: "🌱" },
  { id: "quiz_rookie", name: "Quiz Rookie", description: "Passed your first module quiz", emoji: "🎯" },
  { id: "quiz_ace", name: "Quiz Ace", description: "Scored 100% on a quiz", emoji: "⭐" },
  { id: "scholar", name: "Club Scholar", description: "Completed half of the published modules", emoji: "📚" },
  { id: "graduate", name: "Leo Graduate", description: "Finished the new member program", emoji: "🦁" },
] as const

export type TrainingBadgeId = (typeof trainingBadges)[number]["id"]

export function scholarThreshold(moduleCount: number) {
  if (moduleCount <= 1) return 1
  return Math.max(2, Math.ceil(moduleCount / 2))
}

export function trainingBadgeCatalog(moduleCount: number) {
  const scholarAt = scholarThreshold(moduleCount)
  return trainingBadges.map((badge) => {
    if (badge.id === "scholar") {
      return {
        ...badge,
        description:
          moduleCount <= 1 ? "Pass the published module quiz" : `Pass ${scholarAt} of ${moduleCount} published modules`,
      }
    }
    if (badge.id === "graduate") {
      return {
        ...badge,
        description:
          moduleCount <= 1 ? "Finish the published module" : `Finish all ${moduleCount} published modules`,
      }
    }
    return badge
  })
}

export function questionCountFor(module: Pick<TrainingModule, "quiz">) {
  return module.quiz?.questions?.length ?? 0
}

export function resourceCountFor(module: Pick<TrainingModule, "resources">) {
  return module.resources?.length ?? 0
}

export function xpPerQuestion(module: Pick<TrainingModule, "xp" | "quiz">) {
  const questions = questionCountFor(module)
  if (questions <= 0) return 0
  return Math.max(1, Math.round(module.xp / questions))
}

export function curriculumStats(modules: TrainingModule[]) {
  const published = [...modules].filter((module) => module.isPublished)
  const moduleCount = published.length
  const questionCount = published.reduce((sum, module) => sum + questionCountFor(module), 0)
  const resourceCount = published.reduce((sum, module) => sum + resourceCountFor(module), 0)
  const quizXp = published.reduce((sum, module) => sum + module.xp, 0)
  const studyXp = resourceCount * RESOURCE_XP
  const perfectBonus = published.filter((module) => questionCountFor(module) > 0).length * PERFECT_QUIZ_XP
  const maxXp = studyXp + quizXp + perfectBonus
  const passingScore = published.length
    ? Math.max(...published.map((module) => passingScoreFor(module.quiz?.passingScore)))
    : TRAINING_PASSING_SCORE

  return {
    moduleCount,
    questionCount,
    resourceCount,
    studyXp,
    quizXp,
    perfectBonus,
    maxXp,
    passingScore,
  }
}

export function levelForXp(xp: number, maxXp = 500) {
  const ceiling = Math.max(maxXp, 40)
  const trainee = Math.max(8, Math.round(ceiling * 0.25))
  const rising = Math.max(trainee + 1, Math.round(ceiling * 0.55))
  const ready = Math.max(rising + 1, Math.round(ceiling * 0.85))
  if (xp >= ready) return { name: "Leo Ready", rank: 4, next: null as number | null, floor: ready }
  if (xp >= rising) return { name: "Rising Leo", rank: 3, next: ready, floor: rising }
  if (xp >= trainee) return { name: "Trainee", rank: 2, next: rising, floor: trainee }
  return { name: "Cub", rank: 1, next: trainee, floor: 0 }
}

export function youtubeIdFromUrl(url?: string) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?.*?v=))([\w-]{11})/)
  return match?.[1] ?? null
}

export function scorePercent(correct: number, total: number) {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

export function latestAttemptForModule(
  attempts: Array<{ moduleId: string; score: number; passed: boolean; attemptedAt: string }>,
  moduleId: string,
) {
  return [...attempts].reverse().find((attempt) => attempt.moduleId === moduleId)
}

export function awardBadges(input: {
  viewedCount: number
  passedCount: number
  hasPerfectScore: boolean
  completedProgram: boolean
  moduleCount?: number
}) {
  const badges: TrainingBadgeId[] = []
  const scholarAt = scholarThreshold(input.moduleCount ?? 3)
  if (input.viewedCount > 0) badges.push("first_step")
  if (input.passedCount > 0) badges.push("quiz_rookie")
  if (input.hasPerfectScore) badges.push("quiz_ace")
  if (input.passedCount >= scholarAt) badges.push("scholar")
  if (input.completedProgram) badges.push("graduate")
  return badges
}
