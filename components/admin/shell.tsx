"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ExternalLink, LayoutDashboard, LayoutGrid, LogOut, Menu, User } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/lib/auth/firebase-auth"
import { cn } from "@/lib/utils"
import { adminNavGroups, getAdminPageMeta, isAdminNavActive } from "@/components/admin/nav-config"
import { WorkspaceSwitcher } from "@/components/portal/workspace-switcher"

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link href="/admin" onClick={onNavigate} className="block">
          <Logo size="sm" textClassName="!inline text-[15px]" />
        </Link>
        <p className="mt-2 pl-10 text-xs font-medium uppercase tracking-wider text-muted-foreground">Admin console</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-leo-primary text-white shadow-sm"
                        : "text-neutral-600 hover:bg-amber-50 hover:text-leo-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3 space-y-1">
        <Link
          href="/portal"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-leo-primary transition-colors hover:bg-amber-50"
        >
          <LayoutDashboard className="h-4 w-4" />
          Member portal
        </Link>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-amber-50 hover:text-leo-primary"
        >
          <ExternalLink className="h-4 w-4" />
          View public site
        </Link>
      </div>
    </div>
  )
}

function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()

  const initials = `${user?.firstName?.[0] ?? "A"}${user?.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-leo-primary focus:ring-offset-2">
          <Avatar className="h-9 w-9 border border-leo-primary/20">
            <AvatarImage src={user?.profileImage} alt={user?.firstName} />
            <AvatarFallback className="bg-leo-primary text-xs font-semibold text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mt-1 max-w-[140px] truncate text-xs text-muted-foreground">{user?.position || user?.role}</p>
          </div>
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
          <Link href="/portal">
            <User className="h-4 w-4" />
            Member portal
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <LayoutGrid className="h-4 w-4" />
            Public website
          </Link>
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

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const page = getAdminPageMeta(pathname)

  return (
    <div className="min-h-dvh overflow-x-clip bg-[#F6F3EE] [&_[data-slot=card]]:!rounded-md">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <NavContent />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <NavContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 md:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{page.label}</p>
                <p className="hidden truncate text-xs text-muted-foreground md:block">{page.description}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <WorkspaceSwitcher current="admin" className="hidden sm:inline-flex" />
              <WorkspaceSwitcher current="admin" compact className="sm:hidden" />
              <Badge variant="secondary" className="hidden capitalize md:inline-flex">
                {user?.role}
              </Badge>
              <Separator orientation="vertical" className="hidden h-6 md:block" />
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="min-w-0 px-3 py-5 sm:px-4 sm:py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
