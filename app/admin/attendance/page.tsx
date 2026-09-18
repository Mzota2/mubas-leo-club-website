"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMeetings, useCreateMeeting } from "@/lib/hooks/use-meetings"
import { useAttendance, useBulkCreateAttendance, useUpdateAttendance } from "@/lib/hooks/use-attendance"
import { useUsers } from "@/lib/hooks/use-users"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Plus, Calendar, Users, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { formatDate } from "@/lib/utils/format"
import type { Attendance, User } from "@/lib/types"

export default function AttendancePage() {
  const { data: meetings, isLoading: meetingsLoading } = useMeetings()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { user: currentUser } = useAuth()
  const createMeeting = useCreateMeeting()
  const bulkCreateAttendance = useBulkCreateAttendance()
  const updateAttendance = useUpdateAttendance()
  const { toast } = useToast()

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false)
  const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false)
  const [isPenaltyFormOpen, setIsPenaltyFormOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<{ attendance: Attendance; user: User } | null>(null)

  const { data: attendanceRecords, isLoading: attendanceLoading } = useAttendance(selectedMeetingId || "")

  const [meetingFormValues, setMeetingFormValues] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  })

  const [attendanceFormValues, setAttendanceFormValues] = useState<Record<string, "present" | "absent" | "excused">>({})
  const [penaltyFormValues, setPenaltyFormValues] = useState({
    amount: "",
    reason: "",
    dueDate: "",
  })

  const selectedMeeting = meetings?.find((m) => m.id === selectedMeetingId)

  // Filter to only show Leo members for attendance
  const leoMembers = useMemo(() => {
    return users?.filter((u) => u.membershipType === "leo" && u.membershipStatus === "active") || []
  }, [users])

  const handleCreateMeeting = async () => {
    if (!meetingFormValues.title || !meetingFormValues.date || !meetingFormValues.time) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const createdBy = currentUser?.id || "admin"

      await createMeeting.mutateAsync({
        title: meetingFormValues.title,
        date: meetingFormValues.date,
        time: meetingFormValues.time,
        location: meetingFormValues.location,
        description: meetingFormValues.description,
        createdBy,
      })

      toast({
        title: "Success",
        description: "Meeting created successfully",
      })

      setIsMeetingFormOpen(false)
      setMeetingFormValues({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting",
        variant: "destructive",
      })
    }
  }

  const handleRecordAttendance = async () => {
    if (!selectedMeetingId) return

    const records = leoMembers.map((member) => ({
      meetingId: selectedMeetingId,
      userId: member.id,
      status: attendanceFormValues[member.id] || "absent",
    }))

    try {
      await bulkCreateAttendance.mutateAsync(records)

      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      })

      setIsAttendanceFormOpen(false)
      setAttendanceFormValues({})
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      })
    }
  }

  const handleAddPenalty = async () => {
    if (!selectedAttendance || !penaltyFormValues.amount || !penaltyFormValues.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const dueDate = penaltyFormValues.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      await updateAttendance.mutateAsync({
        attendanceId: selectedAttendance.attendance.id,
        data: {
          penalty: {
            amount: parseFloat(penaltyFormValues.amount),
            reason: penaltyFormValues.reason,
            status: "pending",
            dueDate,
          },
        },
      })

      // Create notification for the user
      const { createNotification } = await import("@/lib/firebase/firestore")
      await createNotification({
        userId: selectedAttendance.user.id,
        type: "general",
        title: "Attendance Penalty",
        message: `You have been assigned a penalty of MWK ${penaltyFormValues.amount} for missing the meeting: ${selectedMeeting?.title}. Reason: ${penaltyFormValues.reason}`,
        read: false,
      })

      toast({
        title: "Success",
        description: "Penalty added and notification sent",
      })

      setIsPenaltyFormOpen(false)
      setPenaltyFormValues({
        amount: "",
        reason: "",
        dueDate: "",
      })
      setSelectedAttendance(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add penalty",
        variant: "destructive",
      })
    }
  }

  const attendanceStats = useMemo(() => {
    if (!attendanceRecords) return { present: 0, absent: 0, excused: 0, total: 0 }

    const present = attendanceRecords.filter((a) => a.status === "present").length
    const absent = attendanceRecords.filter((a) => a.status === "absent").length
    const excused = attendanceRecords.filter((a) => a.status === "excused").length

    return { present, absent, excused, total: attendanceRecords.length }
  }, [attendanceRecords])

  const absenteesWithPenalties = useMemo(() => {
    if (!attendanceRecords || !users) return []
    return attendanceRecords
      .filter((a) => a.status === "absent" && !a.penalty)
      .map((a) => {
        const user = users.find((u) => u.id === a.userId)
        return user ? { attendance: a, user } : null
      })
      .filter((item): item is { attendance: Attendance; user: User } => item !== null)
  }, [attendanceRecords, users])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Attendance"
        description="Create meetings, record who attended, and assign penalties."
        actions={
          <Button onClick={() => setIsMeetingFormOpen(true)} className="bg-leo-primary hover:bg-leo-primary-dark">
            <Plus className="h-4 w-4" />
            New meeting
          </Button>
        }
      />

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Select a meeting</CardTitle>
        </CardHeader>
        <CardContent>
          {meetingsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (meetings ?? []).length === 0 ? (
            <AdminEmptyState
              icon={Calendar}
              title="No meetings yet"
              description="Create a meeting before recording attendance."
              action={
                <Button onClick={() => setIsMeetingFormOpen(true)} className="bg-leo-primary hover:bg-leo-primary-dark">
                  <Plus className="h-4 w-4" />
                  Create meeting
                </Button>
              }
            />
          ) : (
            <Select value={selectedMeetingId || ""} onValueChange={setSelectedMeetingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a meeting" />
              </SelectTrigger>
              <SelectContent>
                {meetings?.map((meeting) => (
                  <SelectItem key={meeting.id} value={meeting.id}>
                    {meeting.title} — {formatDate(meeting.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedMeetingId && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard title="Present" value={attendanceStats.present} icon={CheckCircle2} accent="green" />
            <AdminStatCard title="Absent" value={attendanceStats.absent} icon={XCircle} accent="red" />
            <AdminStatCard title="Excused" value={attendanceStats.excused} icon={AlertCircle} accent="amber" />
            <AdminStatCard title="Total recorded" value={attendanceStats.total} icon={Users} accent="orange" />
          </div>

          {/* Attendance Records */}
          <Card className="rounded-md border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attendance Records</CardTitle>
                {attendanceRecords && attendanceRecords.length === 0 && (
                  <Button
                    onClick={() => setIsAttendanceFormOpen(true)}
                    className="bg-leo-primary hover:bg-leo-primary-dark"
                  >
                    Record Attendance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : attendanceRecords && attendanceRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Leo ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Penalty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => {
                      const user = users?.find((u) => u.id === record.userId)
                      if (!user) return null

                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.leoId}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.status === "present"
                                  ? "bg-green-100 text-green-700"
                                  : record.status === "excused"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.penalty ? (
                              <Badge
                                className={
                                  record.penalty.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : record.penalty.status === "waived"
                                      ? "bg-gray-100 text-gray-700"
                                      : "bg-red-100 text-red-700"
                                }
                              >
                                MWK {record.penalty.amount.toLocaleString()} - {record.penalty.status}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.status === "absent" && !record.penalty && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAttendance({ attendance: record, user })
                                  setIsPenaltyFormOpen(true)
                                }}
                              >
                                Add Penalty
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No attendance records yet</p>
                  <Button
                    onClick={() => setIsAttendanceFormOpen(true)}
                    className="bg-leo-primary hover:bg-leo-primary-dark"
                  >
                    Record Attendance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Absentees Needing Penalties */}
          {absenteesWithPenalties.length > 0 && (
            <Card className="rounded-md border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Absentees Without Penalties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {absenteesWithPenalties.length} member(s) were absent and need penalties assigned.
                </p>
                <div className="flex flex-wrap gap-2">
                  {absenteesWithPenalties.map((item) => (
                    <Button
                      key={item.attendance.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAttendance(item)
                        setIsPenaltyFormOpen(true)
                      }}
                    >
                      {item.user.firstName} {item.user.lastName}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Meeting Dialog */}
      <Dialog open={isMeetingFormOpen} onOpenChange={setIsMeetingFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
            <DialogDescription>Create a new meeting to track attendance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="meeting-title">Title *</Label>
              <Input
                id="meeting-title"
                value={meetingFormValues.title}
                onChange={(e) => setMeetingFormValues({ ...meetingFormValues, title: e.target.value })}
                placeholder="e.g., Monthly General Meeting"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingFormValues.date}
                  onChange={(e) => setMeetingFormValues({ ...meetingFormValues, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time *</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingFormValues.time}
                  onChange={(e) => setMeetingFormValues({ ...meetingFormValues, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-location">Location</Label>
              <Input
                id="meeting-location"
                value={meetingFormValues.location}
                onChange={(e) => setMeetingFormValues({ ...meetingFormValues, location: e.target.value })}
                placeholder="e.g., MUBAS Main Hall"
              />
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                value={meetingFormValues.description}
                onChange={(e) => setMeetingFormValues({ ...meetingFormValues, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMeetingFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeeting} className="bg-leo-primary hover:bg-leo-primary-dark" disabled={createMeeting.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Attendance Dialog */}
      <Dialog open={isAttendanceFormOpen} onOpenChange={setIsAttendanceFormOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>Mark attendance for all Leo members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {leoMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{member.leoId}</p>
                </div>
                <Select
                  value={attendanceFormValues[member.id] || "absent"}
                  onValueChange={(value) =>
                    setAttendanceFormValues({ ...attendanceFormValues, [member.id]: value as any })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordAttendance}
              className="bg-leo-primary hover:bg-leo-primary-dark"
              disabled={bulkCreateAttendance.isPending}
            >
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Penalty Dialog */}
      <Dialog open={isPenaltyFormOpen} onOpenChange={setIsPenaltyFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Penalty</DialogTitle>
            <DialogDescription>
              Add a penalty for {selectedAttendance?.user.firstName} {selectedAttendance?.user.lastName} for missing the meeting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="penalty-amount">Amount (MWK) *</Label>
              <Input
                id="penalty-amount"
                type="number"
                value={penaltyFormValues.amount}
                onChange={(e) => setPenaltyFormValues({ ...penaltyFormValues, amount: e.target.value })}
                placeholder="e.g., 5000"
              />
            </div>
            <div>
              <Label htmlFor="penalty-reason">Reason *</Label>
              <Textarea
                id="penalty-reason"
                value={penaltyFormValues.reason}
                onChange={(e) => setPenaltyFormValues({ ...penaltyFormValues, reason: e.target.value })}
                placeholder="e.g., Unexcused absence"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="penalty-due-date">Due Date</Label>
              <Input
                id="penalty-due-date"
                type="date"
                value={penaltyFormValues.dueDate}
                onChange={(e) => setPenaltyFormValues({ ...penaltyFormValues, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPenaltyFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPenalty}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={updateAttendance.isPending}
            >
              Add Penalty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
