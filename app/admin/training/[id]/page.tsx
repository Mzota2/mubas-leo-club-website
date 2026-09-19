"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, FileText, Globe, Plus, Trash2, Video, Youtube, type LucideIcon } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useTrainingModule, useUpdateTrainingModule } from "@/lib/hooks/use-training-program"
import { passingScoreFor, TRAINING_PASSING_SCORE } from "@/lib/training/gamify"
import { isLionsClubResource, LIONS_CLUB_DEFAULT_URL, resourceUrlPlaceholder } from "@/lib/training/resources"
import type { TrainingQuizQuestion, TrainingResource, TrainingResourceType } from "@/lib/types"

const RESOURCE_TYPE_OPTIONS: {
  value: TrainingResourceType
  label: string
  hint: string
  icon: LucideIcon
}[] = [
  { value: "lionsclubinternational", label: "Lions International", hint: "Official LCI page", icon: Globe },
  { value: "youtube", label: "YouTube", hint: "Embed a lesson", icon: Youtube },
  { value: "video", label: "Video", hint: "Direct video file", icon: Video },
  { value: "article", label: "Article", hint: "Write or link", icon: FileText },
]

function normalizeResourceType(type: TrainingResourceType) {
  return isLionsClubResource(type) ? "lionsclubinternational" : type
}

function newId() {
  return crypto.randomUUID()
}

