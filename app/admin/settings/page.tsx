"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/hooks/use-settings"

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()

  const [clubName, setClubName] = useState("")
  const [clubEmail, setClubEmail] = useState("")
  const [clubPhone, setClubPhone] = useState("")
  const [clubAddress, setClubAddress] = useState("")
  const [eventReminders, setEventReminders] = useState(true)
  const [birthdayNotifications, setBirthdayNotifications] = useState(true)
  const [paymentNotifications, setPaymentNotifications] = useState(true)

  useEffect(() => {
    if (!settings) return
    setClubName(settings.clubName)
    setClubEmail(settings.clubEmail)
    setClubPhone(settings.clubPhone)
    setClubAddress(settings.clubAddress)
    setEventReminders(settings.notifications.eventReminders)
    setBirthdayNotifications(settings.notifications.birthdayNotifications)
    setPaymentNotifications(settings.notifications.paymentNotifications)
  }, [settings])

  const handleSaveClubInfo = async () => {
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
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-gray-600">Manage platform settings and configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
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
              <div>
                <Label htmlFor="clubName">Club Name</Label>
                <Input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="clubEmail">Contact Email</Label>
                <Input id="clubEmail" type="email" value={clubEmail} onChange={(e) => setClubEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="clubPhone">Contact Phone</Label>
                <Input id="clubPhone" value={clubPhone} onChange={(e) => setClubPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="clubAddress">Address</Label>
                <Textarea id="clubAddress" value={clubAddress} onChange={(e) => setClubAddress(e.target.value)} />
              </div>
              <Button
                className="bg-leo-primary hover:bg-leo-primary-dark"
                onClick={handleSaveClubInfo}
                disabled={updateSettings.isPending}
              >
                Save Changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Event Reminders</Label>
              <p className="text-sm text-gray-600">Send reminders for upcoming events</p>
            </div>
            <Switch checked={eventReminders} onCheckedChange={setEventReminders} disabled={isLoading} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Birthday Notifications</Label>
              <p className="text-sm text-gray-600">Notify members of birthdays</p>
            </div>
            <Switch checked={birthdayNotifications} onCheckedChange={setBirthdayNotifications} disabled={isLoading} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Payment Notifications</Label>
              <p className="text-sm text-gray-600">Send payment confirmation emails</p>
            </div>
            <Switch checked={paymentNotifications} onCheckedChange={setPaymentNotifications} disabled={isLoading} />
          </div>
          <Button
            className="bg-leo-primary hover:bg-leo-primary-dark"
            onClick={handleSaveClubInfo}
            disabled={updateSettings.isPending}
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paychanguKey">PayChangu API Key</Label>
            <Input id="paychanguKey" type="password" placeholder="Configured in .env.local" disabled />
          </div>
          <div>
            <Label htmlFor="paychanguSecret">PayChangu Secret Key</Label>
            <Input id="paychanguSecret" type="password" placeholder="Configured in .env.local" disabled />
          </div>
          <Button className="bg-leo-primary hover:bg-leo-primary-dark" disabled>
            Update Keys
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
