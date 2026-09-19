"use client"

import { use, useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUpdateUser } from "@/lib/hooks/use-users"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { hasPaidJoiningFee } from "@/lib/membership/billing"
import {
  useTrainingModule,
  useTrainingModules,
  useTrainingProgress,
  useUpsertTrainingProgress,
} from "@/lib/hooks/use-training-program"
import { curriculumStats, passingScoreFor, PERFECT_QUIZ_XP } from "@/lib/training/gamify"
import { emptyProgress, isModuleUnlocked, publishedModules, withGraduation, withQuizAttempt } from "@/lib/training/progress"
import { portalCanvasTitle } from "@/components/portal/styles"
import { QuizScreen } from "@/components/training/quiz-screen"
import { LeoGraduation } from "@/components/training/leo-graduation"

export default function PortalTrainingQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, firebaseUser } = useAuth()
  const userId = user?.id || firebaseUser?.uid
  const { data: module } = useTrainingModule(id)
  const { data: modules = [] } = useTrainingModules()
  const { data: savedProgress, isLoading: progressLoading } = useTrainingProgress(userId)
  const { data: fees = [] } = useMembershipFees(userId, true)
  const upsertProgress = useUpsertTrainingProgress()
  const updateUser = useUpdateUser()
  const [attempt, setAttempt] = useState(0)
  const [outcome, setOutcome] = useState<{ score: number; passed: boolean; graduated: boolean } | null>(null)

  const progress = savedProgress ?? (userId && !progressLoading ? emptyProgress(userId) : null)
  const curriculum = publishedModules(modules)
  const stats = curriculumStats(curriculum)
  const unlocked = module ? isModuleUnlocked(curriculum, progress, module.id) : false
  const questions = module?.quiz?.questions ?? []
  const resources = (module?.resources ?? []).map((resource, index) => ({
    ...resource,
    id: resource.id || `resource-${index}`,
  }))
  const allViewed = resources.length === 0 || resources.every((resource) => progress?.viewedResourceIds.includes(resource.id))
  const joiningPaid = userId ? hasPaidJoiningFee(fees, userId, user) : false
  const moduleIndex = curriculum.findIndex((item) => item.id === id)
  const nextModule = moduleIndex >= 0 ? curriculum[moduleIndex + 1] : undefined
  const requiredScore = passingScoreFor(module?.quiz?.passingScore)

  const persistProgress = async (next: ReturnType<typeof emptyProgress>) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Sign in again to save training progress.", variant: "destructive" })
      return false
    }
    try {
      await upsertProgress.mutateAsync({ userId, data: next })
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save training progress."
      toast({ title: "Progress not saved", description: message, variant: "destructive" })
      return false
    }
  }

  const goHome = useCallback(() => {
    router.push("/portal")
  }, [router])

  const finishQuiz = async ({ score, passed }: { score: number; correct: number; passed: boolean }) => {
    if (!progress || !module) return
    let next = withQuizAttempt(progress, module, score, stats.moduleCount)
    next = withGraduation(next, curriculum)
    const saved = await persistProgress(next)
    if (!saved) return

    const graduated = next.status === "completed"
    setOutcome({ score, passed, graduated })

    if (graduated && user?.membershipType !== "leo" && userId) {
      try {
        await updateUser.mutateAsync({
          userId,
          data: {
            membershipType: "leo",
            trainingStatus: "completed",
            trainingCompletedAt: new Date().toISOString(),
          },
        })
      } catch (error) {
        console.error("Graduate profile update failed", error)
      }
    }

    if (passed && !graduated && nextModule) {
      toast({
        title: score >= 100 ? `Perfect · +${module.xp + PERFECT_QUIZ_XP} XP` : `Module passed · +${module.xp} XP`,
        description: "Opening the next module.",
      })
      window.setTimeout(() => router.push(`/portal/training/${nextModule.id}`), 1200)
    }
  }

  const retake = () => {
    setOutcome(null)
    setAttempt((value) => value + 1)
  }

  if (!module) {
    return <p className={`px-4 py-6 ${portalCanvasTitle}`}>Loading quiz…</p>
  }

  if (!unlocked) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className={`font-semibold ${portalCanvasTitle}`}>This quiz is locked</p>
        <Button asChild variant="outline" className="bg-white">
          <Link href="/portal/training">Back to training</Link>
        </Button>
      </div>
    )
  }

  if (!joiningPaid) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className={`font-semibold ${portalCanvasTitle}`}>Pay the joining fee to take quizzes</p>
        <Button asChild className="bg-leo-primary text-white">
          <Link href="/portal/join-fee">Pay joining fee</Link>
        </Button>
      </div>
    )
  }

  if (!allViewed) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className={`font-semibold ${portalCanvasTitle}`}>Study the resources first</p>
        <Button asChild className="bg-leo-primary text-white">
          <Link href={`/portal/training/${id}`}>Back to module</Link>
        </Button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className={`font-semibold ${portalCanvasTitle}`}>This module has no quiz questions yet</p>
        <Button asChild variant="outline" className="bg-white">
          <Link href={`/portal/training/${id}`}>Back to module</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-90 overflow-y-auto bg-linear-to-b from-[#F59E0B] via-[#DC2626] to-[#7F1D1D]">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4 text-white">
          <button type="button" onClick={() => router.push(`/portal/training/${id}`)} className="flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Resources
          </button>
          <p className="text-sm font-medium">Module quiz</p>
        </div>

        {outcome?.graduated ? (
          <div className="px-4 py-10 text-center text-white">
            <p className="text-lg font-semibold">Training complete</p>
          </div>
        ) : outcome && !outcome.passed ? (
          <div className="mx-auto max-w-lg px-4 py-8">
            <div className="rounded-md bg-white p-5 text-center">
              <p className="text-3xl font-semibold text-red-600">{outcome.score}%</p>
              <p className="mt-2 font-semibold text-neutral-900">Not quite there</p>
              <p className="mt-1 text-sm text-neutral-600">
                You need {requiredScore}% to pass this module. Review the resources, then retake the quiz.
              </p>
              <div className="mt-4 grid gap-2">
                <Button type="button" className="bg-leo-primary text-white" onClick={retake}>
                  Retake quiz
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/portal/training/${id}`}>Review resources</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : outcome?.passed && nextModule ? (
          <div className="mx-auto max-w-lg px-4 py-8">
            <div className="rounded-md bg-white p-5 text-center">
              <p className="text-3xl font-semibold text-emerald-600">{outcome.score}%</p>
              <p className="mt-2 font-semibold text-neutral-900">Module passed</p>
              <p className="mt-1 text-sm text-neutral-600">Taking you to the next module.</p>
            </div>
          </div>
        ) : (
          <QuizScreen
            key={attempt}
            module={module}
            questions={questions}
            moduleIndex={Math.max(moduleIndex, 0)}
            moduleCount={stats.moduleCount || 1}
            questionCount={stats.questionCount}
            saving={upsertProgress.isPending}
            onComplete={finishQuiz}
          />
        )}
      </div>
      {outcome?.graduated ? <LeoGraduation onFinished={goHome} /> : null}
    </>
  )
}
