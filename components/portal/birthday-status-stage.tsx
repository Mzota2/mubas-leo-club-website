"use client"

import type { ReactNode } from "react"
import { birthdayStyle, hasProfilePhoto } from "@/lib/content/birthdays"
import { cn } from "@/lib/utils"

export function BirthdayStatusStage({
  image,
  styleId,
  className,
  children,
}: {
  image?: string
  styleId?: string
  className?: string
  children: ReactNode
}) {
  const style = birthdayStyle(styleId)
  const photo = hasProfilePhoto(image)

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      {photo ? (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className={cn("absolute inset-0", style.card)} />
      )}
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-[42%]", style.caption)} />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
