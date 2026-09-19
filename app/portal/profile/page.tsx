"use client"

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react"
import Link from "next/link"
import { Cake, Camera, IdCard } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUpdateUser } from "@/lib/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { daysUntilBirthday, nextBirthday, STUDY_YEARS } from "@/lib/content/academic"
import { BIRTHDAY_STYLES, birthdayCalendarHref, hasProfilePhoto } from "@/lib/content/birthdays"
import { BirthdayStatusStage } from "@/components/portal/birthday-status-stage"
import { ProfilePhotoCropper } from "@/components/portal/profile-photo-cropper"
import { displayName, withLeoTitle } from "@/lib/utils/format"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  username: "",
  phone: "",
  dateOfBirth: "",
  birthdayStyle: "classic",
  birthdayMessage: "",
  birthdayVisible: true,
  programOfStudy: "",
  yearOfStudy: "",
  expectedGraduationDate: "",
}

export default function ProfilePage() {
  const { user } = useAuth()
  const updateUser = useUpdateUser()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const hasPhoto = hasProfilePhoto(user?.profileImage)

  useEffect(() => {
    if (!user || isEditing) return
    setForm({
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      birthdayStyle: user.birthdayStyle || "classic",
      birthdayMessage: user.birthdayMessage ?? "",
      birthdayVisible: user.birthdayVisible !== false,
      programOfStudy: user.programOfStudy ?? "",
      yearOfStudy: user.yearOfStudy ?? "",
      expectedGraduationDate: user.expectedGraduationDate ?? "",
    })
  }, [user, isEditing])

  const celebrationPreview = useMemo(() => {
    if (!user?.id || !form.dateOfBirth) return null
    const next = nextBirthday(form.dateOfBirth)
    const daysAway = daysUntilBirthday(form.dateOfBirth)
    if (!next || daysAway == null) return null
    return {
      memberId: user.id,
      memberName: displayName({ firstName: form.firstName, middleName: form.middleName, lastName: form.lastName }),
      memberImage: user.profileImage,
      dateOfBirth: form.dateOfBirth,
      nextDate: next,
      daysAway,
      isToday: daysAway === 0,
      style: form.birthdayStyle,
      message: form.birthdayMessage,
    }
  }, [form.birthdayMessage, form.birthdayStyle, form.dateOfBirth, form.firstName, form.lastName, form.middleName, user?.id, user?.profileImage])

  const fieldClass = cn(
    "h-12 rounded-md shadow-none",
    isEditing
      ? "border border-white/70 bg-white text-neutral-900 placeholder:text-neutral-500"
      : "border-none bg-[#9A3412]/55 text-white placeholder:text-white/70",
  )

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const startEditing = () => {
    setIsEditing(true)
    window.setTimeout(() => document.getElementById("firstName")?.focus(), 0)
  }

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const onPickPhoto = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Choose a photo", description: "Use a JPG, PNG, or WebP image.", variant: "destructive" })
      return
    }
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(URL.createObjectURL(file))
  }

  const savePhoto = async (file: File) => {
    if (!user?.id) return
    setIsUploadingPhoto(true)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", "leo-club/profiles")
      const response = await fetch("/api/upload", { method: "POST", body: payload })
      const json = await response.json()
      const url = json?.data?.secure_url || json?.data?.url
      if (!url) throw new Error(json?.error || "Upload failed")
      await updateUser.mutateAsync({ userId: user.id, data: { profileImage: url } })
      closeCropper()
      toast({ title: "Photo updated", description: "Your profile picture is ready for the portal and birthday status." })
    } catch (error: unknown) {
      toast({
        title: "Could not update photo",
        description: error instanceof Error ? error.message : "Try another image.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="space-y-5 px-4 py-5 lg:px-6 lg:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-md"
            aria-label="Update profile photo"
          >
            <Avatar className="h-20 w-20 border-2 border-white/80">
              <AvatarImage src={user?.profileImage || undefined} />
              <AvatarFallback className="bg-white text-xl font-bold text-leo-primary">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-md bg-[#F59E0B] text-white">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={(event) => {
              onPickPhoto(event.target.files?.[0])
              event.target.value = ""
            }}
          />
          <div className="sm:hidden">
            <Button type="button" variant="outline" className="h-9 rounded-md bg-white" onClick={() => fileInputRef.current?.click()}>
              {hasPhoto ? "Change photo" : "Upload photo"}
            </Button>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-[#92400E] px-3 py-2 text-white">
            <IdCard className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-xs text-white/80">ID {user?.leoId || "Leo-124537"}</p>
              <p className="truncate text-sm font-medium">{user?.username || "Leo Mzota"}</p>
            </div>
          </div>
          <div className="rounded-md bg-white px-3 py-2 sm:w-28 sm:shrink-0">
            <p className="text-sm font-semibold leading-tight text-[#7F1D1D]">
              {user?.position || "Member"}
            </p>
            <p className="text-xs text-neutral-500">{user?.position ? "Executive" : "Leo"}</p>
          </div>
        </div>
      </div>

      {!hasPhoto ? (
        <p className="rounded-md bg-white/90 px-3 py-2 text-sm text-neutral-800">
          Upload a profile photo so your birthday status can show your picture in the background.
          <button type="button" className="ml-1 font-semibold text-leo-primary" onClick={() => fileInputRef.current?.click()}>
            Upload photo
          </button>
        </p>
      ) : (
        <button
          type="button"
          className="hidden text-sm font-medium text-white sm:inline lg:text-leo-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          Change photo
        </button>
      )}

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!user?.id || !isEditing) return
          try {
            await updateUser.mutateAsync({
              userId: user.id,
              data: {
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                phone: form.phone,
                programOfStudy: form.programOfStudy,
                yearOfStudy: form.yearOfStudy,
                expectedGraduationDate: form.expectedGraduationDate,
                birthdayStyle: form.birthdayStyle || "classic",
                birthdayMessage: form.birthdayMessage,
                birthdayVisible: form.birthdayVisible,
                ...(form.middleName ? { middleName: form.middleName } : {}),
                dateOfBirth: form.dateOfBirth,
              },
            })
            setIsEditing(false)
            toast({ title: "Profile saved", description: "Your details were updated." })
          } catch (error: unknown) {
            toast({
              title: "Could not save profile",
              description: error instanceof Error ? error.message : "Try again.",
              variant: "destructive",
            })
          }
        }}
      >
        <p className="text-sm font-semibold text-white lg:text-neutral-900">Personal information</p>
        <Field label="First Name" id="firstName" value={form.firstName} onChange={(event) => setField("firstName", event.target.value)} readOnly={!isEditing} className={fieldClass} />
        <Field label="Middle Name" id="middleName" value={form.middleName} onChange={(event) => setField("middleName", event.target.value)} readOnly={!isEditing} className={fieldClass} />
        <Field label="Last Name" id="lastName" value={form.lastName} onChange={(event) => setField("lastName", event.target.value)} readOnly={!isEditing} className={fieldClass} />
        <Field label="User Name" id="username" value={form.username} onChange={(event) => setField("username", event.target.value)} readOnly={!isEditing} className={fieldClass} />
        <Field label="Phone" id="phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} readOnly={!isEditing} className={fieldClass} />
        <p className="pt-2 text-sm font-semibold text-white lg:text-neutral-900">Birthday celebration</p>
        <Field
          label="Birthday (optional)"
          id="dateOfBirth"
          type="date"
          value={form.dateOfBirth}
          onChange={(event) => setField("dateOfBirth", event.target.value)}
          readOnly={!isEditing}
          className={fieldClass}
        />
        <div className="rounded-md bg-white/90 p-3 text-neutral-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Show that my birthday is coming</p>
              <p className="text-xs text-neutral-500">Appears on the portal sidebar and club calendar</p>
            </div>
            <Switch
              checked={form.birthdayVisible}
              onCheckedChange={(checked) => {
                if (!isEditing) return
                setForm((current) => ({ ...current, birthdayVisible: checked }))
              }}
              disabled={!isEditing || !form.dateOfBirth}
            />
          </div>
          <p className="mt-3 text-sm font-medium">Celebration style</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BIRTHDAY_STYLES.map((style) => {
              const selected = form.birthdayStyle === style.id
              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setField("birthdayStyle", style.id)}
                  className={cn(
                    "rounded-md p-3 text-left text-sm font-medium text-white",
                    style.card,
                    selected ? "ring-2 ring-[#F59E0B] ring-offset-2" : "opacity-80",
                    isEditing ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  {style.label}
                </button>
              )
            })}
          </div>
          <div className="mt-3">
            <Label htmlFor="birthdayMessage">Celebration note</Label>
            <Textarea
              id="birthdayMessage"
              value={form.birthdayMessage}
              readOnly={!isEditing}
              maxLength={80}
              placeholder="e.g. Cake and service with fellow Leos"
              onChange={(event) => setField("birthdayMessage", event.target.value)}
              className={cn("mt-1 min-h-20 rounded-md", isEditing ? "bg-white" : "cursor-default bg-neutral-50")}
            />
          </div>
          {celebrationPreview && form.birthdayVisible ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-neutral-500">Status preview</p>
              <BirthdayStatusStage image={user?.profileImage} styleId={form.birthdayStyle} className="h-64">
                <div className="flex h-full flex-col justify-end px-4 pb-4 text-white">
                  <Cake className="mb-2 h-7 w-7" />
                  <p className="text-xs uppercase tracking-wide text-white/85">Happy birthday</p>
                  <h3 className="mt-1 text-xl font-semibold">{withLeoTitle(celebrationPreview.memberName)}</h3>
                  {form.birthdayMessage ? <p className="mt-2 text-sm text-white/95">{form.birthdayMessage}</p> : null}
                  {!hasPhoto ? (
                    <p className="mt-2 text-sm text-white/95">
                      Upload a profile photo so this status shows your picture.
                    </p>
                  ) : null}
                </div>
              </BirthdayStatusStage>
              <Link
                href={birthdayCalendarHref(user?.id || "", celebrationPreview.nextDate)}
                className="inline-flex items-center gap-1 text-sm font-medium text-leo-primary"
              >
                <Cake className="h-4 w-4" />
                See it on the calendar
              </Link>
              <p className="text-xs text-neutral-500">
                On the day, this appears as a status on the portal. Other days show under Upcoming birthdays and Calendar.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-neutral-500">
              {form.dateOfBirth
                ? "Turn this on to show your upcoming birthday on the portal and calendar."
                : "Add your birthday to celebrate with fellow Leos."}
            </p>
          )}
        </div>

        <p className="pt-2 text-sm font-semibold text-white lg:text-neutral-900">Academic information</p>
        <Field
          label="Program of study"
          id="programOfStudy"
          placeholder="e.g. Civil Engineering"
          value={form.programOfStudy}
          onChange={(event) => setField("programOfStudy", event.target.value)}
          readOnly={!isEditing}
          className={fieldClass}
        />
        <div>
          <Label htmlFor="yearOfStudy" className="text-white lg:text-neutral-900">
            Year of study
          </Label>
          <select
            id="yearOfStudy"
            value={form.yearOfStudy}
            onChange={(event) => {
              if (!isEditing) return
              setField("yearOfStudy", event.target.value)
            }}
            className={cn("mt-1 w-full px-3", fieldClass)}
          >
            <option value="">Select year</option>
            {STUDY_YEARS.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Expected graduation date"
          id="expectedGraduationDate"
          type="date"
          value={form.expectedGraduationDate}
          onChange={(event) => setField("expectedGraduationDate", event.target.value)}
          readOnly={!isEditing}
          className={fieldClass}
        />

        <div className="flex justify-center gap-2 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-28 rounded-md bg-white"
                onClick={() => setIsEditing(false)}
                disabled={updateUser.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 min-w-40 rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="h-11 min-w-40 rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
              onClick={startEditing}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </form>

      <ProfilePhotoCropper
        open={Boolean(cropSrc)}
        imageSrc={cropSrc}
        isSaving={isUploadingPhoto}
        onOpenChange={(open) => {
          if (!open && !isUploadingPhoto) closeCropper()
        }}
        onConfirm={savePhoto}
      />
    </div>
  )
}

function Field({
  label,
  id,
  className,
  readOnly,
  ...props
}: ComponentProps<typeof Input> & { label: string }) {
  return (
    <div>
      <Label htmlFor={id} className="text-white lg:text-neutral-900">
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        readOnly={readOnly}
        className={cn("mt-1 pointer-events-auto", className, readOnly ? "cursor-default" : "cursor-text")}
      />
    </div>
  )
}
