"use client"

import { useRouter } from "next/navigation"
import { Bell, ChevronLeft, ChevronRight, Info, LogOut, SettingsIcon, Shield } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { canAccessAdmin } from "@/components/portal/nav-config"
import { signOut } from "@/lib/auth/firebase-auth"
import { portalCanvasTitle } from "@/components/portal/styles"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const settingsItems = [
    {
      icon: SettingsIcon,
      title: "General Settings",
      description: "Language and input settings",
      href: "/portal/settings/general",
    },
    {
      icon: Info,
      title: "Privacy & Security",
      description: "Account and password settings",
      href: "/portal/settings/privacy",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Block, Allow and Priorities",
      href: "/portal/settings/notifications",
    },
    {
      icon: Info,
      title: "App Settings",
      description: "App permissions",
      href: "/portal/settings/app",
    },
  ]

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <div className={`flex items-center gap-1 ${portalCanvasTitle}`}>
        <button type="button" onClick={() => router.back()} className="rounded-md p-1 lg:hidden" aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-16 w-16 border-2 border-white/80">
          <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-white text-xl font-bold text-leo-primary">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-white lg:text-neutral-900">
          <p className="font-semibold">ID {user?.leoId || "Leo-124537"}</p>
          <p className="text-sm text-white/85 lg:text-muted-foreground">@{user?.username || "Leo Mzota"}</p>
        </div>
      </div>

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => router.push(item.href)}
            className="flex w-full items-center gap-3 rounded-md bg-white p-3 text-left shadow-sm"
          >
            <div className="rounded-md bg-[#DC2626]/10 p-2.5">
              <item.icon className="h-5 w-5 text-[#7F1D1D]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#7F1D1D]" />
          </button>
        ))}

        {canAccessAdmin(user?.role) ? (
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex w-full items-center gap-3 rounded-md bg-white p-3 text-left shadow-sm"
          >
            <div className="rounded-md bg-amber-50 p-2.5">
              <Shield className="h-5 w-5 text-leo-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900">Admin console</h3>
              <p className="text-sm text-neutral-500">Manage members, events, and donations</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#7F1D1D]" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={async () => {
            await signOut()
            router.push("/")
          }}
          className="flex w-full items-center gap-3 rounded-md bg-[#F59E0B] p-3 text-left"
        >
          <div className="rounded-md bg-white/20 p-2.5">
            <LogOut className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">Log out</h3>
            <p className="text-sm text-white/80">Log out from app</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#7F1D1D]" />
        </button>
      </div>
    </div>
  )
}
