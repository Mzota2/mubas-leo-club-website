"use client"

import { useEffect, useMemo, useState } from "react"
import { Crown, Mail, Pencil, Phone, Plus, Search, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { useUsers } from "@/lib/hooks/use-users"
import { publishCurrentLeaders } from "@/lib/firebase/firestore"
import { useAssignExecutive, useClearExecutiveAssignment, useEndExecutiveTerm } from "@/lib/hooks/use-executives"
import { EXECUTIVE_POSITIONS } from "@/lib/content/defaults"
import {
  currentExecutiveRows,
  leoYearOptions,
  pastExecutiveRows,
  type ExecutiveRow,
} from "@/lib/content/executives"
import { displayName } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

const emptyForm = {
  userId: "",
  position: "President",
  customPosition: "",
  term: leoYearOptions()[3] ?? leoYearOptions()[0],
  status: "current" as "current" | "past",
  order: "1",
  bio: "",
}

export default function AdminExecutivesPage() {
  const { data: users, isLoading } = useUsers()
  const assignExecutive = useAssignExecutive()
  const endTerm = useEndExecutiveTerm()
  const clearAssignment = useClearExecutiveAssignment()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [selected, setSelected] = useState<ExecutiveRow | null>(null)
  const [memberQuery, setMemberQuery] = useState("")
  const [formValues, setFormValues] = useState(emptyForm)

  const members = users ?? []
  const currentRows = useMemo(() => currentExecutiveRows(members), [members])

  useEffect(() => {
    if (!users) return
    void publishCurrentLeaders(users).catch(() => undefined)
  }, [users])
  const pastRows = useMemo(() => pastExecutiveRows(members), [members])
  const isBusy = assignExecutive.isPending || endTerm.isPending || clearAssignment.isPending
  const positionIsCustom = formValues.position === "Other"
  const resolvedPosition = positionIsCustom ? formValues.customPosition.trim() : formValues.position
  const canSubmit = Boolean(formValues.userId && resolvedPosition && formValues.term)

  const selectedMember = members.find((user) => user.id === formValues.userId)
  const memberMatches = members.filter((user) => {
    const query = memberQuery.trim().toLowerCase()
    if (!query) return true
    return (
      displayName(user).toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      (user.leoId ?? "").toLowerCase().includes(query)
    )
  })

  const openCreate = () => {
    setSelected(null)
    setMemberQuery("")
    setFormValues({
      ...emptyForm,
      term: leoYearOptions()[3] ?? leoYearOptions()[0],
      order: String(currentRows.length + 1),
    })
    setIsFormOpen(true)
  }

  const openEdit = (row: ExecutiveRow) => {
    const known = EXECUTIVE_POSITIONS.includes(row.term.position as (typeof EXECUTIVE_POSITIONS)[number])
    setSelected(row)
    setMemberQuery(displayName(row.user))
    setFormValues({
      userId: row.user.id,
      position: known ? row.term.position : "Other",
      customPosition: known ? "" : row.term.position,
      term: row.term.term || (leoYearOptions()[3] ?? leoYearOptions()[0]),
      status: row.term.status,
      order: String(row.term.order ?? ""),
      bio: row.user.executiveBio ?? "",
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await assignExecutive.mutateAsync({
        userId: formValues.userId,
        position: resolvedPosition,
        term: formValues.term,
        status: formValues.status,
        order: formValues.order.trim() ? Number(formValues.order) : undefined,
        bio: formValues.bio.trim() || undefined,
        replace: selected ? { position: selected.term.position, term: selected.term.term } : undefined,
      })
      toast({
        title: formValues.status === "current" ? "Current executive assigned" : "Past term saved",
        description: `${displayName(selectedMember)} will ${formValues.status === "current" ? "appear on the public Leaders page" : "be listed under past terms"}.`,
      })
      setIsFormOpen(false)
      setSelected(null)
    } catch {
      toast({
        title: "Could not save assignment",
        description: "Check your admin access and try again.",
        variant: "destructive",
      })
    }
  }

  const handleEndTerm = async (row: ExecutiveRow) => {
    try {
      await endTerm.mutateAsync(row.user.id)
      toast({ title: "Term ended", description: `${displayName(row.user)} is now listed as a past executive.` })
    } catch {
      toast({ title: "Could not end term", variant: "destructive" })
    }
  }

  const handleRemove = async () => {
    if (!selected) return
    try {
      await clearAssignment.mutateAsync(selected.user.id)
      toast({ title: "Assignment removed", description: `${displayName(selected.user)} is no longer an executive.` })
    } catch {
      toast({ title: "Could not remove assignment", variant: "destructive" })
    } finally {
      setIsRemoveOpen(false)
      setSelected(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Executives"
        description="Assign existing members to executive positions and manage their current or past terms. Current officers appear on the public Leaders page with their profile photos."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Assign member
          </Button>
        }
      />

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">Serving now ({currentRows.length})</TabsTrigger>
          <TabsTrigger value="past">Past terms ({pastRows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <ExecutiveList
            title="Current executive board"
            rows={currentRows}
            loading={isLoading}
            emptyTitle="No current executives"
            emptyDescription="Assign a member to a position and mark the term as current. They will appear on the public Leaders page."
            onAssign={openCreate}
            onEdit={openEdit}
            onEndTerm={handleEndTerm}
            onRemove={(row) => {
              setSelected(row)
              setIsRemoveOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <ExecutiveList
            title="Past executive terms"
            rows={pastRows}
            loading={isLoading}
            emptyTitle="No past terms yet"
            emptyDescription="Ended terms and previous Leo years will show here."
            onAssign={openCreate}
            onEdit={openEdit}
            onRemove={(row) => {
              setSelected(row)
              setIsRemoveOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{selected ? "Edit assignment" : "Assign member"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Member</Label>
              {selected ? (
                <div className="flex items-center gap-3 rounded-md border bg-[#FBF9F6] p-3">
                  <MemberPhoto user={selected.user} />
                  <div>
                    <p className="font-medium">{displayName(selected.user)}</p>
                    <p className="text-sm text-muted-foreground">{selected.user.email}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={memberQuery}
                      onChange={(event) => setMemberQuery(event.target.value)}
                      placeholder="Search members by name, email, or Leo ID"
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-md border">
                    {memberMatches.slice(0, 12).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 ${formValues.userId === user.id ? "bg-amber-50" : ""}`}
                        onClick={() => {
                          setFormValues((current) => ({ ...current, userId: user.id }))
                          setMemberQuery(displayName(user))
                        }}
                      >
                        <MemberPhoto user={user} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{displayName(user)}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.leoId ? `${user.leoId} · ` : ""}
                            {user.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Position</Label>
                <Select
                  value={formValues.position}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXECUTIVE_POSITIONS.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Term</Label>
                <Select
                  value={formValues.term}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, term: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {leoYearOptions().map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {positionIsCustom ? (
              <div className="grid gap-2">
                <Label htmlFor="customPosition">Custom position</Label>
                <Input
                  id="customPosition"
                  value={formValues.customPosition}
                  onChange={(event) => setFormValues((current) => ({ ...current, customPosition: event.target.value }))}
                />
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Term status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as "current" | "past" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Serving now</SelectItem>
                    <SelectItem value="past">Past term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Display order</Label>
                <Input
                  id="order"
                  type="number"
                  min={1}
                  value={formValues.order}
                  onChange={(event) => setFormValues((current) => ({ ...current, order: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Public bio (optional)</Label>
              <Textarea
                id="bio"
                value={formValues.bio}
                onChange={(event) => setFormValues((current) => ({ ...current, bio: event.target.value }))}
                placeholder="Shown on the public Leaders page"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-leo-primary text-white hover:bg-leo-primary-dark"
              onClick={handleSubmit}
              disabled={isBusy || !canSubmit}
            >
              {selected ? "Save assignment" : "Assign member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove executive assignment</AlertDialogTitle>
            <AlertDialogDescription>
              {selected ? displayName(selected.user) : "This member"} will no longer be listed as an executive. The member account stays in the club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
              Remove assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MemberPhoto({ user }: { user: User }) {
  if (user.profileImage) {
    return <img src={user.profileImage} alt={displayName(user)} className="h-10 w-10 rounded-full object-cover" />
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
      {user.firstName?.[0] || "L"}
      {user.lastName?.[0] ?? ""}
    </div>
  )
}

function ExecutiveList({
  title,
  rows,
  loading,
  emptyTitle,
  emptyDescription,
  onAssign,
  onEdit,
  onEndTerm,
  onRemove,
}: {
  title: string
  rows: ExecutiveRow[]
  loading: boolean
  emptyTitle: string
  emptyDescription: string
  onAssign: () => void
  onEdit: (row: ExecutiveRow) => void
  onEndTerm?: (row: ExecutiveRow) => void
  onRemove: (row: ExecutiveRow) => void
}) {
  return (
    <Card className="rounded-md border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <AdminEmptyState
            icon={Crown}
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={onAssign}>
                <Plus className="h-4 w-4" />
                Assign member
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex flex-col gap-3 rounded-md border border-border/60 bg-[#FBF9F6] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <MemberPhoto user={row.user} />
                  <div className="min-w-0">
                    <p className="font-semibold">{displayName(row.user)}</p>
                    <p className="text-sm text-leo-primary">{row.term.position}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {row.term.term ? <span>Term {row.term.term}</span> : null}
                      {row.user.email ? (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{row.user.email}</span>
                        </span>
                      ) : null}
                      {row.user.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {row.user.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={row.term.status === "current" ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-800"}>
                    {row.term.status === "current" ? "Serving now" : "Past term"}
                  </Badge>
                  <Button variant="outline" size="icon" onClick={() => onEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {onEndTerm && row.term.status === "current" ? (
                    <Button variant="outline" onClick={() => onEndTerm(row)}>
                      End term
                    </Button>
                  ) : null}
                  <Button variant="outline" size="icon" onClick={() => onRemove(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
