"use client"

import { useEffect, useState } from "react"
import { CreditCard, Wallet } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUsers, useUpdateUser } from "@/lib/hooks/use-users"
import { useCreateMembershipFee, useMembershipFees } from "@/lib/hooks/use-membership-fees"
import { usePlatformSettings, useUpdatePlatformSettings } from "@/lib/hooks/use-settings"
import {
  amountForPeriod,
  billingFromSettings,
  collectedInRange,
  coverageFor,
  hasPaidJoiningFee,
  memberPaidInRange,
  periodLabel,
  toIsoDate,
} from "@/lib/membership/billing"
import { displayName, formatDate, formatMoney } from "@/lib/utils/format"
import type { FeePeriod, User } from "@/lib/types"

type View = "monthly" | "semester" | "yearly" | "joining"

export default function AdminFeesPage() {
  const { toast } = useToast()
  const { user: adminUser } = useAuth()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: fees = [], isLoading: feesLoading } = useMembershipFees()
  const { data: settings, isLoading: settingsLoading } = usePlatformSettings()
  const updateSettings = useUpdatePlatformSettings()
  const updateUser = useUpdateUser()
  const createFee = useCreateMembershipFee()

  const billing = billingFromSettings(settings)
  const [view, setView] = useState<View>("monthly")
  const [monthlyFee, setMonthlyFee] = useState("")
  const [semesterFee, setSemesterFee] = useState("")
  const [yearlyFee, setYearlyFee] = useState("")
  const [joiningFee, setJoiningFee] = useState("")
  const [semesterStart, setSemesterStart] = useState("")
  const [semesterEnd, setSemesterEnd] = useState("")

  const [offlineUser, setOfflineUser] = useState<User | null>(null)
  const [offlinePeriod, setOfflinePeriod] = useState<FeePeriod>("monthly")
  const [offlineAmount, setOfflineAmount] = useState("")
  const [offlineNotes, setOfflineNotes] = useState("")

  useEffect(() => {
    setMonthlyFee(String(billing.monthlyFee))
    setSemesterFee(String(billing.semesterFee))
    setYearlyFee(String(billing.yearlyFee))
    setJoiningFee(String(billing.joiningFee))
    setSemesterStart(billing.semesterStart)
    setSemesterEnd(billing.semesterEnd)
  }, [billing.monthlyFee, billing.semesterFee, billing.yearlyFee, billing.joiningFee, billing.semesterStart, billing.semesterEnd])

  const now = new Date()
  const isJoiningView = view === "joining"
  const range = coverageFor(isJoiningView ? "yearly" : view, now, billing)
  const periodFee = amountForPeriod(view, billing)
  const roster = (users ?? []).filter((member) => (member.membershipStatus ?? "active") !== "inactive")
  const joiningRoster = roster.filter((member) => member.membershipType === "prospective-leo" || member.joinIntent === "joining")
  const activeRoster = isJoiningView ? joiningRoster : roster
  const paidMembers = activeRoster.filter((member) =>
    isJoiningView ? hasPaidJoiningFee(fees, member.id, member) : memberPaidInRange(fees, member.id, range.start, range.end),
  )
  const unpaidMembers = activeRoster.filter((member) =>
    isJoiningView ? !hasPaidJoiningFee(fees, member.id, member) : !memberPaidInRange(fees, member.id, range.start, range.end),
  )
  const collected = isJoiningView
    ? fees.filter((fee) => fee.period === "joining" && fee.status === "paid").reduce((sum, fee) => sum + Number(fee.amount || 0), 0)
    : collectedInRange(fees, range.start, range.end)
  const outstanding = unpaidMembers.length * periodFee

  const handleSaveBilling = async () => {
    if (!settings) return
    await updateSettings.mutateAsync({
      clubName: settings.clubName,
      clubEmail: settings.clubEmail,
      clubPhone: settings.clubPhone,
      clubAddress: settings.clubAddress,
      notifications: settings.notifications,
      membership: {
        monthlyFee: Number(monthlyFee) || 0,
        semesterFee: Number(semesterFee) || 0,
        yearlyFee: Number(yearlyFee) || 0,
        joiningFee: Number(joiningFee) || 0,
        semesterStart,
        semesterEnd,
      },
    })
    toast({ title: "Fee settings saved" })
  }

  const openOffline = (member: User) => {
    setOfflineUser(member)
    setOfflinePeriod(view)
    setOfflineAmount(String(amountForPeriod(view, billing)))
    setOfflineNotes("")
  }

  const handleOffline = async () => {
    if (!offlineUser || !adminUser?.id) return
    const amount = Number(offlineAmount)
    if (!amount) return
    const cover = coverageFor(offlinePeriod, now, billing)
    const paidAt = new Date().toISOString()
    await createFee.mutateAsync({
      userId: offlineUser.id,
      amount,
      period: offlinePeriod,
      coverageStart: toIsoDate(cover.start),
      coverageEnd: toIsoDate(cover.end),
      dueDate: toIsoDate(cover.end),
      paymentDate: paidAt,
      status: "paid",
      method: "offline",
      notes: offlineNotes.trim() || "Paid outside the platform",
      recordedBy: adminUser.id,
      createdAt: paidAt,
    })
    if (offlinePeriod === "joining") {
      await updateUser.mutateAsync({
        userId: offlineUser.id,
        data: {
          joiningFeePaid: true,
          joiningFeePaidAt: paidAt,
        },
      })
    }
    toast({
      title: "Payment recorded",
      description: `${displayName(offlineUser)} marked paid for ${periodLabel(offlinePeriod).toLowerCase()}.`,
    })
    setOfflineUser(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Membership fees"
        description="Track monthly, semester, and yearly payments. Record fees paid outside the platform."
      />

      <div className="rounded-md border bg-white p-4">
        <h2 className="font-semibold">Fee amounts and semester dates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These dates define who is paid for the current semester.
        </p>
        {settingsLoading ? (
          <Skeleton className="mt-4 h-24 w-full" />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="monthlyFee">Monthly fee (MWK)</Label>
              <Input id="monthlyFee" type="number" value={monthlyFee} onChange={(event) => setMonthlyFee(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="semesterFee">Semester fee (MWK)</Label>
              <Input id="semesterFee" type="number" value={semesterFee} onChange={(event) => setSemesterFee(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="yearlyFee">Yearly fee (MWK)</Label>
              <Input id="yearlyFee" type="number" value={yearlyFee} onChange={(event) => setYearlyFee(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="joiningFee">Joining fee, once-off (MWK)</Label>
              <Input id="joiningFee" type="number" value={joiningFee} onChange={(event) => setJoiningFee(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="semesterStart">Semester start</Label>
              <Input id="semesterStart" type="date" value={semesterStart} onChange={(event) => setSemesterStart(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="semesterEnd">Semester end</Label>
              <Input id="semesterEnd" type="date" value={semesterEnd} onChange={(event) => setSemesterEnd(event.target.value)} className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveBilling} disabled={updateSettings.isPending} className="bg-leo-primary text-white">
                Save fee settings
              </Button>
            </div>
          </div>
        )}
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as View)}>
        <TabsList>
          <TabsTrigger value="monthly">This month</TabsTrigger>
          <TabsTrigger value="semester">This semester</TabsTrigger>
          <TabsTrigger value="yearly">This year</TabsTrigger>
          <TabsTrigger value="joining">Joining fee</TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        {isJoiningView
          ? "Once-off joining fee for prospective members. Required before quizzes."
          : `Coverage: ${formatDate(range.start.toISOString())} – ${formatDate(range.end.toISOString())}`}
      </p>

      <div className="grid gap-4 sm:grid-cols-4">
        <AdminStatCard title="Collected" value={formatMoney(collected)} icon={Wallet} accent="green" loading={feesLoading} />
        <AdminStatCard title="Outstanding" value={formatMoney(outstanding)} hint={`${unpaidMembers.length} unpaid × ${formatMoney(periodFee)}`} icon={CreditCard} accent="red" loading={usersLoading} />
        <AdminStatCard title="Paid" value={paidMembers.length} icon={Wallet} accent="orange" />
        <AdminStatCard title="Unpaid" value={unpaidMembers.length} icon={CreditCard} accent="amber" />
      </div>

      {usersLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : activeRoster.length === 0 ? (
        <AdminEmptyState icon={CreditCard} title="No members yet" description="Members appear here after they register." />
      ) : (
        <div className="overflow-hidden rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{periodLabel(view)}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRoster.map((member) => {
                const paid = isJoiningView
                  ? hasPaidJoiningFee(fees, member.id, member)
                  : memberPaidInRange(fees, member.id, range.start, range.end)
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="font-medium">{displayName(member)}</p>
                      <p className="text-sm text-muted-foreground">{member.leoId}</p>
                    </TableCell>
                    <TableCell>{member.membershipType === "leo" ? "Leo" : "Prospective"}</TableCell>
                    <TableCell>{member.membershipStatus ?? "active"}</TableCell>
                    <TableCell>
                      <Badge variant={paid ? "default" : "secondary"}>{paid ? "Paid" : "Unpaid"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!paid ? (
                        <Button variant="outline" size="sm" onClick={() => openOffline(member)}>
                          Mark paid offline
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!offlineUser} onOpenChange={() => setOfflineUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record offline payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Use this when {offlineUser ? displayName(offlineUser) : "the member"} paid outside the website.
          </p>
          <div className="space-y-3">
            <div>
              <Label>Period</Label>
              <Select value={offlinePeriod} onValueChange={(value: FeePeriod) => {
                setOfflinePeriod(value)
                setOfflineAmount(String(amountForPeriod(value, billing)))
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="joining">Joining (once-off)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="offline-amount">Amount (MWK)</Label>
              <Input id="offline-amount" type="number" value={offlineAmount} onChange={(event) => setOfflineAmount(event.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="offline-notes">Note</Label>
              <Textarea id="offline-notes" value={offlineNotes} onChange={(event) => setOfflineNotes(event.target.value)} className="mt-1" placeholder="Bank deposit, cash at meeting..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfflineUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleOffline} disabled={!Number(offlineAmount) || createFee.isPending} className="bg-leo-primary text-white">
              Mark paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
