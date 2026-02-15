import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Heart, CreditCard, TrendingUp } from "lucide-react"

export default function PortalDashboard() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Blood Donation Drive",
      image: "/event-blood-donation.jpg",
      date: "July 15",
    },
    {
      id: 2,
      title: "Clean MUBAS Initiative",
      image: "/event-cleanup.jpg",
      date: "July 22",
    },
    {
      id: 3,
      title: "Visiting People with Disabilities",
      image: "/event-visit-pwd.jpg",
      date: "July 29",
    },
  ]

  const categories = [
    { title: "Health Causes", icon: Heart, color: "bg-red-500", href: "/portal/events?category=health" },
    { title: "Environment Causes", icon: Users, color: "bg-green-500", href: "/portal/events?category=environment" },
    {
      title: "General Community Service",
      icon: Users,
      color: "bg-purple-500",
      href: "/portal/events?category=community",
    },
    { title: "General Meeting", icon: Users, color: "bg-amber-500", href: "/portal/events?category=meeting" },
    { title: "Fundraising", icon: CreditCard, color: "bg-cyan-500", href: "/portal/events?category=fundraising" },
    { title: "Social Activities", icon: Users, color: "bg-amber-400", href: "/portal/events?category=social" },
  ]

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="What do you want to know ?"
          className="pl-10 bg-white/90 backdrop-blur-sm border-none rounded-xl h-12"
        />
      </div>

      {/* Event Banner Carousel */}
      <div className="relative">
        <div className="aspect-video rounded-2xl overflow-hidden bg-white">
          <img src="/images/home-20-20screen.jpg" alt="Blood Donation Drive" className="w-full h-full object-cover" />
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-2 rounded-full ${i === 0 ? "w-8 bg-white" : "w-2 bg-white/50"}`} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="bg-white/90 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3 text-gray-700">QUICK LINKS</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/portal/membership">
              <div className="bg-gradient-to-br from-[#92400E] to-[#B45309] rounded-xl p-4 flex flex-col items-center justify-center aspect-square text-white">
                <Users className="h-8 w-8 mb-2" />
                <span className="text-xs font-medium text-center">MY MEMBERSHIP</span>
              </div>
            </Link>
            <Link href="/donate">
              <div className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] rounded-xl p-4 flex flex-col items-center justify-center aspect-square text-white">
                <Heart className="h-8 w-8 mb-2" />
                <span className="text-xs font-medium text-center">Donate</span>
              </div>
            </Link>
            <Link href="/portal/club">
              <div className="bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-xl p-4 flex flex-col items-center justify-center aspect-square text-white">
                <Users className="h-8 w-8 mb-2" />
                <span className="text-xs font-medium text-center">MY CLUB</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Date Display */}
      <Card className="bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Wednesday</p>
              <p className="text-5xl font-bold">15.18</p>
              <p className="text-sm opacity-90 mt-1">JULY</p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i === 0 ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </div>
          <Button className="w-full mt-4 bg-[#F59E0B] hover:bg-[#D97706] text-white border-none">Activity List</Button>
        </CardContent>
      </Card>

      {/* Club & Personal Insights */}
      <Link href="/portal/insights">
        <Card className="bg-white/90 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-[#DC2626]" />
              <span className="font-semibold text-gray-800">Club & Personal Insights</span>
            </div>
            <div className="text-[#F59E0B]">→</div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
