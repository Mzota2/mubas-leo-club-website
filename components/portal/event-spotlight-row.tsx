"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { portalCanvasTitle } from "@/components/portal/styles"
import { EVENT_CATEGORY_LABELS, eventImage } from "@/lib/content/defaults"
import { formatEventSchedule, isLiveEvent, resolveEventStatus } from "@/lib/content/events"
import type { Event } from "@/lib/types"
import { cn } from "@/lib/utils"

const STORY_MS = 6500

function eventTag(event: Event) {
  const compact = event.title.replace(/[^a-zA-Z0-9]+/g, "")
  return compact ? `#${compact}` : `#${EVENT_CATEGORY_LABELS[event.category]}`
}

function EventPosterCard({
  event,
  duplicate = false,
  onOpen,
}: {
  event: Event
  duplicate?: boolean
  onOpen: () => void
}) {
  const poster = eventImage(event)
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      className="relative w-40 shrink-0 overflow-hidden rounded-md bg-neutral-200 text-left lg:w-52"
    >
      {poster ? (
        <img src={poster} alt={duplicate ? "" : event.title} className="h-52 w-full object-cover" />
      ) : (
        <span className="flex h-52 w-full items-center justify-center bg-neutral-200">
          <Calendar className="h-10 w-10 text-neutral-400" />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-2.5 pb-2.5 pt-8">
        <span className="block text-sm font-semibold text-white">{eventTag(event)}</span>
        <span className="mt-0.5 block text-xs text-white/90">{event.title}</span>
      </span>
    </button>
  )
}

export function EventSpotlightRow({ events }: { events?: Event[] }) {
  const items = useMemo(() => {
    return [...(events ?? [])]
      .filter((event) => isLiveEvent(event))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10)
  }, [events])
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const animate = items.length > 1
  const unit = animate
    ? Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat()
    : items
  const track = animate ? [...unit, ...unit] : unit

  useEffect(() => {
    pausedRef.current = storyIndex !== null
  }, [storyIndex])

  useEffect(() => {
    const node = trackRef.current
    if (!animate || !node) return

    let offset = 0
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = now - last
      last = now
      if (!pausedRef.current) {
        const loop = node.scrollWidth / 2
        if (loop > 0) {
          offset = (offset + elapsed * 0.07) % loop
          node.style.transform = `translate3d(-${offset}px, 0, 0)`
        }
      }
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [animate, track.length])

  if (events === undefined) {
    return (
      <section className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className={`font-semibold ${portalCanvasTitle}`}>Upcoming events</h2>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-52 w-40 shrink-0 animate-pulse rounded-md bg-neutral-200 lg:w-52" />
          ))}
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h2 className={`font-semibold ${portalCanvasTitle}`}>Upcoming events</h2>
          <Link href="/portal/events" className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-medium text-neutral-800 lg:bg-transparent lg:px-0 lg:text-leo-primary">
            View all
          </Link>
        </div>
        <p className="rounded-md bg-white px-3 py-6 text-sm text-neutral-600 shadow-sm">No upcoming events yet.</p>
      </section>
    )
  }

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`font-semibold ${portalCanvasTitle}`}>Upcoming events</h2>
        <Link href="/portal/events" className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-medium text-neutral-800 lg:bg-transparent lg:px-0 lg:text-leo-primary">
          View all
        </Link>
      </div>
      {animate ? (
        <div
          className="min-w-0 overflow-hidden"
          onMouseEnter={() => {
            pausedRef.current = true
          }}
          onMouseLeave={() => {
            pausedRef.current = storyIndex !== null
          }}
        >
          <div ref={trackRef} className="flex w-max gap-3 will-change-transform">
            {track.map((event, index) => (
              <EventPosterCard
                key={`${event.id}-${index}`}
                event={event}
                duplicate={index >= unit.length}
                onOpen={() => setStoryIndex(items.findIndex((item) => item.id === event.id))}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {items.map((event, index) => (
            <EventPosterCard key={event.id} event={event} onOpen={() => setStoryIndex(index)} />
          ))}
        </div>
      )}

      {storyIndex !== null ? (
        <EventStoryViewer
          events={items}
          index={storyIndex}
          onIndexChange={setStoryIndex}
          onClose={() => setStoryIndex(null)}
        />
      ) : null}
    </section>
  )
}

function EventStoryViewer({
  events,
  index,
  onIndexChange,
  onClose,
}: {
  events: Event[]
  index: number
  onIndexChange: (index: number | null) => void
  onClose: () => void
}) {
  const event = events[index]
  const [progress, setProgress] = useState(0)
  const paused = useRef(false)
  const onCloseRef = useRef(onClose)
  const onIndexChangeRef = useRef(onIndexChange)
  onCloseRef.current = onClose
  onIndexChangeRef.current = onIndexChange

  useEffect(() => {
    if (!event) return
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
        if (index < events.length - 1) onIndexChangeRef.current(index + 1)
        else onCloseRef.current()
      }
    }, 50)
    return () => window.clearInterval(timer)
  }, [event, events.length, index])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
      if (event.key === "ArrowRight") {
        if (index < events.length - 1) onIndexChangeRef.current(index + 1)
        else onCloseRef.current()
      }
      if (event.key === "ArrowLeft" && index > 0) onIndexChangeRef.current(index - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [events.length, index])

  if (!event) return null

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/80 p-3">
      <div className="relative h-full max-h-[760px] w-full max-w-md overflow-hidden rounded-md bg-neutral-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04, x: 28 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: -28 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {eventImage(event) ? (
              <img src={eventImage(event)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-neutral-800" />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            <div
              className="relative flex h-full flex-col"
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
              <div className="flex gap-1 p-3">
                {events.map((item, itemIndex) => (
                  <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full bg-white transition-[width] duration-75"
                      style={{
                        width: itemIndex < index ? "100%" : itemIndex === index ? `${progress}%` : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{eventTag(event)}</p>
                  <p className="text-xs text-white/80">{EVENT_CATEGORY_LABELS[event.category]}</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-md p-2 text-white" aria-label="Close event">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-auto space-y-2 px-5 pb-6 text-white">
                <p className={cn("text-xs font-medium uppercase tracking-wide text-white/80")}>{resolveEventStatus(event)}</p>
                <h3 className="text-2xl font-semibold leading-tight">{event.title}</h3>
                {event.description ? <p className="text-sm text-white/90">{event.description}</p> : null}
                <p className="flex items-center gap-2 text-sm text-white/90">
                  <Calendar className="h-4 w-4" />
                  {formatEventSchedule(event)}
                </p>
                {event.location ? (
                  <p className="flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </p>
                ) : null}
                <Link
                  href="/portal/events"
                  className="relative z-30 mt-2 inline-flex rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900"
                >
                  Open events
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          className="absolute top-16 bottom-36 left-0 z-20 w-1/3"
          aria-label="Previous event"
          onClick={() => {
            if (index > 0) onIndexChange(index - 1)
          }}
        />
        <button
          type="button"
          className="absolute top-16 bottom-36 right-0 z-20 w-1/3"
          aria-label="Next event"
          onClick={() => {
            if (index < events.length - 1) onIndexChange(index + 1)
            else onClose()
          }}
        />
      </div>
    </div>
  )
}
