"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Trophy } from "lucide-react"
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
import { passingScoreFor, PERFECT_QUIZ_XP, RESOURCE_XP, youtubeIdFromUrl } from "@/lib/training/gamify"
import {
  emptyProgress,
  isModuleUnlocked,
  publishedModules,
  withGraduation,
  withQuizAttempt,
  withResourceView,
} from "@/lib/training/progress"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

export default function PortalTrainingModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { data: module } = useTrainingModule(id)
  const { data: modules = [] } = useTrainingModules()
  const { data: savedProgress } = useTrainingProgress(user?.id)
  const { data: fees = [] } = useMembershipFees(user?.id)
  const joiningPaid = user ? hasPaidJoiningFee(fees, user.id, user) : false
  const upsertProgress = useUpsertTrainingProgress()
  const updateUser = useUpdateUser()

  const progress = savedProgress ?? (user ? emptyProgress(user.id) : null)
  const curriculum = publishedModules(modules)
  const unlocked = module ? isModuleUnlocked(curriculum, progress, module.id) : false
  const resources = module?.resources ?? []
  const questions = module?.quiz.questions ?? []
  const allViewed = resources.length === 0 || resources.every((resource) => progress?.viewedResourceIds.includes(resource.id))
  const requiredScore = passingScoreFor(module?.quiz.passingScore)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean; graduated: boolean } | null>(null)

  const latest = useMemo(
    () => progress?.quizAttempts.filter((attempt) => attempt.moduleId === id).at(-1),
    [progress, id],
  )

  const markViewed = async (resourceId: string) => {
    if (!user || !progress) return
    const already = progress.viewedResourceIds.includes(resourceId)
    const next = withResourceView(progress, resourceId)
    await upsertProgress.mutateAsync({ userId: user.id, data: next })
    if (!already) {
      toast({ title: `+${RESOURCE_XP} XP`, description: "Resource studied. Keep the streak going." })
    }
  }

  const submitQuiz = async () => {
    if (!user || !progress || !module || questions.length === 0) return
    if (!joiningPaid) {
      toast({ title: "Joining fee required", description: "Pay the once-off joining fee before taking quizzes." })
      router.push("/portal/join-fee")
      return
    }
    const correct = questions.filter((question) => answers[question.id] === question.correctIndex).length
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= requiredScore
    let next = withQuizAttempt(progress, module, score)
    next = withGraduation(next, curriculum)
    await upsertProgress.mutateAsync({ userId: user.id, data: next })
    if (next.status === "completed" && user.membershipType !== "leo") {
      await updateUser.mutateAsync({
        userId: user.id,
        data: {
          membershipType: "leo",
          trainingStatus: "completed",
          trainingCompletedAt: new Date().toISOString(),
        },
      })
    }
    setResult({ score, passed, graduated: next.status === "completed" })
    if (passed) {
      toast({
        title: score >= 100 ? `Perfect! +${module.xp + PERFECT_QUIZ_XP} XP` : `Module passed · +${module.xp} XP`,
        description: next.status === "completed" ? "You are now a full Leo member." : "Next module unlocked.",
      })
    }
  }

  if (!module) {
    return <p className={`px-4 py-6 ${portalCanvasTitle}`}>Loading module…</p>
  }

  if (!unlocked) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className={`font-semibold ${portalCanvasTitle}`}>This module is locked</p>
        <Button asChild variant="outline" className="bg-white">
          <Link href="/portal/training">Back to training</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <button type="button" onClick={() => router.push("/portal/training")} className={`flex items-center gap-1 ${portalCanvasTitle}`}>
        <ArrowLeft className="h-5 w-5" />
        Training
      </button>
      <div>
        <h1 className={`text-2xl font-semibold ${portalCanvasTitle}`}>{module.title}</h1>
        <p className={`mt-1 text-sm ${portalCanvasMuted}`}>{module.description}</p>
      </div>

      <section className="space-y-4">
        <h2 className={`font-semibold ${portalCanvasTitle}`}>Learn</h2>
        {resources.length === 0 ? (
          <div className="rounded-md bg-white p-4 text-sm text-neutral-700">No resources yet. You can still take the quiz if questions are ready.</div>
        ) : (
          resources.map((resource) => {
            const viewed = progress?.viewedResourceIds.includes(resource.id)
            const youtubeId = youtubeIdFromUrl(resource.url)
            return (
              <div key={resource.id} className="overflow-hidden rounded-md bg-white shadow-sm">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-neutral-900">{resource.title}</h3>
                    {viewed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
                  </div>
                  {resource.type === "youtube" && youtubeId ? (
                    <div className="mt-3 aspect-video overflow-hidden rounded-md bg-black">
                      <iframe
                        title={resource.title}
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                  {resource.type === "youtube" && resource.url && !youtubeId ? (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-leo-primary">
                      Open YouTube resource
                    </a>
                  ) : null}
                  {resource.type === "video" && resource.url ? (
                    <video src={resource.url} controls className="mt-3 w-full rounded-md" />
                  ) : null}
                  {resource.type === "article" && resource.url ? (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-leo-primary">
                      Open linked article
                    </a>
                  ) : null}
                  {resource.type === "article" && resource.body ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{resource.body}</p>
                  ) : null}
                  {!viewed ? (
                    <Button type="button" className="mt-4 rounded-md bg-leo-primary text-white" onClick={() => markViewed(resource.id)}>
                      Mark as studied · +{RESOURCE_XP} XP
                    </Button>
                  ) : (
                    <p className="mt-3 text-sm font-medium text-emerald-700">Studied</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </section>

      <section className="rounded-md bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Quiz</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Score at least {requiredScore}% to complete this module and earn {module.xp} XP.
          {latest ? ` Last score: ${latest.score}%.` : ""}
        </p>

        {!joiningPaid ? (
          <div className="mt-3 rounded-md bg-amber-50 p-3">
            <p className="text-sm text-amber-900">Pay the once-off joining fee to unlock this quiz. It is separate from membership dues.</p>
            <Button asChild className="mt-3 bg-leo-primary text-white">
              <Link href="/portal/join-fee">Pay joining fee</Link>
            </Button>
          </div>
        ) : !allViewed ? (
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Study every resource above before unlocking the quiz.</p>
        ) : questions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">The quiz has not been added yet.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {questions.map((question, index) => (
              <fieldset key={question.id} className="space-y-2">
                <legend className="font-medium text-neutral-900">
                  {index + 1}. {question.prompt}
                </legend>
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center gap-2 text-sm text-neutral-800">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <Button
              type="button"
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < questions.length || upsertProgress.isPending}
              className="rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
            >
              Submit quiz
            </Button>
          </div>
        )}

        {result ? (
          <div className={`mt-4 rounded-md p-4 ${result.passed ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
            <p className="text-lg font-semibold">{result.score}%</p>
            <p className="text-sm">
              {result.passed
                ? result.graduated
                  ? "Training complete. You are now a full Leo member."
                  : "Module passed. XP added. Continue to the next stage."
                : `Need ${requiredScore}% or more. Review the resources and try again.`}
            </p>
            {result.passed ? (
              <Button asChild className="mt-3 bg-leo-primary text-white">
                <Link href="/portal/training">Back to path</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>

      {result?.graduated ? (
        <div className="rounded-md bg-gradient-to-br from-amber-400 to-red-600 p-5 text-white shadow-sm">
          <Trophy className="h-8 w-8" />
          <p className="mt-2 text-xl font-semibold">Leo Graduate</p>
          <p className="text-sm text-white/90">You cleared the new member program. Welcome to full membership.</p>
        </div>
      ) : null}
    </div>
  )
}
