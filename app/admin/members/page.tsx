"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers, useUpdateUser } from "@/lib/hooks/use-users"
import type { User } from "@/lib/types"

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: users, isLoading } = useUsers()
  const updateUser = useUpdateUser()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editValues, setEditValues] = useState({
    role: "member" as User["role"],
    membershipStatus: "active" as NonNullable<User["membershipStatus"]>,
    position: "" as string,
    leoId: "" as string,
  })

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const list = users ?? []
    if (!query) return list

    return list.filter((u) => {
      const fullName = `${u.firstName ?? ""} ${u.middleName ?? ""} ${u.lastName ?? ""}`.toLowerCase()
      return (
        u.email?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        (u.leoId ?? "").toLowerCase().includes(query)
      )
    })
  }, [users, searchQuery])

  const openEdit = (user: User) => {
    setSelectedUser(user)
    setEditValues({
      role: user.role ?? "member",
      membershipStatus: user.membershipStatus ?? "active",
      position: user.position ?? "",
      leoId: user.leoId ?? "",
    })
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    if (!selectedUser) return
    await updateUser.mutateAsync({
      userId: selectedUser.id,
      data: {
        role: editValues.role,
        membershipStatus: editValues.membershipStatus,
        position: editValues.position || undefined,
        leoId: editValues.leoId || undefined,
      },
    })
    setIsEditOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Members Management</h1>
          <p className="text-gray-600">Manage club members and their information</p>
        </div>
        <Button className="bg-leo-primary hover:bg-leo-primary-dark text-white">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Members ({isLoading ? "..." : filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leo ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-gray-600">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.leoId ?? "-"}</TableCell>
                    <TableCell>
                      {member.firstName} {member.middleName ? `${member.middleName} ` : ""}
                      {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.position ?? "-"}</TableCell>
                    <TableCell>
                      <Badge className={(member.membershipStatus ?? "active") === "active" ? "bg-green-500" : "bg-gray-500"}>
                        {member.membershipStatus ?? "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.joinedDate ?? member.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {selectedUser.firstName} {selectedUser.middleName ? `${selectedUser.middleName} ` : ""}
                  {selectedUser.lastName}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={editValues.role}
                  onValueChange={(value) => setEditValues((v) => ({ ...v, role: value as User["role"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editValues.membershipStatus}
                  onValueChange={(value) =>
                    setEditValues((v) => ({ ...v, membershipStatus: value as NonNullable<User["membershipStatus"]> }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="leoId">Leo ID</Label>
                  <Input
                    id="leoId"
                    value={editValues.leoId}
                    onChange={(e) => setEditValues((v) => ({ ...v, leoId: e.target.value }))}
                    disabled={updateUser.isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editValues.position}
                    onChange={(e) => setEditValues((v) => ({ ...v, position: e.target.value }))}
                    disabled={updateUser.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-leo-primary hover:bg-leo-primary-dark text-white"
              onClick={handleSave}
              disabled={updateUser.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
