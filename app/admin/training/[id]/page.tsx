"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useTrainingModule, useUpdateTrainingModule } from "@/lib/hooks/use-training-program"
import { passingScoreFor, TRAINING_PASSING_SCORE } from "@/lib/training/gamify"
import type { TrainingQuizQuestion, TrainingResource, TrainingResourceType } from "@/lib/types"

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

  const addResource = () => {
    setResources((current) => [
      ...current,
      { id: newId(), type: "youtube", title: "", url: "", body: "" },
    ])
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
          <h2 className="font-semibold">Learning resources</h2>
          <Button type="button" variant="outline" size="sm" onClick={addResource} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add resource
          </Button>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add a YouTube link, a direct video URL, or write an article.</p>
        ) : (
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div key={resource.id} className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Select
                    value={resource.type}
                    onValueChange={(value: TrainingResourceType) =>
                      setResources((current) =>
                        current.map((item) => (item.id === resource.id ? { ...item, type: value } : item)),
                      )
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="video">Direct video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResources((current) => current.filter((item) => item.id !== resource.id))}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <Input
                  placeholder={`Resource ${index + 1} title`}
                  value={resource.title}
                  onChange={(event) =>
                    setResources((current) =>
                      current.map((item) => (item.id === resource.id ? { ...item, title: event.target.value } : item)),
                    )
                  }
                />
                {resource.type === "article" ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Optional article link (https://...)"
                      value={resource.url ?? ""}
                      onChange={(event) =>
                        setResources((current) =>
                          current.map((item) => (item.id === resource.id ? { ...item, url: event.target.value } : item)),
                        )
                      }
                    />
                    <Textarea
                      rows={6}
                      placeholder="Write the article here, or leave this blank if you only added a link"
                      value={resource.body ?? ""}
                      onChange={(event) =>
                        setResources((current) =>
                          current.map((item) => (item.id === resource.id ? { ...item, body: event.target.value } : item)),
                        )
                      }
                    />
                  </div>
                ) : (
                  <Input
                    placeholder={resource.type === "youtube" ? "https://youtube.com/watch?v=..." : "https://.../video.mp4"}
                    value={resource.url ?? ""}
                    onChange={(event) =>
                      setResources((current) =>
                        current.map((item) => (item.id === resource.id ? { ...item, url: event.target.value } : item)),
                      )
                    }
                  />
                )}
              </div>
            ))}
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
