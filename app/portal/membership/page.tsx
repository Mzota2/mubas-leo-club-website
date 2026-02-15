"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Award, TrendingUp, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function MembershipPage() {
  const { user } = useAuth()

  const membershipStats = {
    joined: "January 2024",
    eventsAttended: 12,
    totalEvents: 18,
    volunteerHours: 45,
    projectsCompleted: 8,
  }

  const benefits = [
    "Access to all club events and activities",
    "Leadership development workshops",
    "Networking opportunities",
    "Community service certificates",
    "Voting rights in club decisions",
    "Mentorship programs",
  ]

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Membership Card */}
      <Card className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white border-none shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white text-[#DC2626] border-none">Active Member</Badge>
            <Award className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="opacity-90 mb-4">ID: {user?.leoId || "Leo-124537"}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="opacity-75">Member Since</p>
              <p className="font-semibold">{membershipStats.joined}</p>
            </div>
            <div>
              <p className="opacity-75">Position</p>
              <p className="font-semibold">{user?.position || "Membership Chair"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/90 border-none">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-[#F59E0B]" />
            <p className="text-2xl font-bold">{membershipStats.eventsAttended}</p>
            <p className="text-sm text-gray-600">Events Attended</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 border-none">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[#DC2626]" />
            <p className="text-2xl font-bold">{membershipStats.volunteerHours}</p>
            <p className="text-sm text-gray-600">Volunteer Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Participation */}
      <Card className="bg-white/90 border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Event Participation</h3>
            <span className="text-sm text-gray-600">
              {membershipStats.eventsAttended}/{membershipStats.totalEvents}
            </span>
          </div>
          <Progress value={(membershipStats.eventsAttended / membershipStats.totalEvents) * 100} className="h-2" />
          <p className="text-xs text-gray-600 mt-2">
            {Math.round((membershipStats.eventsAttended / membershipStats.totalEvents) * 100)}% participation rate
          </p>
        </CardContent>
      </Card>

      {/* Membership Benefits */}
      <Card className="bg-white/90 border-none">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Your Membership Benefits</h3>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Renewal Info */}
      <Card className="bg-gradient-to-br from-[#92400E] to-[#78350F] text-white border-none">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Membership Renewal</h3>
          <p className="text-sm opacity-90 mb-4">Your membership is valid until December 31, 2025</p>
          <div className="bg-white/20 rounded-lg p-3 text-sm">
            <p className="mb-1">Annual Fee: MWK 10,000</p>
            <p className="text-xs opacity-75">Auto-renewal enabled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
