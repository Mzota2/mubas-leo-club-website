import {
  Calendar,
  CalendarDays,
  CreditCard,
  GraduationCap,
  Home,
  Search,
  Settings,
  ShoppingBag,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

export type PortalNavItem = {
  href: string
  icon: LucideIcon
  label: string
  match?: "exact" | "prefix"
}

export const portalDesktopNav: PortalNavItem[] = [
  { href: "/portal", icon: Home, label: "Home", match: "exact" },
  { href: "/portal/events", icon: Calendar, label: "Events", match: "prefix" },
  { href: "/portal/club", icon: Users, label: "Club", match: "prefix" },
  { href: "/portal/shop", icon: ShoppingBag, label: "Shop", match: "prefix" },
]

export const portalDesktopMore: PortalNavItem[] = [
  { href: "/portal/training", icon: GraduationCap, label: "Training", match: "prefix" },
  { href: "/portal/membership", icon: User, label: "Membership", match: "prefix" },
  { href: "/portal/payments", icon: CreditCard, label: "Payments", match: "prefix" },
  { href: "/portal/calendar", icon: CalendarDays, label: "Calendar", match: "prefix" },
  { href: "/portal/settings", icon: Settings, label: "Settings", match: "prefix" },
]

export const portalMobileNav: PortalNavItem[] = [
  { href: "/portal", icon: Home, label: "Home", match: "exact" },
  { href: "/portal/search", icon: Search, label: "Search", match: "prefix" },
  { href: "/portal/profile", icon: User, label: "Profile", match: "prefix" },
  { href: "/portal/shop", icon: ShoppingBag, label: "Shop", match: "prefix" },
  { href: "/portal/settings", icon: Settings, label: "Settings", match: "prefix" },
]

export const portalMoreLinks: PortalNavItem[] = [
  { href: "/portal/training", icon: GraduationCap, label: "Training", match: "prefix" },
  { href: "/portal/payments", icon: CreditCard, label: "Payments", match: "prefix" },
  { href: "/portal/search", icon: Search, label: "Search", match: "prefix" },
  { href: "/portal/settings", icon: Settings, label: "Settings", match: "prefix" },
]

export function isPortalNavActive(pathname: string, href: string, match: PortalNavItem["match"] = "prefix") {
  if (match === "exact" || href === "/portal") return pathname === "/portal"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function canAccessAdmin(role?: string) {
  return role === "admin" || role === "leader"
}
