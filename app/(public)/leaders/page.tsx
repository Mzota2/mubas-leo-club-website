"use client"

import { Mail, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLeaders } from "@/lib/hooks/use-leaders"
import { DEFAULT_LEADERS, withFallback } from "@/lib/content/defaults"
import { sortPublicLeaders } from "@/lib/content/executives"
import { withLeoTitle } from "@/lib/utils/format"
import type { Leader } from "@/lib/types"

function LeaderCard({ leader }: { leader: Leader }) {
  const titled = withLeoTitle(leader.name)
  const initial = titled.replace(/^Leo\s+/i, "").trim().slice(0, 1) || "L"

  return (
    <Card className="rounded-md border-none shadow-sm hover:shadow-md">
      <CardContent className="p-6">
        <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-linear-to-br from-leo-primary to-leo-secondary">
          {leader.image ? (
            <img src={leader.image} alt={withLeoTitle(leader.name)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white">
              {initial}
            </div>
          )}
        </div>
        <div className="mb-4 text-center">
          <h3 className="mb-1 text-xl font-bold">{titled}</h3>
          <p className="font-medium text-leo-primary">{leader.position}</p>
        </div>
        {leader.bio ? <p className="mb-4 text-center text-sm leading-relaxed text-gray-600">{leader.bio}</p> : null}
        <div className="space-y-2 text-sm">
          {leader.email ? (
            <div className="flex min-w-0 items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${leader.email}`} className="min-w-0 break-all transition-colors hover:text-leo-primary">
                {leader.email}
              </a>
            </div>
          ) : null}
          {leader.phone ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${leader.phone}`} className="hover:text-leo-primary">
                {leader.phone}
              </a>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeadersPage() {
  const { data: leaders, isLoading } = useLeaders()
  const list = sortPublicLeaders(withFallback(leaders, DEFAULT_LEADERS))

  return (
    <div className="py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">Our Leaders</h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 md:text-xl">
            Meet the dedicated individuals guiding MUBAS Leo Club towards excellence
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [1, 2, 3, 4].map((item) => (
                <Card key={item} className="rounded-md border-none shadow-sm">
                  <CardContent className="space-y-4 p-6">
                    <Skeleton className="mx-auto h-32 w-32 rounded-full" />
                    <Skeleton className="mx-auto h-6 w-40" />
                    <Skeleton className="mx-auto h-4 w-28" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            : list.map((leader) => <LeaderCard key={leader.id || leader.name} leader={leader} />)}
        </div>
      </div>
    </div>
  )
}
