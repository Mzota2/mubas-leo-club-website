"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/page-header"
import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()
  const { toast } = useToast()

  const [clubName, setClubName] = useState("")
  const [clubEmail, setClubEmail] = useState("")
  const [clubPhone, setClubPhone] = useState("")
  const [clubAddress, setClubAddress] = useState("")
  const [eventReminders, setEventReminders] = useState(true)
  const [birthdayNotifications, setBirthdayNotifications] = useState(true)
  const [paymentNotifications, setPaymentNotifications] = useState(true)
  const [monthlyFee, setMonthlyFee] = useState("1000")
  const [semesterFee, setSemesterFee] = useState("5000")
  const [yearlyFee, setYearlyFee] = useState("10000")
  const [joiningFee, setJoiningFee] = useState("5000")
  const [semesterStart, setSemesterStart] = useState("")
  const [semesterEnd, setSemesterEnd] = useState("")

  useEffect(() => {
    if (!settings) return
    setClubName(settings.clubName)
    setClubEmail(settings.clubEmail)
    setClubPhone(settings.clubPhone)
    setClubAddress(settings.clubAddress)
    setEventReminders(settings.notifications.eventReminders)
    setBirthdayNotifications(settings.notifications.birthdayNotifications)
    setPaymentNotifications(settings.notifications.paymentNotifications)
    setMonthlyFee(String(settings.membership?.monthlyFee ?? 1000))
    setSemesterFee(String(settings.membership?.semesterFee ?? 5000))
    setYearlyFee(String(settings.membership?.yearlyFee ?? 10000))
    setJoiningFee(String(settings.membership?.joiningFee ?? 5000))
    setSemesterStart(settings.membership?.semesterStart ?? "")
    setSemesterEnd(settings.membership?.semesterEnd ?? "")
  }, [settings])

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      clubName,
      clubEmail,
      clubPhone,
      clubAddress,
      notifications: {
        eventReminders,
        birthdayNotifications,
        paymentNotifications,
      },
      membership: {
        monthlyFee: Number(monthlyFee) || 0,
        semesterFee: Number(semesterFee) || 0,
        yearlyFee: Number(yearlyFee) || 0,
        joiningFee: Number(joiningFee) || 0,
        semesterStart,
        semesterEnd,
      },
    })
    toast({
      title: "Settings saved",
      description: "Club information and notification preferences were updated.",
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Update club contact details, membership fees, and notification preferences."
        actions={
          <Button className="bg-leo-primary hover:bg-leo-primary-dark" onClick={handleSave} disabled={isLoading || updateSettings.isPending}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-md border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Club information</CardTitle>
            <CardDescription>Shown across public and member-facing pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="clubName">Club name</Label>
                  <Input id="clubName" value={clubName} onChange={(event) => setClubName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubEmail">Contact email</Label>
                  <Input id="clubEmail" type="email" value={clubEmail} onChange={(event) => setClubEmail(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubPhone">Contact phone</Label>
                  <Input id="clubPhone" value={clubPhone} onChange={(event) => setClubPhone(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubAddress">Address</Label>
                  <Textarea id="clubAddress" value={clubAddress} onChange={(event) => setClubAddress(event.target.value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
            <CardDescription>Control which automated messages the platform sends.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-4">
              <div>
                <Label>Event reminders</Label>
                <p className="text-sm text-muted-foreground">Send reminders for upcoming events</p>
              </div>
              <Switch checked={eventReminders} onCheckedChange={setEventReminders} disabled={isLoading} />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-4">
              <div>
                <Label>Birthday notifications</Label>
                <p className="text-sm text-muted-foreground">Notify members of birthdays</p>
              </div>
              <Switch checked={birthdayNotifications} onCheckedChange={setBirthdayNotifications} disabled={isLoading} />
            </div>
            <div className="flex items-start justify-between gap-3 rounded-md border border-border/60 p-4">
              <div>
                <Label>Payment notifications</Label>
                <p className="text-sm text-muted-foreground">Send payment confirmation emails</p>
              </div>
              <Switch checked={paymentNotifications} onCheckedChange={setPaymentNotifications} disabled={isLoading} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Membership fees</CardTitle>
          <CardDescription>Amounts and the current semester window used for payment tracking.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyFee">Monthly (MWK)</Label>
            <Input id="monthlyFee" type="number" value={monthlyFee} onChange={(event) => setMonthlyFee(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semesterFee">Semester (MWK)</Label>
            <Input id="semesterFee" type="number" value={semesterFee} onChange={(event) => setSemesterFee(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearlyFee">Yearly (MWK)</Label>
            <Input id="yearlyFee" type="number" value={yearlyFee} onChange={(event) => setYearlyFee(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joiningFee">Joining fee, once-off (MWK)</Label>
            <Input id="joiningFee" type="number" value={joiningFee} onChange={(event) => setJoiningFee(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semesterStart">Semester start</Label>
            <Input id="semesterStart" type="date" value={semesterStart} onChange={(event) => setSemesterStart(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="semesterEnd">Semester end</Label>
            <Input id="semesterEnd" type="date" value={semesterEnd} onChange={(event) => setSemesterEnd(event.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
