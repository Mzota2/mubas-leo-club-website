import {
  BarChart3,
  Calendar,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  href: string
  icon: LucideIcon
  label: string
  description: string
}

export type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
        description: "Club performance at a glance",
      },
      {
        href: "/admin/reports",
        icon: FileText,
        label: "Reports",
        description: "Export membership, events, and donations",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/admin/members",
        icon: Users,
        label: "Members",
        description: "Manage members and promotions",
      },
      {
        href: "/admin/attendance",
        icon: ClipboardCheck,
        label: "Attendance",
        description: "Track meetings and penalties",
      },
    ],
  },
  {
    label: "Programs",
    items: [
      {
        href: "/admin/events",
        icon: Calendar,
        label: "Events",
        description: "Create and manage club events",
      },
      {
        href: "/admin/training",
        icon: GraduationCap,
        label: "Training",
        description: "New member modules, quizzes, and waivers",
      },
      {
        href: "/admin/gallery",
        icon: ImageIcon,
        label: "Gallery",
        description: "Publish photos from club activities",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        href: "/admin/payments",
        icon: CreditCard,
        label: "Payments",
        description: "Donations, membership, and joining fees",
      },
      {
        href: "/admin/fees",
        icon: CreditCard,
        label: "Membership fees",
        description: "Monthly, semester, and yearly collections",
      },
      {
        href: "/admin/donations",
        icon: DollarSign,
        label: "Donations",
        description: "Review incoming donations",
      },
      {
        href: "/admin/donation-causes",
        icon: Target,
        label: "Causes",
        description: "Manage fundraising causes",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        href: "/admin/settings",
        icon: Settings,
        label: "Settings",
        description: "Club information and notifications",
      },
    ],
  },
]

export const adminNavItems = adminNavGroups.flatMap((group) => group.items)

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getAdminPageMeta(pathname: string) {
  const match = [...adminNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isAdminNavActive(pathname, item.href))

  return (
    match ?? {
      href: "/admin",
      icon: BarChart3,
      label: "Admin",
      description: "Leo Club administration",
    }
  )
}
