import { media } from "@/lib/media"
import type { DonationCause, Event, Leader } from "@/lib/types"

export const EVENT_CATEGORY_LABELS: Record<Event["category"], string> = {
  health: "Health Causes",
  environment: "Environment",
  community: "Community Service",
  meeting: "Meetings",
  fundraising: "Fundraising",
  social: "Social",
}

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

export function hasEventPoster(image?: string | null) {
  const value = (image ?? "").trim()
  if (!value) return false
  return !value.toLowerCase().includes("placeholder")
}

export function eventImage(event: Pick<Event, "image">) {
  return hasEventPoster(event.image) ? (event.image as string).trim() : ""
}

export function causeImage(cause: Pick<DonationCause, "image">) {
  return hasEventPoster(cause.image) ? (cause.image as string).trim() : ""
}
