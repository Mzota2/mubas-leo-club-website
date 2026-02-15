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
import { Plus, Calendar, Pencil, Trash2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events Management</h1>
          <p className="text-gray-600">Manage and track all club events</p>
        </div>
        <Button className="bg-leo-primary hover:bg-leo-primary-dark text-white" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : stats.upcoming}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : stats.avgAttendance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Events by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : categoryData.length === 0 ? (
            <p className="text-sm text-gray-600">No events found yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (events ?? []).length === 0 ? (
              <p className="text-sm text-gray-600">No events found. Create your first event.</p>
            ) : (
              (events ?? []).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span>{event.date}</span>
                      <Badge variant="outline">{categoryMeta[event.category].name}</Badge>
                      <span>{event.attendees?.length ?? 0} attendees</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        event.status === "upcoming"
                          ? "bg-blue-500"
                          : event.status === "ongoing"
                            ? "bg-amber-500"
                            : "bg-green-500"
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
