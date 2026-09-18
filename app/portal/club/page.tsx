"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone } from "lucide-react"
import { PortalPageHeader } from "@/components/portal/page-header"
import { media } from "@/lib/media"

export default function MyClubPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Sample member data - in production, this would come from Firestore
  const members = [
    {
      id: "1",
      name: "Leo Mzota",
      username: "leomzota",
      position: "Membership Chair",
      role: "Executive",
      image: media.people.male,
      email: "leo@mubasleoclub.org",
      phone: "+265 981 81 93 89",
    },
    {
      id: "2",
      name: "Jane Banda",
      username: "janebanda",
      position: "President",
      role: "Executive",
      image: media.people.female,
      email: "jane@mubasleoclub.org",
    },
    {
      id: "3",
      name: "John Phiri",
      username: "johnphiri",
      position: "Vice President",
      role: "Executive",
      image: media.people.male2,
      email: "john@mubasleoclub.org",
    },
    {
      id: "4",
      name: "Grace Chirwa",
      username: "gracechirwa",
      position: "Secretary",
      role: "Executive",
      image: media.people.female2,
      email: "grace@mubasleoclub.org",
    },
  ]

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <PortalPageHeader title="My club" description={`${members.length} active members`} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/90 backdrop-blur-sm border-none rounded-md h-12"
        />
      </div>

      {/* Members List */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="bg-white/90 backdrop-blur-sm border-none hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-[#F59E0B]">
                  <AvatarImage src={member.image || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white font-bold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">@{member.username}</p>
                    </div>
                    <Badge className="bg-[#92400E] text-white border-none">{member.role}</Badge>
                  </div>

                  <p className="text-sm text-[#F59E0B] font-medium mb-3">{member.position}</p>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${member.email}`} className="hover:text-[#F59E0B] transition-colors">
                        {member.email}
                      </a>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <Card className="p-12 text-center bg-white/90">
            <p className="text-gray-600">No members found matching your search</p>
          </Card>
        )}
      </div>
    </div>
  )
}
