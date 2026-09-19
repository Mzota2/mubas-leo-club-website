"use client"

import Link from "next/link"
import { Cake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { birthdayCalendarHref, birthdayStyle } from "@/lib/content/birthdays"
import type { UpcomingBirthday } from "@/lib/content/academic"
import { withLeoTitle } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

export function BirthdayCelebrationCard({
  birthday,
  viewerId,
  compact = false,
}: {
  birthday: UpcomingBirthday
  viewerId?: string
  compact?: boolean
}) {
  const style = birthdayStyle(birthday.style)
  const isMine = Boolean(viewerId && birthday.memberId === viewerId)
  const when = birthday.isToday
    ? "Today"
    : birthday.daysAway === 1
      ? "Tomorrow"
      : `in ${birthday.daysAway} days`

  return (
    <Link
      id={`birthday-${birthday.memberId}`}
      href={birthdayCalendarHref(birthday.memberId, birthday.nextDate)}
      className={cn(
        "block rounded-md transition-colors",
        compact ? "p-3" : "flex items-center gap-4 p-4",
        isMine ? style.card : cn("border border-border/60", style.hover),
      )}
    >
      <div className={cn("flex items-start justify-between gap-2", !compact && "w-full items-center")}>
        {!compact ? (
          <div className={cn("rounded-md p-3", isMine ? "bg-white/20" : style.chip)}>
            <Cake className={cn("h-5 w-5", isMine ? "text-white" : undefined)} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("truncate font-medium", isMine ? "text-white" : undefined)}>
              {isMine ? "Your birthday" : withLeoTitle(birthday.memberName)}
            </p>
            {isMine ? (
              <Badge className="shrink-0 border-white/30 bg-white/20 text-white">That’s you</Badge>
            ) : null}
          </div>
          <p className={cn("mt-1 text-xs", isMine ? "text-white/85" : "text-muted-foreground")}>
            {birthday.nextDate.toLocaleDateString(
              "en-GB",
              compact
                ? { day: "numeric", month: "short" }
                : { weekday: "long", day: "numeric", month: "long" },
            )}
            {` · ${when}`}
          </p>
          {birthday.message ? (
            <p className={cn("mt-1 truncate text-xs", isMine ? "text-white/90" : "text-neutral-600")}>
              {birthday.message}
            </p>
          ) : null}
        </div>
        {compact ? <Cake className={cn("h-4 w-4 shrink-0", isMine ? "text-white" : "text-pink-500")} /> : null}
      </div>
    </Link>
  )
}
