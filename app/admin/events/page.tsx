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
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/hooks/use-auth"
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from "@/lib/hooks/use-events"
import type { Event } from "@/lib/types"
import { Plus, Calendar, Pencil, Trash2, Users } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { formatDate } from "@/lib/utils/format"

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
    time: "",
    location: "",
    image: "",
    status: "upcoming" as Event["status"],
  })

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
    const upcoming = list.filter((e) => e.status === "upcoming").length
    const completed = list.filter((e) => e.status === "completed").length
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
      time: "",
      location: "",
      image: "",
      status: "upcoming",
    })
    setIsFormOpen(true)
  }

  const openEdit = (event: Event) => {
    setSelectedEvent(event)
    setFormValues({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      status: event.status,
    })
    setIsFormOpen(true)
  }

  const openDelete = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async () => {
    if (!formValues.title.trim()) return
    if (!formValues.description.trim()) return
    if (!formValues.date.trim()) return
    if (!formValues.time.trim()) return
    if (!formValues.location.trim()) return

    const createdBy = firebaseUser?.uid || "system"
    const image = formValues.image?.trim() || "/placeholder-logo.png"

    if (selectedEvent) {
      await updateEvent.mutateAsync({
        eventId: selectedEvent.id,
        data: {
          ...formValues,
          image,
        },
      })
    } else {
      await createEvent.mutateAsync({
        ...formValues,
        image,
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
                .map((event) => (
                <div key={event.id} className="flex flex-col gap-3 rounded-md border border-border/60 bg-[#FBF9F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span>{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}</span>
                      <Badge variant="outline">{categoryMeta[event.category].name}</Badge>
                      <span>{event.attendees?.length ?? 0} attendees</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        event.status === "upcoming"
                          ? "border-transparent bg-sky-500 text-white"
                          : event.status === "ongoing"
                            ? "border-transparent bg-amber-500 text-white"
                            : "border-transparent bg-emerald-500 text-white"
                      }
                    >
                      {event.status}
                    </Badge>
                    <Button variant="outline" size="icon" onClick={() => openEdit(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openDelete(event)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
                disabled={createEvent.isPending || updateEvent.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
                disabled={createEvent.isPending || updateEvent.isPending}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={formValues.category}
                  onValueChange={(value) => setFormValues((v) => ({ ...v, category: value as Event["category"] }))}
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

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) => setFormValues((v) => ({ ...v, status: value as Event["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formValues.date}
                  onChange={(e) => setFormValues((v) => ({ ...v, date: e.target.value }))}
                  disabled={createEvent.isPending || updateEvent.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formValues.time}
                  onChange={(e) => setFormValues((v) => ({ ...v, time: e.target.value }))}
                  disabled={createEvent.isPending || updateEvent.isPending}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(e) => setFormValues((v) => ({ ...v, location: e.target.value }))}
                disabled={createEvent.isPending || updateEvent.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formValues.image}
                onChange={(e) => setFormValues((v) => ({ ...v, image: e.target.value }))}
                disabled={createEvent.isPending || updateEvent.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-leo-primary hover:bg-leo-primary-dark text-white"
              onClick={handleSubmit}
              disabled={createEvent.isPending || updateEvent.isPending}
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
