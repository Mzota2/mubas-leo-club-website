"use client"

import { use, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, ExternalLink, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { hasPaidJoiningFee } from "@/lib/membership/billing"
import {
  useTrainingModule,
  useTrainingModules,
  useTrainingProgress,
  useUpsertTrainingProgress,
} from "@/lib/hooks/use-training-program"
import { curriculumStats, passingScoreFor, RESOURCE_XP, youtubeIdFromUrl } from "@/lib/training/gamify"
import { isLionsClubResource, LIONS_CLUB_DEFAULT_URL } from "@/lib/training/resources"
import { emptyProgress, isModuleUnlocked, publishedModules, withResourceView } from "@/lib/training/progress"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"

export default function PortalTrainingModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, firebaseUser } = useAuth()
  const userId = user?.id || firebaseUser?.uid
  const { data: module } = useTrainingModule(id)
  const { data: modules = [] } = useTrainingModules()
  const { data: savedProgress, isLoading: progressLoading } = useTrainingProgress(userId)
  const { data: fees = [] } = useMembershipFees(userId, true)
  const joiningPaid = userId ? hasPaidJoiningFee(fees, userId, user) : false
  const upsertProgress = useUpsertTrainingProgress()
  const quizRef = useRef<HTMLElement>(null)

  const progress = savedProgress ?? (userId && !progressLoading ? emptyProgress(userId) : null)
  const curriculum = publishedModules(modules)
  const stats = curriculumStats(curriculum)
  const unlocked = module ? isModuleUnlocked(curriculum, progress, module.id) : false
  const resources = (module?.resources ?? []).map((resource, index) => ({
    ...resource,
    id: resource.id || `resource-${index}`,
  }))
  const questions = module?.quiz?.questions ?? []
  const allViewed = resources.length === 0 || resources.every((resource) => progress?.viewedResourceIds.includes(resource.id))
  const requiredScore = passingScoreFor(module?.quiz?.passingScore)
  const savingProgress = upsertProgress.isPending

  const [markingId, setMarkingId] = useState<string | null>(null)

  const latest = useMemo(
    () => progress?.quizAttempts.filter((attempt) => attempt.moduleId === id).at(-1),
    [progress, id],
  )

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

  const markViewed = async (resourceId: string) => {
    if (!progress || savingProgress) return
    const already = progress.viewedResourceIds.includes(resourceId)
    const next = withResourceView(progress, resourceId, stats.moduleCount)
    setMarkingId(resourceId)
    const saved = await persistProgress(next)
    setMarkingId(null)
    if (!saved) return
    if (!already) {
      toast({ title: `+${RESOURCE_XP} XP`, description: "Resource studied. Keep going to unlock the quiz." })
    }
    const studiedAll = resources.every((resource) => next.viewedResourceIds.includes(resource.id))
    if (studiedAll) {
      window.setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
    }
  }

  const markAllViewed = async () => {
    if (!progress || savingProgress) return
    let next = progress
    for (const resource of resources) {
      next = withResourceView(next, resource.id, stats.moduleCount)
    }
    setMarkingId("all")
    const saved = await persistProgress(next)
    setMarkingId(null)
    if (!saved) return
    toast({ title: "Study complete", description: "You can take the quiz now." })
    window.setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
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
        <div className="flex items-center justify-between gap-3">
          <h2 className={`font-semibold ${portalCanvasTitle}`}>Learn</h2>
          {resources.length > 1 && !allViewed ? (
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              disabled={savingProgress || progressLoading || !progress}
              onClick={markAllViewed}
            >
              {markingId === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Mark study complete
            </Button>
          ) : null}
        </div>
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
                  {isLionsClubResource(resource.type) ? (
                    <div className="mt-3 overflow-hidden rounded-md">
                      <a
                        href={resource.url || LIONS_CLUB_DEFAULT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 bg-linear-to-r from-[#4B286D] via-[#3A1F54] to-[#2D1842] p-4 text-white"
                      >
                        <span>
                          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-[#C4A35A]">
                            Lions Clubs International
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium">
                            Open official resource
                            <ExternalLink className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#C4A35A]/15 text-[#C4A35A]">
                          <Globe className="h-4 w-4" />
                        </span>
                      </a>
                      {resource.body ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">{resource.body}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {!viewed ? (
                    <Button
                      type="button"
                      className="mt-4 rounded-md bg-leo-primary text-white"
                      disabled={savingProgress || progressLoading || !progress}
                      onClick={() => markViewed(resource.id)}
                    >
                      {markingId === resource.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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

      <section ref={quizRef} className="rounded-md bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Ready for the quiz?</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {questions.length} question{questions.length === 1 ? "" : "s"} · pass mark {requiredScore}% · {module.xp} XP
          {latest ? ` · last score ${latest.score}%` : ""}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Program totals: {stats.moduleCount} modules · {stats.questionCount} questions · {stats.maxXp} XP available
        </p>

        {!joiningPaid ? (
          <div className="mt-3 rounded-md bg-amber-50 p-3">
            <p className="text-sm text-amber-900">Pay the once-off joining fee to unlock this quiz.</p>
            <Button asChild className="mt-3 bg-leo-primary text-white">
              <Link href="/portal/join-fee">Pay joining fee</Link>
            </Button>
          </div>
        ) : !allViewed ? (
          <div className="mt-3 rounded-md bg-amber-50 p-3">
            <p className="text-sm text-amber-900">Study every resource above before starting the quiz.</p>
            <Button
              type="button"
              className="mt-3 bg-leo-primary text-white"
              disabled={savingProgress || progressLoading || !progress}
              onClick={markAllViewed}
            >
              {markingId === "all" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mark study complete
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">The quiz has not been added yet.</p>
        ) : (
          <Button asChild className="mt-4 w-full bg-[#F59E0B] text-white hover:bg-[#D97706]">
            <Link href={`/portal/training/${id}/quiz`}>{latest && !latest.passed ? "Retake quiz" : latest?.passed ? "Review quiz" : "Start quiz"}</Link>
          </Button>
        )}
      </section>
    </div>
  )
}
