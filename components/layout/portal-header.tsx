"use client"

import { Bell } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function PortalHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#F59E0B] to-[#DC2626] text-white">
      <div className="container max-w-screen-sm mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-white text-[#F59E0B] font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs opacity-90">{user?.leoId || "ID Leo-124537"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-white text-[#DC2626] text-xs">
                10
              </Badge>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
