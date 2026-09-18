"use client"

import Link from "next/link"
import { GraduationCap, Lock, Star, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTrainingModules, useTrainingProgress } from "@/lib/hooks/use-training-program"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { hasPaidJoiningFee } from "@/lib/membership/billing"
import { trainingBadges, levelForXp, TRAINING_PASSING_SCORE } from "@/lib/training/gamify"
import { emptyProgress, isModuleUnlocked, moduleStreak, overallScore, publishedModules } from "@/lib/training/progress"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

export default function PortalTrainingPage() {
  const { user } = useAuth()
  const { data: modules = [] } = useTrainingModules()
  const { data: savedProgress } = useTrainingProgress(user?.id)
  const { data: fees = [] } = useMembershipFees(user?.id, true)
  const joiningPaid = user ? hasPaidJoiningFee(fees, user.id, user) : false
  const progress = savedProgress ?? (user ? emptyProgress(user.id) : null)
  const curriculum = publishedModules(modules)
  const level = levelForXp(progress?.xp ?? 0)
  const score = overallScore(progress, curriculum.map((module) => module.id))
  const completed = progress?.status === "completed" || progress?.status === "waived" || user?.membershipType === "leo"
  const nextXp = level.next ? `${progress?.xp ?? 0} / ${level.next} XP` : `${progress?.xp ?? 0} XP`
  const streak = moduleStreak(curriculum, progress)
  const pathPercent = curriculum.length
    ? Math.round(((progress?.completedModuleIds.length ?? 0) / curriculum.length) * 100)
    : 0

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <div>
        <h1 className={`text-2xl font-semibold ${portalCanvasTitle}`}>New member training</h1>
        <p className={`mt-1 text-sm ${portalCanvasMuted}`}>
          Complete each module and pass the quiz with at least {TRAINING_PASSING_SCORE}% to become a full Leo.
          {user?.membershipStatus === "pending" ? " An admin still needs to approve your joining request." : ""}
        </p>
      </div>

      {!joiningPaid && user?.membershipType === "prospective-leo" ? (
        <div className="rounded-md bg-white p-4 shadow-sm">
          <p className="font-semibold text-neutral-900">Pay your joining fee first</p>
          <p className="mt-1 text-sm text-neutral-600">
            The once-off joining fee unlocks quizzes. You can review modules, but you cannot take a quiz until it is paid.
          </p>
          <Button asChild className="mt-3 rounded-md bg-leo-primary text-white">
            <Link href="/portal/join-fee">Pay joining fee</Link>
          </Button>
        </div>
      ) : null}

      <section className="rounded-md bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">Level</p>
            <p className="text-xl font-semibold text-neutral-900">{level.name}</p>
            <p className="text-sm text-neutral-600">{nextXp}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
            {completed ? "🦁" : "🧭"}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-[#F59E0B]"
            style={{
              width: `${level.next ? Math.min(100, (((progress?.xp ?? 0) - level.floor) / (level.next - level.floor)) * 100) : 100}%`,
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-amber-50 p-2">
            <p className="text-lg font-semibold text-amber-800">{progress?.xp ?? 0}</p>
            <p className="text-xs text-neutral-600">XP</p>
          </div>
          <div className="rounded-md bg-amber-50 p-2">
            <p className="text-lg font-semibold text-amber-800">{pathPercent}%</p>
            <p className="text-xs text-neutral-600">Path</p>
          </div>
          <div className="rounded-md bg-amber-50 p-2">
            <p className="text-lg font-semibold text-amber-800">{streak}</p>
            <p className="text-xs text-neutral-600">Streak</p>
          </div>
        </div>
        {completed ? (
          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            {progress?.status === "waived"
              ? "Training was waived. Welcome as a full Leo member."
              : "Training complete. You are a full Leo member."}
          </p>
        ) : null}
      </section>

      <section className="rounded-md bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-neutral-900">Badges</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {trainingBadges.map((badge) => {
            const earned = progress?.badges.includes(badge.id)
            return (
              <div
                key={badge.id}
                className={`rounded-md border p-3 ${earned ? "border-amber-200 bg-amber-50" : "border-neutral-100 bg-neutral-50 opacity-60"}`}
              >
                <p className="text-lg">{badge.emoji}</p>
                <p className="text-sm font-semibold text-neutral-900">{badge.name}</p>
                <p className="text-xs text-neutral-600">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={`font-semibold ${portalCanvasTitle}`}>Modules</h2>
        {curriculum.length === 0 ? (
          <div className="rounded-md bg-white p-6 text-neutral-700 shadow-sm">
            Training modules will appear here once an admin publishes them.
          </div>
        ) : (
          curriculum.map((module, index) => {
            const unlocked = isModuleUnlocked(curriculum, progress, module.id)
            const done = progress?.completedModuleIds.includes(module.id)
            const latestScore = [...(progress?.quizAttempts ?? [])].reverse().find((attempt) => attempt.moduleId === module.id)?.score
            return (
              <div key={module.id} className="rounded-md bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Module {index + 1}</p>
                    <h3 className="font-semibold text-neutral-900">{module.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{module.description}</p>
                    <p className="mt-2 text-xs font-medium text-amber-700">
                      +{module.xp} XP{latestScore != null ? ` · last score ${latestScore}%` : ""}
                    </p>
                  </div>
                  {done ? (
                    <Badge className="bg-emerald-600 text-white">Passed</Badge>
                  ) : unlocked ? (
                    <Star className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="mt-3">
                  {unlocked ? (
                    <Button asChild className="rounded-md bg-leo-primary text-white">
                      <Link href={`/portal/training/${module.id}`}>{done ? "Review" : "Continue"}</Link>
                    </Button>
                  ) : (
                    <p className="text-sm text-neutral-500">Pass the previous module to unlock this one.</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>

      <p className={`flex items-center gap-2 text-sm ${portalCanvasMuted}`}>
        <Trophy className="h-4 w-4" />
        Average quiz score: {score}% · Need {TRAINING_PASSING_SCORE}% and every module passed.
      </p>
      <p className={`text-xs ${portalCanvasMuted}`}>
        <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
        Already assessed before this website? Ask an admin for a training waiver.
      </p>
    </div>
  )
}
