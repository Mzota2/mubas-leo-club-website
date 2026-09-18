import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types"

interface EventCardProps {
  event: Event
  href?: string
}

export function EventCard({ event, href }: EventCardProps) {
  const categoryColors = {
    health: "bg-red-500",
    environment: "bg-green-500",
    community: "bg-purple-500",
    meeting: "bg-amber-500",
    fundraising: "bg-cyan-500",
    social: "bg-pink-500",
  }

  const content = (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {event.image ? (
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <Badge className={`absolute top-2 left-2 ${categoryColors[event.category]} text-white border-none`}>
          {event.category}
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{event.location}</span>
          </div>
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{event.attendees.length} attending</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
