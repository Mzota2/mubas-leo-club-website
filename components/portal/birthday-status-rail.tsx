"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Cake, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"
import { birthdayStyle, hasProfilePhoto } from "@/lib/content/birthdays"
import { BirthdayStatusStage } from "@/components/portal/birthday-status-stage"
import type { UpcomingBirthday } from "@/lib/content/academic"
import { withLeoTitle } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const STORY_MS = 6000

function viewedKey(memberId: string) {
  const now = new Date()
  return `leo-birthday-status:${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}:${memberId}`
}

function loadViewed(ids: string[]) {
  if (typeof window === "undefined") return new Set<string>()
  return new Set(ids.filter((id) => window.sessionStorage.getItem(viewedKey(id))))
}

export function BirthdayStatusRail({
  birthdays,
  viewerId,
}: {
  birthdays: UpcomingBirthday[]
  viewerId?: string
}) {
  const ordered = useMemo(() => {
    const mine = birthdays.filter((birthday) => birthday.memberId === viewerId)
    const rest = birthdays.filter((birthday) => birthday.memberId !== viewerId)
    return [...mine, ...rest]
  }, [birthdays, viewerId])

  const [viewed, setViewed] = useState<Set<string>>(new Set())
  const [storyIndex, setStoryIndex] = useState<number | null>(null)

  useEffect(() => {
    setViewed(loadViewed(ordered.map((birthday) => birthday.memberId)))
  }, [ordered])

  if (ordered.length === 0) return null

  return (
    <section className="space-y-2">
      <p className={`text-sm font-medium ${portalCanvasTitle}`}>Birthdays today</p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
        {ordered.map((birthday, index) => {
          const style = birthdayStyle(birthday.style)
          const isMine = birthday.memberId === viewerId
          const isViewed = viewed.has(birthday.memberId)
          return (
            <button
              key={birthday.memberId}
              type="button"
              onClick={() => setStoryIndex(index)}
              className="w-16 shrink-0 text-center"
            >
              <span
                className={cn(
                  "mx-auto flex h-16 w-16 items-center justify-center rounded-full p-[2px]",
                  isViewed ? "bg-neutral-300" : style.card,
                )}
              >
                <Avatar className="h-full w-full border-2 border-white">
                  <AvatarImage src={birthday.memberImage || undefined} />
                  <AvatarFallback className={cn("text-sm font-semibold text-white", style.card)}>
                    {withLeoTitle(birthday.memberName).replace(/^Leo\s+/i, "").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </span>
              <span className={`mt-1 block truncate text-[11px] font-medium ${portalCanvasMuted}`}>
                {isMine ? "You" : withLeoTitle(birthday.memberName).replace(/^Leo\s+/i, "").split(" ")[0]}
              </span>
            </button>
          )
        })}
      </div>

      {storyIndex !== null ? (
        <BirthdayStoryViewer
          birthdays={ordered}
          index={storyIndex}
          viewerId={viewerId}
          onIndexChange={setStoryIndex}
          onViewed={(memberId) => {
            window.sessionStorage.setItem(viewedKey(memberId), "1")
            setViewed((current) => new Set(current).add(memberId))
          }}
          onClose={() => setStoryIndex(null)}
        />
      ) : null}
    </section>
  )
}

function BirthdayStoryViewer({
  birthdays,
  index,
  viewerId,
  onIndexChange,
  onViewed,
  onClose,
}: {
  birthdays: UpcomingBirthday[]
  index: number
  viewerId?: string
  onIndexChange: (index: number | null) => void
  onViewed: (memberId: string) => void
  onClose: () => void
}) {
  const birthday = birthdays[index]
  const [progress, setProgress] = useState(0)
  const paused = useRef(false)
  const onCloseRef = useRef(onClose)
  const onIndexChangeRef = useRef(onIndexChange)
  const onViewedRef = useRef(onViewed)
  onCloseRef.current = onClose
  onIndexChangeRef.current = onIndexChange
  onViewedRef.current = onViewed
  const isMine = birthday?.memberId === viewerId
  const photo = hasProfilePhoto(birthday?.memberImage)

  useEffect(() => {
    if (!birthday) return
    onViewedRef.current(birthday.memberId)
    setProgress(0)
    paused.current = false
    let elapsed = 0
    let last = Date.now()
    const timer = window.setInterval(() => {
      const now = Date.now()
      if (!paused.current) elapsed += now - last
      last = now
      const next = Math.min(100, (elapsed / STORY_MS) * 100)
      setProgress(next)
      if (next >= 100) {
        window.clearInterval(timer)
        if (index < birthdays.length - 1) onIndexChangeRef.current(index + 1)
        else onCloseRef.current()
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [birthday, birthdays.length, index])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
      if (event.key === "ArrowRight") {
        if (index < birthdays.length - 1) onIndexChangeRef.current(index + 1)
        else onCloseRef.current()
      }
      if (event.key === "ArrowLeft" && index > 0) onIndexChangeRef.current(index - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [birthdays.length, index])

  if (!birthday) return null

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/80 p-3">
      <div className="relative h-full max-h-[760px] w-full max-w-md overflow-hidden rounded-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={birthday.memberId}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <BirthdayStatusStage image={birthday.memberImage} styleId={birthday.style} className="h-full">
              <div
                className="flex h-full flex-col"
                onPointerDown={() => {
                  paused.current = true
                }}
                onPointerUp={() => {
                  paused.current = false
                }}
                onPointerCancel={() => {
                  paused.current = false
                }}
              >
                <div className="relative z-30 flex gap-1 p-3">
                  {birthdays.map((item, itemIndex) => (
                    <div key={item.memberId} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full bg-white transition-[width] duration-75"
                        style={{
                          width: itemIndex < index ? "100%" : itemIndex === index ? `${progress}%` : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="relative z-30 flex items-center justify-between px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-10 w-10 border border-white/70">
                      <AvatarImage src={birthday.memberImage || undefined} />
                      <AvatarFallback className="text-xs">
                        {withLeoTitle(birthday.memberName).replace(/^Leo\s+/i, "").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white drop-shadow">
                        {isMine ? "Your birthday" : withLeoTitle(birthday.memberName)}
                      </p>
                      <p className="text-xs text-white/85">Today</p>
                    </div>
                  </div>
                  <button type="button" onClick={onClose} className="rounded-md p-2 text-white" aria-label="Close birthday status">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-auto px-5 pb-6 text-white">
                  <Cake className="mb-2 h-7 w-7" />
                  <p className="text-xs uppercase tracking-wide text-white/85">Happy birthday</p>
                  <h3 className="mt-1 text-2xl font-semibold">
                    {isMine ? "Leo, it’s your day" : withLeoTitle(birthday.memberName)}
                  </h3>
                  {birthday.message ? <p className="mt-2 text-sm text-white/95">{birthday.message}</p> : null}
                  {!photo && isMine ? (
                    <p className="mt-2 text-sm text-white/95">Upload a profile photo so this status shows your picture.</p>
                  ) : null}
                </div>
              </div>
            </BirthdayStatusStage>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          className="absolute inset-y-16 left-0 z-20 w-1/3"
          aria-label="Previous birthday"
          onClick={() => {
            if (index > 0) onIndexChange(index - 1)
          }}
        />
        <button
          type="button"
          className="absolute inset-y-16 right-0 z-20 w-1/3"
          aria-label="Next birthday"
          onClick={() => {
            if (index < birthdays.length - 1) onIndexChange(index + 1)
            else onClose()
          }}
        />
      </div>
    </div>
  )
}
