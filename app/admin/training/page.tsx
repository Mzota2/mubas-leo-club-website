"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { GraduationCap, Plus, Pencil, Trash2, ShieldCheck } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUsers, useUpdateUser } from "@/lib/hooks/use-users"
import {
  useAllTrainingProgress,
  useCreateTrainingModule,
  useDeleteTrainingModule,
  useTrainingModules,
  useUpsertTrainingProgress,
} from "@/lib/hooks/use-training-program"
import { TRAINING_PASSING_SCORE } from "@/lib/training/gamify"
import { emptyProgress, overallScore, publishedModules, withWaiver } from "@/lib/training/progress"
import { displayName } from "@/lib/utils/format"
import type { User } from "@/lib/types"

export default function AdminTrainingPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { data: modules, isLoading } = useTrainingModules()
  const { data: users } = useUsers()
  const { data: progressList } = useAllTrainingProgress()
  const createModule = useCreateTrainingModule()
  const deleteModule = useDeleteTrainingModule()
  const upsertProgress = useUpsertTrainingProgress()
  const updateUser = useUpdateUser()

  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [waiverUser, setWaiverUser] = useState<User | null>(null)
  const [waiverReason, setWaiverReason] = useState("")

  const ordered = useMemo(() => [...(modules ?? [])].sort((a, b) => a.order - b.order), [modules])
  const published = publishedModules(ordered)
  const prospectives = (users ?? []).filter((item) => item.membershipType === "prospective-leo")
  const learners = useMemo(() => {
    const list = users ?? []
    return list.filter(
      (item) =>
        item.membershipType === "prospective-leo" ||
        item.trainingStatus === "completed" ||
        item.trainingStatus === "waived" ||
        progressList?.some((entry) => entry.userId === item.id),
    )
  }, [users, progressList])

  const handleCreate = async () => {
    if (!title.trim()) return
    await createModule.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      order: ordered.length + 1,
      xp: 100,
      isPublished: false,
      resources: [],
      quiz: { passingScore: TRAINING_PASSING_SCORE, questions: [] },
    })
    toast({ title: "Module created", description: "Add resources and a quiz next." })
    setTitle("")
    setDescription("")
    setCreateOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteModule.mutateAsync(deleteId)
    setDeleteId(null)
    toast({ title: "Module deleted" })
  }

  const handleWaiver = async () => {
    if (!waiverUser || !waiverReason.trim() || !user?.id) return
    const now = new Date().toISOString()
    const existing = progressList?.find((entry) => entry.userId === waiverUser.id) ?? emptyProgress(waiverUser.id)
    await upsertProgress.mutateAsync({
      userId: waiverUser.id,
      data: withWaiver(existing, user.id, waiverReason.trim()),
    })
    await updateUser.mutateAsync({
      userId: waiverUser.id,
      data: {
        membershipType: "leo",
        trainingStatus: "waived",
        trainingCompletedAt: now,
      },
    })
    toast({
      title: "Training waived",
      description: `${displayName(waiverUser)} is now a full Leo member.`,
    })
    setWaiverUser(null)
    setWaiverReason("")
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New member training"
        description="Build modules, attach learning resources, run quizzes, and waive members who already completed assessment."
        actions={
          <Button onClick={() => setCreateOpen(true)} className="bg-leo-primary text-white hover:bg-leo-primary-dark">
            <Plus className="h-4 w-4" />
            Add module
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard title="Modules" value={ordered.length} icon={GraduationCap} />
        <AdminStatCard title="Published" value={published.length} icon={GraduationCap} accent="orange" />
        <AdminStatCard title="Prospectives in training" value={prospectives.length} icon={ShieldCheck} accent="red" />
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Curriculum</TabsTrigger>
          <TabsTrigger value="learners">Progress & waivers</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : ordered.length === 0 ? (
            <AdminEmptyState
              icon={GraduationCap}
              title="No modules yet"
              description="Create the first training module, then add a video, article, and quiz."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordered.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>{module.order}</TableCell>
                      <TableCell>
                        <p className="font-medium">{module.title}</p>
                        <p className="text-sm text-muted-foreground">{module.xp} XP</p>
                      </TableCell>
                      <TableCell>{module.resources?.length ?? 0}</TableCell>
                      <TableCell>{module.quiz?.questions?.length ?? 0} questions</TableCell>
                      <TableCell>
                        <Badge variant={module.isPublished ? "default" : "secondary"}>
                          {module.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/training/${module.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(module.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="learners" className="mt-4">
          <div className="overflow-x-auto rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No learners yet. Prospectives appear here after they register.
                    </TableCell>
                  </TableRow>
                ) : (
                  learners.map((item) => {
                    const progress = progressList?.find((entry) => entry.userId === item.id)
                    const score = overallScore(progress ?? null, published.map((module) => module.id))
                    const canWaive = item.membershipType === "prospective-leo" && progress?.status !== "waived"
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{displayName(item)}</p>
                          <p className="text-sm text-muted-foreground">{item.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{progress?.status ?? item.trainingStatus ?? "not started"}</Badge>
                        </TableCell>
                        <TableCell>
                          {progress?.completedModuleIds.length ?? 0}/{published.length} modules
                        </TableCell>
                        <TableCell>{score}%</TableCell>
                        <TableCell className="text-right">
                          {canWaive ? (
                            <Button variant="outline" size="sm" onClick={() => setWaiverUser(item)}>
                              Waive training
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {item.membershipType === "leo" ? "Full Leo" : ""}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New module</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="module-title">Title</Label>
              <Input id="module-title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="module-desc">Description</Label>
              <Textarea
                id="module-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim() || createModule.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this module?</AlertDialogTitle>
            <AlertDialogDescription>Resources and quiz questions on it will be removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!waiverUser} onOpenChange={() => setWaiverUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive training</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Use this for people who already completed assessment before the website. They become full Leo members
            without taking the quizzes.
          </p>
          <div>
            <Label htmlFor="waiver-reason">Reason</Label>
            <Textarea
              id="waiver-reason"
              value={waiverReason}
              onChange={(event) => setWaiverReason(event.target.value)}
              className="mt-1"
              placeholder="Completed prior club orientation in 2024"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaiverUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleWaiver} disabled={!waiverReason.trim() || upsertProgress.isPending}>
              Waive and promote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
