import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Heart, Leaf, Users, Calendar, DollarSign, Smile } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Changeover BBQ Party",
      image: "/event-bbq.jpg",
      hashtag: "#BBQParty",
    },
    {
      id: 2,
      title: "Blood Donation Drive",
      image: "/event-blood.jpg",
      hashtag: "#BloodDonation",
    },
    {
      id: 3,
      title: "Clean MUBAS Initiative",
      image: "/event-clean.jpg",
      hashtag: "#CleanMUBASt",
    },
  ]

  const categories = [
    { title: "Health Causes", icon: Heart, color: "from-red-500 to-red-600" },
    { title: "Environment Causes", icon: Leaf, color: "from-green-500 to-green-600" },
    { title: "General Community Service", icon: Users, color: "from-purple-500 to-purple-600" },
    { title: "General Meeting", icon: Calendar, color: "from-amber-500 to-amber-600" },
    { title: "Fundraising", icon: DollarSign, color: "from-cyan-500 to-cyan-600" },
    { title: "Social Activities", icon: Smile, color: "from-yellow-500 to-yellow-600" },
  ]

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header with Avatar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#DC2626]" />
          <div className="text-white">
            <p className="text-sm font-medium">ID Leo-124537</p>
          </div>
        </div>
        <button className="p-2 bg-white/10 rounded-full">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="What do you want to know ?"
          className="pl-10 bg-white/90 backdrop-blur-sm border-none rounded-xl h-12"
        />
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Upcoming Events</h2>
          <Link href="/portal/events" className="text-white text-sm">
            View all
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="flex-shrink-0 w-48 bg-white/90 border-none overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#F59E0B] to-[#DC2626]" />
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                <p className="text-xs text-gray-600">{event.hashtag}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-white font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link key={category.title} href={`/portal/events?category=${category.title.toLowerCase()}`}>
              <Card className={`bg-gradient-to-br ${category.color} border-none hover:shadow-lg transition-shadow`}>
                <CardContent className="p-4 flex items-center gap-3 text-white">
                  <category.icon className="h-8 w-8" />
                  <span className="text-sm font-medium">{category.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
