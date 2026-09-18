"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, ChevronDown, IdCard, LogOut, Search, Settings, User } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { signOut } from "@/lib/auth/firebase-auth"
import { cn } from "@/lib/utils"
import { isPortalNavActive, portalDesktopMore, portalDesktopNav } from "@/components/portal/nav-config"
import { WorkspaceSwitcher } from "@/components/portal/workspace-switcher"

export function PortalHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: notifications = [] } = useNotifications()
  const unreadCount = notifications.filter((item) => !item.read).length
  const initials = `${user?.firstName?.[0] ?? "M"}${user?.lastName?.[0] ?? ""}`.toUpperCase()
  const moreActive = portalDesktopMore.some((item) => isPortalNavActive(pathname, item.href, item.match))
  const hideMobileIdentity =
    pathname.startsWith("/portal/shop") ||
    pathname.startsWith("/portal/settings") ||
    pathname.startsWith("/portal/profile")

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-neutral-200 bg-white lg:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/portal" className="shrink-0">
              <Logo size="sm" textClassName="!inline text-[15px]" />
            </Link>
            <nav className="flex items-center">
              {portalDesktopNav.map((item) => {
                const active = isPortalNavActive(pathname, item.href, item.match)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-b-2 border-leo-primary text-leo-primary"
                        : "border-b-2 border-transparent text-neutral-600 hover:text-leo-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
                      moreActive
                        ? "border-b-2 border-leo-primary text-leo-primary"
                        : "border-b-2 border-transparent text-neutral-600 hover:text-leo-primary",
                    )}
                  >
                    More
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {portalDesktopMore.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <WorkspaceSwitcher current="portal" compact />
            <Button asChild variant="ghost" size="icon" className="text-neutral-600">
              <Link href="/portal/search" aria-label="Search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative text-neutral-600">
              <Link href="/portal/notifications" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 border-none bg-leo-secondary px-1 text-[10px] text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            <UserMenu initials={initials} />
          </div>
        </div>
      </header>

      <header
        className={cn(
          "sticky top-0 z-40 bg-[#F59E0B] text-white lg:hidden",
          hideMobileIdentity && "hidden",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/portal/profile" aria-label="Profile">
            <Avatar className="h-10 w-10 border-2 border-white/80">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-white text-sm font-bold text-leo-primary">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-md bg-[#92400E] px-3 py-1.5 text-sm font-medium">
            <IdCard className="h-4 w-4" />
            ID {user?.leoId || "Leo-124537"}
          </div>
          <div className="flex items-center">
            <WorkspaceSwitcher current="portal" compact />
            <Link
              href="/portal/notifications"
              className="relative rounded-full bg-[#FDE68A] p-2 text-[#92400E]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center border-none bg-white p-0 text-[10px] text-[#DC2626]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              ) : null}
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

function UserMenu({ initials }: { initials: string }) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-1 rounded-full p-0.5 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-leo-primary focus:ring-offset-2">
          <Avatar className="h-9 w-9 border border-leo-primary/20">
            <AvatarImage src={user?.profileImage} alt={user?.firstName} />
            <AvatarFallback className="bg-leo-primary text-xs font-semibold text-white">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/portal/profile">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/portal/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">Public website</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut()
            router.push("/")
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
