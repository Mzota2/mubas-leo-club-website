"use client"

import { useState, type ComponentProps } from "react"
import { IdCard } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const fieldClass =
    "h-12 rounded-md border-none bg-[#9A3412]/55 text-white shadow-none placeholder:text-white/70 disabled:opacity-90"

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <div className="flex items-center gap-3">
        <Avatar className="h-16 w-16 border-2 border-white/80">
          <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
          <AvatarFallback className="bg-white text-xl font-bold text-leo-primary">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-[#92400E] px-3 py-2 text-white">
            <IdCard className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-xs text-white/80">ID {user?.leoId || "Leo-124537"}</p>
              <p className="truncate text-sm font-medium">{user?.username || "Leo Mzota"}</p>
            </div>
          </div>
          <div className="w-28 shrink-0 rounded-md bg-white px-3 py-2">
            <p className="text-sm font-semibold leading-tight text-[#7F1D1D]">
              {user?.position || "Membership Chair"}
            </p>
            <p className="text-xs text-neutral-500">Executive</p>
          </div>
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          setIsEditing(false)
        }}
      >
        <Field label="First Name" id="firstName" defaultValue={user?.firstName} disabled={!isEditing} className={fieldClass} />
        <Field label="Middle Name" id="middleName" defaultValue={user?.middleName} disabled={!isEditing} className={fieldClass} />
        <Field label="Last Name" id="lastName" defaultValue={user?.lastName} disabled={!isEditing} className={fieldClass} />
        <Field label="User Name" id="username" defaultValue={user?.username} disabled={!isEditing} className={fieldClass} />
        <Field label="Phone" id="phone" defaultValue={user?.phone} disabled={!isEditing} className={fieldClass} />
        <Field label="Password" id="password" type="password" defaultValue="••••••••" disabled={!isEditing} className={fieldClass} />
        <Field
          label="Date of Birth"
          id="dateOfBirth"
          type="date"
          defaultValue={user?.dateOfBirth}
          disabled={!isEditing}
          className={fieldClass}
        />

        <div className="flex justify-center pt-2">
          <Button
            type={isEditing ? "submit" : "button"}
            className="h-11 min-w-40 rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
            onClick={() => {
              if (!isEditing) setIsEditing(true)
            }}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  id,
  className,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <div>
      <Label htmlFor={id} className="text-white lg:text-neutral-900">
        {label}
      </Label>
      <Input id={id} className={`mt-1 ${className}`} {...props} />
    </div>
  )
}