export default function AdminTrainingModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: module, isLoading } = useTrainingModule(id)
  const updateModule = useUpdateTrainingModule()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [order, setOrder] = useState(1)
  const [xp, setXp] = useState(100)
  const [isPublished, setIsPublished] = useState(false)
  const [resources, setResources] = useState<TrainingResource[]>([])
  const [questions, setQuestions] = useState<TrainingQuizQuestion[]>([])
  const [passingScore, setPassingScore] = useState(TRAINING_PASSING_SCORE)

  useEffect(() => {
    if (!module) return
    setTitle(module.title)
    setDescription(module.description)
    setOrder(module.order)
    setXp(module.xp)
    setIsPublished(module.isPublished)
    setResources(module.resources ?? [])
    setQuestions(module.quiz?.questions ?? [])
    setPassingScore(module.quiz?.passingScore ?? TRAINING_PASSING_SCORE)
  }, [module])

  const addResource = (type: TrainingResourceType = "youtube") => {
    const next: TrainingResource = { id: newId(), type, title: "", url: "", body: "" }
    if (isLionsClubResource(type)) {
      next.title = "Lions Clubs International"
      next.url = LIONS_CLUB_DEFAULT_URL
    }
    setResources((current) => [...current, next])
  }

  const updateResource = (resourceId: string, patch: Partial<TrainingResource>) => {
    setResources((current) => current.map((item) => (item.id === resourceId ? { ...item, ...patch } : item)))
  }

  const changeResourceType = (resource: TrainingResource, type: TrainingResourceType) => {
    const next: Partial<TrainingResource> = { type }
    if (isLionsClubResource(type)) {
      if (!resource.url) next.url = LIONS_CLUB_DEFAULT_URL
      if (!resource.title.trim()) next.title = "Lions Clubs International"
    }
    updateResource(resource.id, next)
  }

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      { id: newId(), prompt: "", options: ["", "", "", ""], correctIndex: 0 },
    ])
  }

  const handleSave = async () => {
    await updateModule.mutateAsync({
      moduleId: id,
      data: {
        title: title.trim(),
        description: description.trim(),
        order,
        xp,
        isPublished,
        resources,
        quiz: { passingScore: passingScoreFor(passingScore), questions },
      },
    })
    toast({ title: "Module saved" })
    router.push("/admin/training")
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!module) {
    return <p className="text-muted-foreground">Module not found.</p>
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-2 w-fit">
        <Link href="/admin/training">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <AdminPageHeader title={title || "Edit module"} description="Add learning resources, then a quiz for this module." />

      <section className="space-y-4 rounded-md border bg-white p-4">
        <h2 className="font-semibold">Module details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="order">Order</Label>
            <Input id="order" type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="xp">XP reward</Label>
            <Input id="xp" type="number" value={xp} onChange={(event) => setXp(Number(event.target.value))} className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} id="published" />
            <Label htmlFor="published">Published for prospective members</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-md border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Learning resources</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a Lions Clubs International page, YouTube lesson, video, or article.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addResource()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add resource
          </Button>
        </div>
        {resources.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {RESOURCE_TYPE_OPTIONS.map((option) => {
              const Icon = option.icon
              const isLions = isLionsClubResource(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => addResource(option.value)}
                  className={`rounded-md border p-3 text-left transition-colors hover:border-leo-primary/40 hover:bg-neutral-50 ${
                    isLions ? "border-[#4B286D]/25 bg-[#4B286D]/4" : "bg-[#FBF9F6]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        isLions ? "bg-[#4B286D] text-[#C4A35A]" : "bg-white text-leo-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{option.label}</span>
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">{option.hint}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource, index) => {
              const selectedType = normalizeResourceType(resource.type)
              const lionsResource = isLionsClubResource(resource.type)
              return (
                <div
                  key={resource.id}
                  className={`space-y-3 overflow-hidden rounded-md border p-3 ${
                    lionsResource ? "border-[#4B286D]/25 bg-[#4B286D]/3" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                      {RESOURCE_TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon
                        const selected = selectedType === option.value
                        const isLions = isLionsClubResource(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => changeResourceType(resource, option.value)}
                            className={`rounded-md border px-2 py-2 text-left transition-colors ${
                              selected && isLions
                                ? "border-[#4B286D] bg-[#4B286D] text-white"
                                : selected
                                  ? "border-leo-primary bg-leo-primary text-white"
                                  : isLions
                                    ? "border-[#4B286D]/20 bg-white text-[#4B286D] hover:border-[#4B286D]/40"
                                    : "bg-white hover:border-leo-primary/40"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="mt-1 block text-xs font-medium leading-tight">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResources((current) => current.filter((item) => item.id !== resource.id))}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  {lionsResource ? (
                    <div className="overflow-hidden rounded-md bg-linear-to-r from-[#4B286D] via-[#3A1F54] to-[#2D1842] p-3 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C4A35A]">
                            Lions Clubs International
                          </p>
                          <p className="mt-1 text-sm text-white/85">
                            Members open this official LCI page to learn more about Lions and Leos.
                          </p>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#C4A35A]/15 text-[#C4A35A]">
                          <Globe className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <Label htmlFor={`resource-title-${resource.id}`}>Title</Label>
                    <Input
                      id={`resource-title-${resource.id}`}
                      placeholder={lionsResource ? "Lions Clubs International" : `Resource ${index + 1} title`}
                      value={resource.title}
                      onChange={(event) => updateResource(resource.id, { title: event.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {resource.type === "article" ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`resource-url-${resource.id}`}>Optional link</Label>
                        <Input
                          id={`resource-url-${resource.id}`}
                          placeholder={resourceUrlPlaceholder("article")}
                          value={resource.url ?? ""}
                          onChange={(event) => updateResource(resource.id, { url: event.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`resource-body-${resource.id}`}>Article</Label>
                        <Textarea
                          id={`resource-body-${resource.id}`}
                          rows={6}
                          placeholder="Write the article here, or leave this blank if you only added a link"
                          value={resource.body ?? ""}
                          onChange={(event) => updateResource(resource.id, { body: event.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`resource-url-${resource.id}`}>
                          {lionsResource ? "Lions Clubs International URL" : "Resource URL"}
                        </Label>
                        <Input
                          id={`resource-url-${resource.id}`}
                          placeholder={resourceUrlPlaceholder(resource.type)}
                          value={resource.url ?? ""}
                          onChange={(event) => updateResource(resource.id, { url: event.target.value })}
                          className="mt-1"
                        />
                      </div>
                      {lionsResource ? (
                        <div>
                          <Label htmlFor={`resource-note-${resource.id}`}>What members should review</Label>
                          <Textarea
                            id={`resource-note-${resource.id}`}
                            rows={3}
                            placeholder="Optional note, e.g. Read the Leo Club Program page, then return to mark this as studied."
                            value={resource.body ?? ""}
                            onChange={(event) => updateResource(resource.id, { body: event.target.value })}
                            className="mt-1"
                          />
                          {resource.url ? (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#4B286D]"
                            >
                              Preview page
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-md border bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Module quiz</h2>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>
        <div className="max-w-xs">
          <Label htmlFor="pass">Passing score (%)</Label>
          <Input
            id="pass"
            type="number"
            min={50}
            max={100}
            value={passingScore}
            onChange={(event) => setPassingScore(Number(event.target.value))}
            className="mt-1"
          />
        </div>
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="space-y-3 rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <Input
                placeholder={`Question ${questionIndex + 1}`}
                value={question.prompt}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((item) => (item.id === question.id ? { ...item, prompt: event.target.value } : item)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctIndex === optionIndex}
                  onChange={() =>
                    setQuestions((current) =>
                      current.map((item) => (item.id === question.id ? { ...item, correctIndex: optionIndex } : item)),
                    )
                  }
                />
                <Input
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) =>
                    setQuestions((current) =>
                      current.map((item) =>
                        item.id === question.id
                          ? {
                              ...item,
                              options: item.options.map((value, index) => (index === optionIndex ? event.target.value : value)),
                            }
                          : item,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Select the radio next to the correct answer.</p>
          </div>
        ))}
      </section>

      <Button onClick={handleSave} disabled={!title.trim() || updateModule.isPending} className="bg-leo-primary text-white">
        Save module
      </Button>
    </div>
  )
}
