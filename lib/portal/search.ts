import { eventImage } from "@/lib/content/defaults"
import { shopCategories, shopProducts } from "@/lib/shop/catalog"
import type { Event } from "@/lib/types"

export type SearchHit = {
  id: string
  type: "event" | "product" | "page" | "category"
  title: string
  description: string
  href: string
  image?: string
}

const pages: SearchHit[] = [
  {
    id: "page-shop",
    type: "page",
    title: "Shop",
    description: "Club merchandise — t-shirts, golf shirts, caps, and mugs.",
    href: "/portal/shop",
  },
  {
    id: "page-events",
    type: "page",
    title: "Events",
    description: "Upcoming service projects, meetings, and socials.",
    href: "/portal/events",
  },
  {
    id: "page-club",
    type: "page",
    title: "My Club",
    description: "Members, executives, and club contacts.",
    href: "/portal/club",
  },
  {
    id: "page-training",
    type: "page",
    title: "Training",
    description: "New member modules, quizzes, and Leo graduation path.",
    href: "/portal/training",
  },
  {
    id: "page-membership",
    type: "page",
    title: "Membership",
    description: "Your Leo status, fees, and membership details.",
    href: "/portal/membership",
  },
  {
    id: "page-calendar",
    type: "page",
    title: "Calendar",
    description: "Club dates and activity list.",
    href: "/portal/calendar",
  },
  {
    id: "page-profile",
    type: "page",
    title: "Profile",
    description: "Your name, Leo ID, and account details.",
    href: "/portal/profile",
  },
  {
    id: "page-settings",
    type: "page",
    title: "Settings",
    description: "Notifications, privacy, and sign out.",
    href: "/portal/settings",
  },
]

function haystack(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ").toLowerCase()
}

export function searchPortal(query: string, remoteEvents: Event[] = []): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const hits: SearchHit[] = []

  for (const event of remoteEvents) {
    if (haystack(event.title, event.description, event.category, event.location).includes(q)) {
      hits.push({
        id: `event-${event.id}`,
        type: "event",
        title: event.title,
        description: event.description,
        href: `/portal/events`,
        image: eventImage(event) || undefined,
      })
    }
  }

  for (const product of shopProducts) {
    if (haystack(product.name, product.hashtag, product.description, product.category).includes(q)) {
      hits.push({
        id: `product-${product.id}`,
        type: "product",
        title: product.name,
        description: `${product.hashtag} · ${product.description}`,
        href: `/portal/shop/products/${product.id}`,
        image: product.images[0],
      })
    }
  }

  for (const category of shopCategories) {
    if (haystack(category.label, category.description, category.id).includes(q)) {
      hits.push({
        id: `cat-${category.id}`,
        type: "category",
        title: category.label,
        description: category.description,
        href: `/portal/shop/category/${category.id}`,
      })
    }
  }

  for (const page of pages) {
    if (haystack(page.title, page.description).includes(q)) {
      hits.push(page)
    }
  }

  return hits
}
