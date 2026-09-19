"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Sparkles, Users, UserPlus, UserCheck, ShieldCheck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { useUsers, useUpdateUser } from "@/lib/hooks/use-users"
import { useAuth } from "@/lib/hooks/use-auth"
import { useAllTrainingProgress, useUpsertTrainingProgress } from "@/lib/hooks/use-training-program"
import { emptyProgress, withWaiver } from "@/lib/training/progress"
import { useToast } from "@/hooks/use-toast"
import { displayName, formatDate } from "@/lib/utils/format"
import { downloadCsv } from "@/lib/utils/csv"
import { graduationStatus, yearOfStudyLabel } from "@/lib/content/academic"
import type { User } from "@/lib/types"

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [membershipFilter, setMembershipFilter] = useState<"all" | "leo" | "prospective-leo" | "pending">("all")

  const { data: users, isLoading } = useUsers()
  const updateUser = useUpdateUser()
  const { user: adminUser } = useAuth()
  const { data: progressList } = useAllTrainingProgress()
  const upsertProgress = useUpsertTrainingProgress()
  const { toast } = useToast()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [waiverUser, setWaiverUser] = useState<User | null>(null)
  const [waiverReason, setWaiverReason] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editValues, setEditValues] = useState({
    role: "member" as User["role"],
    membershipStatus: "active" as NonNullable<User["membershipStatus"]>,
    position: "" as string,
    leoId: "" as string,
  })
  const [promoteValues, setPromoteValues] = useState({
    whatsappGroupLink: "" as string,
  })

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let list = users ?? []

    if (membershipFilter === "pending") {
      list = list.filter((user) => user.membershipStatus === "pending")
    } else if (membershipFilter !== "all") {
      list = list.filter((user) => user.membershipType === membershipFilter)
    }

    if (query) {
      list = list.filter((user) => {
        const fullName = displayName(user).toLowerCase()
        return (
          user.email?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query) ||
          fullName.includes(query) ||
          (user.leoId ?? "").toLowerCase().includes(query) ||
          (user.programOfStudy ?? "").toLowerCase().includes(query)
        )
      })
    }

    return list
  }, [users, searchQuery, membershipFilter])

  const openEdit = (user: User) => {
    setSelectedUser(user)
    setEditValues({
      role: user.role ?? "member",
      membershipStatus: user.membershipStatus ?? "active",
      position: user.position ?? "",
      leoId: user.leoId ?? "",
    })
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    if (!selectedUser) return
    await updateUser.mutateAsync({
      userId: selectedUser.id,
      data: {
        role: editValues.role,
        membershipStatus: editValues.membershipStatus,
        position: editValues.position || undefined,
        leoId: editValues.leoId || undefined,
      },
    })
    setIsEditOpen(false)
    setSelectedUser(null)
  }

  const handlePromote = async () => {
    if (!selectedUser) return

    try {
      await updateUser.mutateAsync({
        userId: selectedUser.id,
        data: {
          membershipType: "leo",
          whatsappGroupLink: promoteValues.whatsappGroupLink || undefined,
        },
      })

      const { createNotification } = await import("@/lib/firebase/firestore")
      await createNotification({
        userId: selectedUser.id,
        type: "announcement",
        title: "Congratulations! You're now a Leo Member",
        message: promoteValues.whatsappGroupLink
          ? `Welcome to Leo Club! Join our WhatsApp group: ${promoteValues.whatsappGroupLink}`
          : "Welcome to Leo Club! You've been promoted to a full Leo member.",
        read: false,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Success",
        description: `${selectedUser.firstName} has been promoted to Leo member`,
      })

      setIsPromoteOpen(false)
      setSelectedUser(null)
      setPromoteValues({ whatsappGroupLink: "" })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to promote member",
        variant: "destructive",
      })
    }
  }

  const openPromoteDialog = (user: User) => {
    if (user.membershipType !== "prospective-leo") {
      toast({
        title: "Invalid Action",
        description: "Only prospective-leos can be promoted",
        variant: "destructive",
      })
      return
    }
    setSelectedUser(user)
    setPromoteValues({
      whatsappGroupLink: user.whatsappGroupLink || "",
    })
    setIsPromoteOpen(true)
  }

  const handleApprove = async (member: User) => {
    try {
      await updateUser.mutateAsync({
        userId: member.id,
        data: {
          membershipStatus: "active",
          joinedDate: member.joinedDate || new Date().toISOString(),
        },
      })
      toast({
        title: "Member approved",
        description: `${displayName(member)} can continue as an approved ${member.membershipType === "leo" ? "Leo" : "prospective member"}.`,
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve member",
        variant: "destructive",
      })
    }
  }

  const handleWaiver = async () => {
    if (!waiverUser || !waiverReason.trim() || !adminUser?.id) return
    const now = new Date().toISOString()
    const existing = progressList?.find((entry) => entry.userId === waiverUser.id) ?? emptyProgress(waiverUser.id)
    try {
      await upsertProgress.mutateAsync({
        userId: waiverUser.id,
        data: withWaiver(existing, adminUser.id, waiverReason.trim()),
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
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to waive training",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const rows = filteredUsers.map((member) => ({
      leoId: member.leoId,
      firstName: member.firstName,
      middleName: member.middleName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      role: member.role,
      position: member.position,
      membershipStatus: member.membershipStatus,
      programOfStudy: member.programOfStudy,
      yearOfStudy: member.yearOfStudy,
      expectedGraduationDate: member.expectedGraduationDate,
      dateOfBirth: member.dateOfBirth,
      joinedDate: member.joinedDate ?? member.createdAt,
    }))
    downloadCsv(`leo-members-${Date.now()}.csv`, rows)
  }

  const prospectiveLeos = users?.filter((user) => user.membershipType === "prospective-leo") || []
  const leos = users?.filter((user) => user.membershipType === "leo") || []
  const pendingApprovals = users?.filter((user) => user.membershipStatus === "pending") || []
  const graduatingSoon = users?.filter((user) => graduationStatus(user.expectedGraduationDate).tone === "amber") || []
  const graduated = users?.filter((user) => graduationStatus(user.expectedGraduationDate).ended) || []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Members"
        description="Search, update, and promote club members."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={handleExport} disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total members" value={users?.length || 0} icon={Users} accent="blue" loading={isLoading} />
        <AdminStatCard title="Leo members" value={leos.length} icon={UserCheck} accent="green" loading={isLoading} />
        <AdminStatCard
          title="Prospective Leos"
          value={prospectiveLeos.length}
          hint="Joining members in training"
          icon={UserPlus}
          accent="amber"
          loading={isLoading}
        />
        <AdminStatCard
          title="Pending approval"
          value={pendingApprovals.length}
          hint="Joining members waiting for review"
          icon={ShieldCheck}
          accent="orange"
          loading={isLoading}
        />
        <AdminStatCard
          title="Graduating soon"
          value={graduatingSoon.length}
          hint={`${graduated.length} already past graduation`}
          icon={Sparkles}
          accent="amber"
          loading={isLoading}
        />
      </div>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg font-semibold">
              Directory ({isLoading ? "…" : filteredUsers.length})
            </CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, phone, or Leo ID"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-9 sm:w-72"
                />
              </div>
              <Select value={membershipFilter} onValueChange={(value) => setMembershipFilter(value as typeof membershipFilter)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  <SelectItem value="pending">Pending approval</SelectItem>
                  <SelectItem value="leo">Leo members</SelectItem>
                  <SelectItem value="prospective-leo">Prospective Leos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leo ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Graduation</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11}>
                      <div className="space-y-2 py-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                      No members match this search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.leoId ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{displayName(member)}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            member.membershipType === "leo"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {member.membershipType === "leo" ? "Leo" : "Prospective"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-40">
                          <p className="font-medium">{member.programOfStudy || "—"}</p>
                          <p className="text-xs text-muted-foreground">{yearOfStudyLabel(member.yearOfStudy)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const status = graduationStatus(member.expectedGraduationDate)
                          return (
                            <div className="min-w-36">
                              <p>{formatDate(member.expectedGraduationDate)}</p>
                              <Badge
                                className={
                                  status.tone === "rose"
                                    ? "mt-1 border-transparent bg-rose-100 text-rose-700"
                                    : status.tone === "amber"
                                      ? "mt-1 border-transparent bg-amber-100 text-amber-800"
                                      : status.tone === "emerald"
                                        ? "mt-1 border-transparent bg-emerald-100 text-emerald-700"
                                        : "mt-1 border-transparent bg-neutral-100 text-neutral-600"
                                }
                              >
                                {status.label}
                              </Badge>
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>{member.position ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            (member.membershipStatus ?? "active") === "pending"
                              ? "border-transparent bg-amber-500 text-white"
                              : (member.membershipStatus ?? "active") === "active"
                              ? "border-transparent bg-emerald-500 text-white"
                              : (member.membershipStatus ?? "active") === "suspended"
                                ? "border-transparent bg-rose-500 text-white"
                                : "border-transparent bg-neutral-500 text-white"
                          }
                        >
                          {member.membershipStatus ?? "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.joinedDate ?? member.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                            Edit
                          </Button>
                          {member.membershipStatus === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(member)}
                              className="border-amber-200 text-amber-800 hover:bg-amber-50"
                            >
                              Approve
                            </Button>
                          )}
                          {member.membershipType === "prospective-leo" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPromoteDialog(member)}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                <Sparkles className="h-3 w-3" />
                                Promote
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setWaiverUser(member)
                                  setWaiverReason("")
                                }}
                              >
                                <ShieldCheck className="h-3 w-3" />
                                Waive training
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Member details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{displayName(selectedUser)}</p>
              </div>

              <div className="grid gap-1 rounded-md border bg-neutral-50 p-3">
                <p className="text-sm text-muted-foreground">Academic</p>
                <p className="font-medium">{selectedUser.programOfStudy || "Not provided"}</p>
                <p className="text-sm text-muted-foreground">
                  {yearOfStudyLabel(selectedUser.yearOfStudy)} · Graduates {formatDate(selectedUser.expectedGraduationDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Membership should end after graduation. Status: {graduationStatus(selectedUser.expectedGraduationDate).label}.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={editValues.role}
                  onValueChange={(value) => setEditValues((current) => ({ ...current, role: value as User["role"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editValues.membershipStatus}
                  onValueChange={(value) =>
                    setEditValues((current) => ({
                      ...current,
                      membershipStatus: value as NonNullable<User["membershipStatus"]>,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="leoId">Leo ID</Label>
                  <Input
                    id="leoId"
                    value={editValues.leoId}
                    onChange={(event) => setEditValues((current) => ({ ...current, leoId: event.target.value }))}
                    disabled={updateUser.isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editValues.position}
                    onChange={(event) => setEditValues((current) => ({ ...current, position: event.target.value }))}
                    disabled={updateUser.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-leo-primary text-white hover:bg-leo-primary-dark"
              onClick={handleSave}
              disabled={updateUser.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote to Leo member</DialogTitle>
            <DialogDescription>
              Promote {selectedUser?.firstName} {selectedUser?.lastName} from prospective Leo to full membership.
              To skip quizzes because they already completed assessment, use Waive training instead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="whatsappLink">WhatsApp group link (optional)</Label>
              <Input
                id="whatsappLink"
                value={promoteValues.whatsappGroupLink}
                onChange={(event) => setPromoteValues({ ...promoteValues, whatsappGroupLink: event.target.value })}
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="mt-1 text-xs text-muted-foreground">This link is sent to the member when they are promoted.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={updateUser.isPending}
            >
              <Sparkles className="h-4 w-4" />
              Promote to Leo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!waiverUser} onOpenChange={() => setWaiverUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive training</DialogTitle>
            <DialogDescription>
              Use this for people who already completed assessment before this website. They become full Leo members
              without taking the quizzes.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="member-waiver-reason">Reason</Label>
            <Textarea
              id="member-waiver-reason"
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
