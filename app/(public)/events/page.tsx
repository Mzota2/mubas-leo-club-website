"use client"

import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvents } from "@/lib/hooks/use-events"
import {
  DEFAULT_EVENTS,
  EVENT_CATEGORY_LABELS,
  eventImage,
  isPastEvent,
  withFallback,
} from "@/lib/content/defaults"
import { formatDate } from "@/lib/utils/format"
import type { Event } from "@/lib/types"

function EventRow({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden rounded-md border-none shadow-sm hover:shadow-md">
      <div className="md:flex">
        <div className="relative h-48 min-h-48 bg-neutral-100 md:h-auto md:w-1/3">
          <img src={eventImage(event)} alt={event.title} className="h-full w-full object-cover" />
        </div>
        <CardContent className="p-6 md:w-2/3">
          <div className="mb-4 flex items-start justify-between">
            <Badge className="bg-leo-primary text-white">{EVENT_CATEGORY_LABELS[event.category] ?? event.category}</Badge>
          </div>
          <h3 className="mb-3 text-xl font-bold md:text-2xl">{event.title}</h3>
          <p className="mb-4 text-gray-600">{event.description}</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {formatDate(event.date)}
                {event.time ? ` at ${event.time}` : ""}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{event.location}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function EventListSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <Card key={item} className="overflow-hidden rounded-md border-none shadow-sm">
          <div className="md:flex">
            <Skeleton className="h-48 w-full md:h-auto md:min-h-48 md:w-1/3" />
            <CardContent className="space-y-3 p-6 md:w-2/3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </div>
        </Card>
      ))}
    </>
  )
}

export default function EventsPage() {
  const { data: events, isLoading } = useEvents()
  const list = withFallback(events, DEFAULT_EVENTS)
  const upcomingEvents = list.filter((event) => !isPastEvent(event))
  const pastEvents = list.filter((event) => isPastEvent(event))

  return (
    <div className="py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">Our Events</h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 md:text-xl">
            Join us in our various community service activities and make a lasting impact
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {isLoading ? (
              <EventListSkeleton />
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => <EventRow key={event.id} event={event} />)
            ) : (
              <Card className="rounded-md p-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold">No upcoming events yet</h3>
                <p className="text-gray-600">Check back soon for the next Leo Club activity.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {isLoading ? (
              <EventListSkeleton />
            ) : pastEvents.length > 0 ? (
              pastEvents.map((event) => <EventRow key={event.id} event={event} />)
            ) : (
              <Card className="rounded-md p-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold">Past Events Coming Soon</h3>
                <p className="text-gray-600">
                  Check back later to see our archive of successful community service events
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
