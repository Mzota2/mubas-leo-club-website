"use client"

import { useState } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card className="bg-white/90 backdrop-blur-sm border-none shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#F59E0B] to-[#DC2626]" />
        <CardContent className="relative pt-16 pb-6">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#DC2626] text-white text-2xl font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-[#F59E0B] rounded-full text-white shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-center mt-2">
            <h2 className="text-xl font-bold">
              {user?.firstName} {user?.middleName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-600">@{user?.username}</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Badge className="bg-[#92400E] text-white">ID {user?.leoId || "Leo-124537"}</Badge>
              <Badge className="bg-white text-[#DC2626] border border-[#DC2626]">
                {user?.position || "Membership Chair"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="bg-white/90 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              defaultValue={user?.firstName}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              defaultValue={user?.middleName}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              defaultValue={user?.lastName}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="username">User Name</Label>
            <Input
              id="username"
              defaultValue={user?.username}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              defaultValue={user?.phone}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              defaultValue="••••••••"
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              defaultValue={user?.dateOfBirth}
              disabled={!isEditing}
              className="bg-[#F59E0B]/10 border-none"
            />
          </div>

          <Button
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
