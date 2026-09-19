import { media } from "@/lib/media"
import type { Event, Leader } from "@/lib/types"

const now = new Date().toISOString()

export const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  health: "Health Causes",
  environment: "Environment",
  community: "Community Service",
  meeting: "Meetings",
  fundraising: "Fundraising",
  social: "Social",
}

export const DEFAULT_EVENTS: Event[] = [
  {
    id: "default-blood-donation",
    title: "Blood Donation Drive",
    description: "Join us for our annual blood donation campaign at Community Hospital",
    category: "health",
    date: "2026-10-18",
    time: "8:00 AM - 4:00 PM",
    location: "Area 25 Community Hospital, Lilongwe",
    image: media.posters.bloodDrive,
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "default-changeover-bbq",
    title: "Changeover BBQ Party",
    description: "Celebrate the new Leo year with food, music, and fellowship.",
    category: "social",
    date: "2026-11-08",
    time: "10:00 AM",
    location: "Ndirande New Lines, LDP's Residence",
    image: media.posters.bbq,
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "default-sight-fundraiser",
    title: "Walk for Sight Fundraiser",
    description: "A two-week campaign supporting vision care for students in our community.",
    category: "fundraising",
    date: "2026-10-01",
    endDate: "2026-10-14",
    time: "",
    location: "MUBAS Campus, Blantyre",
    image: media.posters.bloodDrive,
    status: "upcoming",
    attendees: [],
    createdBy: "system",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "default-community-visit",
    title: "Community Support Visit",
    description: "Visiting people with special needs and supporting needy students",
    category: "community",
    date: "2025-03-29",
    time: "8:00 AM - 11:00 AM",
    location: "MUBAS Campus",
    image: media.posters.specialNeeds,
    status: "completed",
    attendees: [],
    createdBy: "system",
    createdAt: now,
    updatedAt: now,
  },
]

export const DEFAULT_LEADERS: Leader[] = [
  {
    id: "default-jane-banda",
    name: "Leo Jane Banda",
    position: "President",
    bio: "Dedicated leader with a vision for expanding our community impact and fostering youth leadership.",
    image: media.people.female,
    email: "jane.banda@mubasleoclub.org",
  },
  {
    id: "default-john-phiri",
    name: "Leo John Phiri",
    position: "Vice President",
    bio: "Committed to organizing impactful service projects and building strong community partnerships.",
    image: media.people.male2,
    email: "john.phiri@mubasleoclub.org",
  },
  {
    id: "default-grace-chirwa",
    name: "Leo Grace Chirwa",
    position: "Secretary",
    bio: "Ensuring smooth operations and effective communication within the club and with external stakeholders.",
    image: media.people.female2,
    email: "grace.chirwa@mubasleoclub.org",
  },
  {
    id: "default-leo-mzota",
    name: "Leo Mzota",
    position: "Membership Chair",
    bio: "Passionate about youth empowerment and community development. Leading membership growth initiatives.",
    image: media.people.male,
    email: "leo.mzota@mubasleoclub.org",
    phone: "+265 981 81 93 89",
  },
]

export function withFallback<T>(items: T[] | undefined, defaults: T[]): T[] {
  return items && items.length > 0 ? items : defaults
}

export { isPastEvent } from "@/lib/content/events"

const LEADER_POSITION_RANK = [
  "president",
  "vice president",
  "vice-president",
  "secretary",
  "treasurer",
  "membership chair",
  "membership",
]

export const EXECUTIVE_POSITIONS = [
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Membership Chair",
  "Project Chair",
  "Public Relations",
  "Tail Twister",
  "Lion Tamer",
  "Advisor",
] as const

export function sortLeaders(leaders: Leader[]) {
  return [...leaders].sort((a, b) => {
    const aManual = a.order ?? Number.POSITIVE_INFINITY
    const bManual = b.order ?? Number.POSITIVE_INFINITY
    if (aManual !== bManual) return aManual - bManual
    const aRank = LEADER_POSITION_RANK.findIndex((title) => a.position.toLowerCase().includes(title))
    const bRank = LEADER_POSITION_RANK.findIndex((title) => b.position.toLowerCase().includes(title))
    const aOrder = aRank === -1 ? LEADER_POSITION_RANK.length : aRank
    const bOrder = bRank === -1 ? LEADER_POSITION_RANK.length : bRank
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.name.localeCompare(b.name)
  })
}

export function eventImage(event: Pick<Event, "image" | "category">) {
  if (event.image) return event.image
  if (event.category === "health") return media.posters.bloodDrive
  if (event.category === "social") return media.posters.bbq
  if (event.category === "community") return media.posters.specialNeeds
  if (event.category === "environment") return media.activities.planting[1]
  return media.posters.meeting
}
