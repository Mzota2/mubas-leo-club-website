"use client"

import { useEffect, useMemo, useState } from "react"
import { Cake, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { useUsers } from "@/lib/hooks/use-users"
import { useAuth } from "@/lib/hooks/use-auth"
import { publishBirthdayCalendar } from "@/lib/firebase/firestore"
import { birthdayMonthDay, isBirthdayToday } from "@/lib/content/academic"
import { withoutViewer } from "@/lib/members/viewer"
import { displayName, formatDate } from "@/lib/utils/format"

export default function AdminBirthdaysPage() {
  const { data: allUsers, isLoading } = useUsers(true)
  const { user: adminUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const users = useMemo(() => withoutViewer(allUsers, adminUser?.id), [allUsers, adminUser?.id])
  const thisMonth = new Date().getMonth()
  const monthLabel = new Date().toLocaleString("default", { month: "long" })

  useEffect(() => {
    if (!allUsers) return
    void publishBirthdayCalendar(allUsers).catch(() => undefined)
  }, [allUsers])

  const birthdaysThisMonth = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return (users ?? [])
      .filter((member) => birthdayMonthDay(member.dateOfBirth)?.month === thisMonth)
      .filter((member) => {
        if (!query) return true
        return (
          displayName(member).toLowerCase().includes(query) ||
          member.username?.toLowerCase().includes(query) ||
          (member.leoId ?? "").toLowerCase().includes(query)
        )
      })
      .sort((a, b) => (birthdayMonthDay(a.dateOfBirth)?.day ?? 32) - (birthdayMonthDay(b.dateOfBirth)?.day ?? 32))
  }, [users, searchQuery, thisMonth])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Birthdays"
        description={`Birthdays this month appear here.`}
      />

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-lg font-semibold">
              Birthdays this month
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {monthLabel} · {birthdaysThisMonth.length}
              </span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, username, or Leo ID"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-9 sm:w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : birthdaysThisMonth.length === 0 ? (
            <AdminEmptyState
              icon={Cake}
              title={`No birthdays in ${monthLabel}`}
              description="Members can add an optional birthday on registration or their profile."
            />
          ) : (
            birthdaysThisMonth.map((member) => {
              const today = isBirthdayToday(member.dateOfBirth)
              const day = birthdayMonthDay(member.dateOfBirth)?.day
              return (
                <div
                  key={member.id}
                  className={`flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    today ? "border-leo-primary bg-orange-50" : "border-border"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profileImage} />
                      <AvatarFallback>
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold">{displayName(member)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(member.dateOfBirth)}
                        {member.programOfStudy ? ` · ${member.programOfStudy}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge className={today ? "bg-leo-primary text-white" : "bg-neutral-100 text-neutral-700"}>
                    {today ? "Today" : day ? `${monthLabel} ${day}` : "This month"}
                  </Badge>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
