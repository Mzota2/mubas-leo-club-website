"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/hooks/use-auth"
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from "@/lib/hooks/use-events"
import { eventImage, hasEventPoster } from "@/lib/content/defaults"
import type { Event } from "@/lib/types"
import { Plus, Calendar, Pencil, Trash2, Upload, Users } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import {
  eventStatusClass,
  eventStatusLabel,
  formatEventSchedule,
  isLiveEvent,
  isPastEvent,
  resolveEventStatus,
} from "@/lib/content/events"

export default function EventsPage() {
  const { firebaseUser } = useAuth()
  const { data: events, isLoading } = useEvents()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    category: "health" as Event["category"],
    date: "",
    endDate: "",
    time: "",
    location: "",
    image: "",
    cancelled: false,
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const categoryMeta: Record<Event["category"], { name: string; color: string }> = {
    health: { name: "Health", color: "#EF4444" },
    environment: { name: "Environment", color: "#10B981" },
    community: { name: "Community", color: "#8B5CF6" },
    meeting: { name: "Meetings", color: "#06B6D4" },
    fundraising: { name: "Fundraising", color: "#F59E0B" },
    social: { name: "Social", color: "#EC4899" },
  }

  const stats = useMemo(() => {
    const list = events ?? []
    const total = list.length
    const upcoming = list.filter((e) => isLiveEvent(e)).length
    const completed = list.filter((e) => isPastEvent(e) && resolveEventStatus(e) !== "cancelled").length
    const avgAttendance = total
      ? Math.round(list.reduce((sum, e) => sum + (e.attendees?.length ?? 0), 0) / total)
      : 0

    return { total, upcoming, completed, avgAttendance }
  }, [events])

  const categoryData = useMemo(() => {
    const counts: Partial<Record<Event["category"], number>> = {}
    for (const e of events ?? []) {
      counts[e.category] = (counts[e.category] ?? 0) + 1
    }

    return (Object.keys(categoryMeta) as Event["category"][])
      .map((category) => ({
        name: categoryMeta[category].name,
        value: counts[category] ?? 0,
        color: categoryMeta[category].color,
      }))
      .filter((c) => c.value > 0)
  }, [events])

  const openCreate = () => {
    setSelectedEvent(null)
    setFormValues({
      title: "",
      description: "",
      category: "health",
      date: "",
      endDate: "",
      time: "",
      location: "",
      image: "",
      cancelled: false,
    })
    setUploadError("")
    setIsFormOpen(true)
  }

  const openEdit = (event: Event) => {
    setSelectedEvent(event)
    setFormValues({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date?.slice(0, 10) ?? "",
      endDate: event.endDate?.slice(0, 10) ?? "",
      time: event.time ?? "",
      location: event.location ?? "",
      image: event.image ?? "",
      cancelled: event.status === "cancelled",
    })
    setUploadError("")
    setIsFormOpen(true)
  }

  const openDelete = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteOpen(true)
  }

  const isFundraising = formValues.category === "fundraising"
  const previewStatus = resolveEventStatus({
    date: formValues.date,
    endDate: isFundraising ? formValues.endDate : undefined,
    category: formValues.category,
    status: formValues.cancelled ? "cancelled" : "upcoming",
  })
  const isBusy = createEvent.isPending || updateEvent.isPending || uploading

  const handleUploadPoster = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("folder", "leo-club/events")
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const json = await res.json().catch(() => null)
      const url = json?.data?.secure_url || json?.data?.url
      if (!res.ok || !url) {
        setUploadError(json?.error || "Poster upload failed. Try again or paste an image URL.")
        return
      }
      setFormValues((values) => ({ ...values, image: url }))
    } catch {
      setUploadError("Poster upload failed. Try again or paste an image URL.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formValues.title.trim()) return
    if (!formValues.description.trim()) return
    if (!formValues.date.trim()) return
    if (!formValues.location.trim()) return
    if (!hasEventPoster(formValues.image)) {
      setUploadError("Please upload a poster for this event.")
      return
    }
    if (isFundraising && !formValues.endDate.trim()) return
    if (isFundraising && formValues.endDate < formValues.date) return

    const createdBy = firebaseUser?.uid || "system"
    const image = formValues.image.trim()
    const status = resolveEventStatus({
      date: formValues.date,
      endDate: isFundraising ? formValues.endDate : undefined,
      category: formValues.category,
      status: formValues.cancelled ? "cancelled" : "upcoming",
    })
    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      category: formValues.category,
      date: formValues.date,
      time: formValues.time.trim(),
      location: formValues.location.trim(),
      image,
      status,
    }

    if (selectedEvent) {
      await updateEvent.mutateAsync({
        eventId: selectedEvent.id,
        data: {
          ...payload,
          endDate: isFundraising ? formValues.endDate : null,
        },
      })
    } else {
      await createEvent.mutateAsync({
        ...payload,
        ...(isFundraising ? { endDate: formValues.endDate } : {}),
        attendees: [],
        createdBy,
      } as Omit<Event, "id">)
    }

    setIsFormOpen(false)
    setSelectedEvent(null)
  }

  const handleDelete = async () => {
    if (!selectedEvent) return
    await deleteEvent.mutateAsync(selectedEvent.id)
    setIsDeleteOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Events"
        description="Create, update, and track club events and attendance."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create event
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total events" value={stats.total} icon={Calendar} accent="blue" loading={isLoading} />
        <AdminStatCard title="Upcoming" value={stats.upcoming} icon={Calendar} accent="green" loading={isLoading} />
        <AdminStatCard title="Completed" value={stats.completed} icon={Calendar} accent="purple" loading={isLoading} />
        <AdminStatCard title="Avg. attendance" value={stats.avgAttendance} icon={Users} accent="orange" loading={isLoading} />
      </div>

      {/* Category Distribution */}
      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Events by category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
            ) : categoryData.length === 0 ? (
              <AdminEmptyState icon={Calendar} title="No events yet" description="Create your first event to see category analytics." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (events ?? []).length === 0 ? (
              <AdminEmptyState icon={Calendar} title="No events found" description="Create your first event to get started." />
            ) : (
              [...(events ?? [])]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((event) => {
                const status = resolveEventStatus(event)
                return (
                <div key={event.id} className="flex flex-col gap-3 rounded-md border border-border/60 bg-[#FBF9F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {eventImage(event) ? (
                      <img
                        src={eventImage(event)}
                        alt=""
                        className="h-20 w-16 shrink-0 rounded-md object-cover sm:h-24 sm:w-20"
                      />
                    ) : (
                      <span className="flex h-20 w-16 shrink-0 items-center justify-center rounded-md bg-neutral-200 sm:h-24 sm:w-20">
                        <Calendar className="h-6 w-6 text-neutral-400" />
                      </span>
                    )}
                    <div className="min-w-0">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span>{formatEventSchedule(event)}</span>
                      <Badge variant="outline">{categoryMeta[event.category].name}</Badge>
                      <span>{event.attendees?.length ?? 0} attendees</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={eventStatusClass(status)}>
                      {eventStatusLabel(status)}
                    </Badge>
                    <Button variant="outline" size="icon" onClick={() => openEdit(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openDelete(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[min(90dvh,calc(100%-2rem))] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(e) => setFormValues((v) => ({ ...v, title: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="poster">Event poster *</Label>
              <label
                htmlFor="poster"
                className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-dashed border-border bg-neutral-50 transition hover:border-leo-primary/50"
              >
                {hasEventPoster(formValues.image) ? (
                  <img src={formValues.image} alt="Event poster preview" className="max-h-56 w-full bg-neutral-100 object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    {uploading ? "Uploading poster..." : "Click to upload the event poster"}
                  </span>
                )}
              </label>
              <Input
                id="poster"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleUploadPoster(file)
                }}
              />
              {uploadError ? <p className="text-xs text-rose-600">{uploadError}</p> : null}
              <Input
                id="image"
                placeholder="Or paste a poster image URL"
                value={formValues.image}
                onChange={(e) => {
                  setUploadError("")
                  setFormValues((v) => ({ ...v, image: e.target.value }))
                }}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={formValues.category}
                onValueChange={(value) =>
                  setFormValues((v) => ({
                    ...v,
                    category: value as Event["category"],
                    endDate: value === "fundraising" && !v.endDate ? v.date : v.endDate,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isFundraising ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Start date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formValues.date}
                    onChange={(e) => setFormValues((v) => ({ ...v, date: e.target.value }))}
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={formValues.date || undefined}
                    value={formValues.endDate}
                    onChange={(e) => setFormValues((v) => ({ ...v, endDate: e.target.value }))}
                    disabled={isBusy}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Event date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formValues.date}
                    onChange={(e) => setFormValues((v) => ({ ...v, date: e.target.value }))}
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formValues.time}
                    onChange={(e) => setFormValues((v) => ({ ...v, time: e.target.value }))}
                    disabled={isBusy}
                  />
                </div>
              </div>
            )}

            {isFundraising ? (
              <div className="grid gap-2">
                <Label htmlFor="time">Daily time (optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={(e) => setFormValues((v) => ({ ...v, time: e.target.value }))}
                  disabled={isBusy}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(e) => setFormValues((v) => ({ ...v, location: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label htmlFor="cancelled">Cancelled</Label>
                <p className="text-xs text-muted-foreground">Status otherwise follows the event date.</p>
              </div>
              <Switch
                id="cancelled"
                checked={formValues.cancelled}
                onCheckedChange={(checked) => setFormValues((values) => ({ ...values, cancelled: checked }))}
                disabled={isBusy}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Current status: <span className="font-medium text-foreground">{eventStatusLabel(previewStatus)}</span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-leo-primary hover:bg-leo-primary-dark text-white"
              onClick={handleSubmit}
              disabled={isBusy || !hasEventPoster(formValues.image)}
            >
              {selectedEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
