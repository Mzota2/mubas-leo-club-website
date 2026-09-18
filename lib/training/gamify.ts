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
  { id: "scholar", name: "Club Scholar", description: "Completed three modules", emoji: "📚" },
  { id: "graduate", name: "Leo Graduate", description: "Finished the new member program", emoji: "🦁" },
] as const

export type TrainingBadgeId = (typeof trainingBadges)[number]["id"]

export function levelForXp(xp: number) {
  if (xp >= 500) return { name: "Leo Ready", rank: 4, next: null, floor: 500 }
  if (xp >= 250) return { name: "Rising Leo", rank: 3, next: 500, floor: 250 }
  if (xp >= 100) return { name: "Trainee", rank: 2, next: 250, floor: 100 }
  return { name: "Cub", rank: 1, next: 100, floor: 0 }
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
}) {
  const badges: TrainingBadgeId[] = []
  if (input.viewedCount > 0) badges.push("first_step")
  if (input.passedCount > 0) badges.push("quiz_rookie")
  if (input.hasPerfectScore) badges.push("quiz_ace")
  if (input.passedCount >= 3) badges.push("scholar")
  if (input.completedProgram) badges.push("graduate")
  return badges
}
