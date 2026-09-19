"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Calendar, Heart, Leaf, Plus, Search, ShoppingBag, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEvents } from "@/lib/hooks/use-events"
import { eventImage } from "@/lib/content/defaults"
import { isLiveEvent } from "@/lib/content/events"
import { searchPortal, type SearchHit } from "@/lib/portal/search"
import { portalCanvasTitle } from "@/components/portal/styles"
import type { Event } from "@/lib/types"

const categories = [
  { title: "Health Causes", icon: Plus, color: "bg-[#EF4444]", href: "/portal/events?category=health" },
  { title: "Environment Causes", icon: Leaf, color: "bg-[#22C55E]", href: "/portal/events?category=environment" },
  { title: "General Community Service", icon: Heart, color: "bg-[#A855F7]", href: "/portal/events?category=community" },
  { title: "General Meeting", icon: Users, color: "bg-[#4F46E5]", href: "/portal/events?category=meeting" },
  { title: "Fundraising", icon: Heart, color: "bg-[#22D3EE]", href: "/portal/events?category=fundraising" },
  { title: "Social Activities", icon: Users, color: "bg-[#2DD4BF]", href: "/portal/events?category=social" },
]

export default function SearchPage() {
  return (
    <Suspense>
      <SearchScreen />
    </Suspense>
  )
}

function SearchScreen() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const { data: events = [] } = useEvents()
  const hits = useMemo(() => searchPortal(query, events), [query, events])
  const searching = query.trim().length > 0

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6 lg:py-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What do you want to know ?"
          className="h-12 rounded-md border-none bg-white pl-10 text-neutral-900 shadow-sm placeholder:text-neutral-500"
        />
      </div>

      {searching ? (
        <SearchResults query={query} hits={hits} />
      ) : (
        <BrowseView events={events} />
      )}
    </div>
  )
}

function BrowseView({ events }: { events: Event[] }) {
  const upcoming = [...events]
    .filter((event) => isLiveEvent(event))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10)

  return (
    <>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={`font-semibold ${portalCanvasTitle}`}>Upcoming Events</h2>
          <Link href="/portal/events" className="rounded-md bg-white/90 px-2.5 py-1 text-sm font-medium text-neutral-800">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-md bg-white px-3 py-6 text-sm text-neutral-600 shadow-sm">No upcoming events yet.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {upcoming.map((event) => {
              const poster = eventImage(event)
              return (
                <Link
                  key={event.id}
                  href="/portal/events"
                  className="relative w-40 shrink-0 overflow-hidden rounded-md bg-neutral-200 lg:w-52"
                >
                  {poster ? (
                    <img src={poster} alt={event.title} className="h-52 w-full object-cover" />
                  ) : (
                    <span className="flex h-52 w-full items-center justify-center">
                      <Calendar className="h-10 w-10 text-neutral-400" />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-2.5 pb-2.5 pt-8">
                    <span className="block text-sm font-semibold text-white">{event.title}</span>
                    <span className="mt-0.5 block text-xs text-white/90">{event.location}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className={`mb-3 font-semibold ${portalCanvasTitle}`}>Categories</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className={`flex min-h-[5.5rem] items-center justify-between gap-2 rounded-md px-3 py-3 text-white ${category.color}`}
            >
              <span className="text-sm font-semibold leading-tight">{category.title}</span>
              <category.icon className="h-8 w-8 shrink-0 text-[#FDE68A]" />
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function SearchResults({ query, hits }: { query: string; hits: SearchHit[] }) {
  const grouped = {
    event: hits.filter((hit) => hit.type === "event"),
    product: hits.filter((hit) => hit.type === "product" || hit.type === "category"),
    page: hits.filter((hit) => hit.type === "page"),
  }

  if (hits.length === 0) {
    return (
      <div className="rounded-md bg-white p-6 text-neutral-800 shadow-sm">
        <p className="font-semibold">No matches for “{query.trim()}”</p>
        <p className="mt-1 text-sm text-neutral-600">Try an event name, product, or page like shop, club, or membership.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {grouped.event.length > 0 ? <ResultGroup title="Events" hits={grouped.event} /> : null}
      {grouped.product.length > 0 ? <ResultGroup title="Shop" hits={grouped.product} /> : null}
      {grouped.page.length > 0 ? <ResultGroup title="Pages" hits={grouped.page} /> : null}
    </div>
  )
}

function ResultGroup({ title, hits }: { title: string; hits: SearchHit[] }) {
  return (
    <section className="overflow-hidden rounded-md bg-white shadow-sm">
      <h2 className="border-b border-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-800">{title}</h2>
      <div className="divide-y divide-neutral-100">
        {hits.map((hit) => (
          <Link key={hit.id} href={hit.href} className="flex items-center gap-3 p-3 hover:bg-neutral-50">
            <ResultThumb hit={hit} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900">{hit.title}</p>
              <p className="line-clamp-2 text-sm text-neutral-600">{hit.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ResultThumb({ hit }: { hit: SearchHit }) {
  if (hit.image) {
    return (
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
        <img src={hit.image} alt="" className="h-full w-full object-cover" />
      </div>
    )
  }

  const Icon = hit.type === "product" || hit.type === "category" ? ShoppingBag : Calendar
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-amber-50 text-leo-primary">
      <Icon className="h-6 w-6" />
    </div>
  )
}
