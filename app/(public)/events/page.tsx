import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EventsPage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Blood Donation Drive",
      description: "Join us for our annual blood donation campaign at Community Hospital",
      date: "July 15, 2025",
      time: "9:00 AM - 4:00 PM",
      location: "Community Hospital, Blantyre",
      category: "Health Causes",
      image: "/images/home-20-20screen.jpg",
    },
    {
      id: 2,
      title: "Environmental Clean-up",
      description: "Community clean-up and tree planting initiative at Michiru Mountain",
      date: "July 22, 2025",
      time: "7:00 AM - 12:00 PM",
      location: "Michiru Mountain, Blantyre",
      category: "Environment",
      image: "/tree-planting-cleanup.jpg",
    },
    {
      id: 3,
      title: "Youth Empowerment Workshop",
      description: "Leadership and skills development workshop for young people",
      date: "August 5, 2025",
      time: "2:00 PM - 5:00 PM",
      location: "MUBAS Main Hall",
      category: "Community Service",
      image: "/youth-workshop-leadership.jpg",
    },
  ]

  return (
    <div className="py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Events</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in our various community service activities and make a lasting impact
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto relative bg-gradient-to-br from-leo-primary to-leo-secondary" />
                  <CardContent className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-leo-primary text-white">{event.category}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.date} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Past Events Coming Soon</h3>
              <p className="text-gray-600">
                Check back later to see our archive of successful community service events
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
