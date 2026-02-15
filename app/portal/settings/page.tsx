"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, SettingsIcon, Lock, Bell, Info, LogOut } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  const settingsItems = [
    {
      icon: SettingsIcon,
      title: "General Settings",
      description: "Language and input settings",
      href: "/portal/settings/general",
    },
    {
      icon: Lock,
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
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-white">
        <button onClick={() => router.back()}>
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {/* Profile Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white text-xl font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">ID {user?.leoId || "Leo-124537"}</p>
            <p className="text-sm text-gray-600">@{user?.username || "Leo Mzota"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Items */}
      <div className="space-y-3">
        {settingsItems.map((item) => (
          <Card
            key={item.title}
            className="bg-white/90 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => router.push(item.href)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-[#DC2626]/10 rounded-full">
                <item.icon className="h-6 w-6 text-[#DC2626]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        ))}

        {/* Logout */}
        <Card
          className="bg-[#F59E0B]/90 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={handleLogout}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <LogOut className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Log out</h3>
              <p className="text-sm text-white/80">Log out from app</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
