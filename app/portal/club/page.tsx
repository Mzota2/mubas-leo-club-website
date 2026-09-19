"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Mail, Phone, Cake } from "lucide-react"
import { PortalPageHeader } from "@/components/portal/page-header"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUsers } from "@/lib/hooks/use-users"
import { yearOfStudyLabel, isBirthdayToday } from "@/lib/content/academic"
import { displayName, formatDate, withLeoTitle } from "@/lib/utils/format"
import { isViewer } from "@/lib/members/viewer"
import type { User } from "@/lib/types"

export default function MyClubPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-white/80">Loading club...</div>}>
      <ClubDirectory />
    </Suspense>
  )
}

function ClubDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const highlightedId = searchParams.get("member")
  const { user: viewer } = useAuth()
  const { data: users, isLoading } = useUsers()

  const members = useMemo(() => {
    return (users ?? []).filter((member) => (member.membershipStatus ?? "active") !== "suspended")
  }, [users])

  const highlightedMember = useMemo(() => {
    if (!highlightedId || isViewer(highlightedId, viewer?.id)) return null
    return members.find((member) => member.id === highlightedId) ?? null
  }, [highlightedId, members, viewer?.id])

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    const name = displayName(member).toLowerCase()
    return (
      name.includes(query) ||
      member.username?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.position?.toLowerCase().includes(query) ||
      (member.leoId ?? "").toLowerCase().includes(query) ||
      (member.programOfStudy ?? "").toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <PortalPageHeader
        title="My club"
        description={isLoading ? "Loading members..." : `${members.length} fellow Leos`}
      />

      {highlightedMember ? <BirthdayHighlight member={highlightedMember} /> : null}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/90 backdrop-blur-sm border-none rounded-md h-12"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="bg-white/90 border-none">
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} highlighted={member.id === highlightedId} />
          ))}

          {filteredMembers.length === 0 && (
            <Card className="p-12 text-center bg-white/90 lg:col-span-2">
              <p className="text-gray-600">
                {searchQuery.trim() ? "No members found matching your search" : "No other members are listed yet."}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function BirthdayHighlight({ member }: { member: User }) {
  const name = withLeoTitle(displayName(member))
  const today = isBirthdayToday(member.dateOfBirth) && member.birthdayVisible !== false

  return (
    <Card id={`member-${member.id}`} className="border-none bg-white/95 shadow-lg">
      <CardContent className="flex items-start gap-4 p-4">
        <Avatar className="h-16 w-16 border-2 border-[#F59E0B]">
          <AvatarImage src={member.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white font-bold">
            {name.replace(/^Leo\s+/i, "").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{name}</h3>
              {member.username ? <p className="text-sm text-gray-600">@{member.username}</p> : null}
            </div>
            {today ? (
              <Badge className="border-none bg-pink-500 text-white">
                <Cake className="mr-1 h-3 w-3" />
                Birthday
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-[#F59E0B]">
            {[member.programOfStudy, yearOfStudyLabel(member.yearOfStudy)]
              .filter((value) => value && value !== "—")
              .join(" · ")}
          </p>
          {member.dateOfBirth ? (
            <p className="mt-1 text-xs text-gray-500">Birthday {formatDate(member.dateOfBirth)}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function MemberCard({ member, highlighted }: { member: User; highlighted?: boolean }) {
  const name = displayName(member)
  const initials = `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}` || "L"
  const today = isBirthdayToday(member.dateOfBirth) && member.birthdayVisible !== false
  const roleLabel = member.membershipType === "leo" ? "Leo" : "Prospective"

  return (
    <Card
      id={`member-${member.id}`}
      className={`bg-white/90 backdrop-blur-sm border-none hover:shadow-lg transition-shadow ${
        highlighted ? "ring-2 ring-[#F59E0B]" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-[#F59E0B]">
            <AvatarImage src={member.profileImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-600">@{member.username}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge className="bg-[#92400E] text-white border-none">{member.position || roleLabel}</Badge>
                {today ? (
                  <Badge className="border-none bg-pink-500 text-white">
                    <Cake className="mr-1 h-3 w-3" />
                    Today
                  </Badge>
                ) : null}
              </div>
            </div>

            {member.position ? (
              <p className="text-sm text-[#F59E0B] font-medium mb-3">{member.position}</p>
            ) : member.programOfStudy ? (
              <p className="text-sm text-[#F59E0B] font-medium mb-3">
                {member.programOfStudy}
                {member.yearOfStudy ? ` · ${yearOfStudyLabel(member.yearOfStudy)}` : ""}
              </p>
            ) : null}

            <div className="space-y-1 text-sm text-gray-600">
              {member.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${member.email}`} className="hover:text-[#F59E0B] transition-colors">
                    {member.email}
                  </a>
                </div>
              ) : null}
              {member.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
