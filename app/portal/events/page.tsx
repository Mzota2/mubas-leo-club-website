"use client"

import { useState } from "react"
import { useEvents } from "@/lib/hooks/use-events"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from "@/components/common/event-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { portalChipClass, portalTabsListClass, portalTabsTriggerClass } from "@/components/portal/styles"

export default function PortalEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [query, setQuery] = useState("")
  const { data: events, isLoading } = useEvents()

  const categories = [
    { id: "all", label: "All" },
    { id: "health", label: "Health" },
    { id: "environment", label: "Environment" },
    { id: "community", label: "Community" },
    { id: "meeting", label: "Meetings" },
    { id: "fundraising", label: "Fundraising" },
    { id: "social", label: "Social" },
  ]

  const q = query.trim().toLowerCase()
  const filteredEvents = (selectedCategory === "all" ? events : events?.filter((e) => e.category === selectedCategory))?.filter(
    (event) =>
      !q ||
      event.title.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q),
  )

  const upcomingEvents = filteredEvents?.filter((e) => e.status === "upcoming")
  const pastEvents = filteredEvents?.filter((e) => e.status === "completed")

  return (
    <div className="px-4 py-6 space-y-6 lg:px-6 lg:py-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search events..."
          className="h-12 rounded-md border-none bg-white pl-10 text-neutral-900 shadow-sm placeholder:text-neutral-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={portalChipClass(selectedCategory === category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className={portalTabsListClass}>
          <TabsTrigger value="upcoming" className={portalTabsTriggerClass}>
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className={portalTabsTriggerClass}>
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} href={`/portal/events/${event.id}`} />
            ))
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <p className="text-gray-600">No upcoming events in this category</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {isLoading ? (
            <>
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : pastEvents && pastEvents.length > 0 ? (
            pastEvents.map((event) => <EventCard key={event.id} event={event} href={`/portal/events/${event.id}`} />)
          ) : (
            <Card className="p-12 text-center bg-white/90">
              <p className="text-gray-600">No past events in this category</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
