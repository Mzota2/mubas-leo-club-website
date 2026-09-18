"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDonationCauses, useCreateDonationCause, useUpdateDonationCause, useDeleteDonationCause } from "@/lib/hooks/use-donation-causes"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Target, TrendingUp, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { formatMoney } from "@/lib/utils/format"
import type { DonationCause } from "@/lib/types"

export default function DonationCausesPage() {
  const { data: causes, isLoading } = useDonationCauses(false)
  const createCause = useCreateDonationCause()
  const updateCause = useUpdateDonationCause()
  const deleteCause = useDeleteDonationCause()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCause, setSelectedCause] = useState<DonationCause | null>(null)
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    targetAmount: "",
    isActive: true,
  })

  const handleOpenForm = (cause?: DonationCause) => {
    if (cause) {
      setSelectedCause(cause)
      setFormValues({
        title: cause.title,
        description: cause.description,
        targetAmount: cause.targetAmount?.toString() || "",
        isActive: cause.isActive,
      })
    } else {
      setSelectedCause(null)
      setFormValues({
        title: "",
        description: "",
        targetAmount: "",
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!formValues.title || !formValues.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const causeData = {
        title: formValues.title,
        description: formValues.description,
        targetAmount: formValues.targetAmount ? parseFloat(formValues.targetAmount) : undefined,
        currentAmount: selectedCause?.currentAmount || 0,
        isActive: formValues.isActive,
      }

      if (selectedCause) {
        await updateCause.mutateAsync({ causeId: selectedCause.id, data: causeData })
        toast({
          title: "Success",
          description: "Donation cause updated successfully",
        })
      } else {
        await createCause.mutateAsync(causeData as any)
        toast({
          title: "Success",
          description: "Donation cause created successfully",
        })
      }
      setIsFormOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save donation cause",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedCause) return

    try {
      await deleteCause.mutateAsync(selectedCause.id)
      toast({
        title: "Success",
        description: "Donation cause deleted successfully",
      })
      setIsDeleteOpen(false)
      setSelectedCause(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete donation cause",
        variant: "destructive",
      })
    }
  }

  const activeCauses = causes?.filter((c) => c.isActive) || []
  const inactiveCauses = causes?.filter((c) => !c.isActive) || []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Donation causes"
        description="Create and manage the causes donors can support."
        actions={
          <Button onClick={() => handleOpenForm()} className="bg-leo-primary hover:bg-leo-primary-dark">
            <Plus className="h-4 w-4" />
            New cause
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard title="Total causes" value={causes?.length || 0} icon={Target} accent="orange" loading={isLoading} />
        <AdminStatCard title="Active causes" value={activeCauses.length} icon={CheckCircle2} accent="green" loading={isLoading} />
        <AdminStatCard
          title="Total raised"
          value={formatMoney(causes?.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0) || 0)}
          icon={TrendingUp}
          accent="blue"
          loading={isLoading}
        />
      </div>

      {/* Active Causes */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {activeCauses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Active Causes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {activeCauses.map((cause) => (
                  <Card key={cause.id} className="rounded-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{cause.title}</CardTitle>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{cause.description}</p>
                      {cause.targetAmount ? (
                        <div className="mb-4">
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round((cause.currentAmount / cause.targetAmount) * 100)}%</span>
                          </div>
                          <Progress
                            value={Math.min((cause.currentAmount / cause.targetAmount) * 100, 100)}
                            className="h-2 bg-neutral-200 [&>[data-slot=progress-indicator]]:bg-leo-primary"
                          />
                          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                            <span>{formatMoney(cause.currentAmount)}</span>
                            <span>{formatMoney(cause.targetAmount)}</span>
                          </div>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(cause)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCause(cause)
                            setIsDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Causes */}
          {inactiveCauses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Inactive Causes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {inactiveCauses.map((cause) => (
                  <Card key={cause.id} className="rounded-md opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{cause.title}</CardTitle>
                        <Badge variant="secondary">Inactive</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{cause.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenForm(cause)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCause(cause)
                            setIsDeleteOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {causes && causes.length === 0 && (
            <AdminEmptyState
              icon={Target}
              title="No donation causes yet"
              description="Create your first cause to start receiving donations."
              action={
                <Button onClick={() => handleOpenForm()} className="bg-leo-primary hover:bg-leo-primary-dark">
                  <Plus className="h-4 w-4" />
                  Create cause
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCause ? "Edit Donation Cause" : "Create Donation Cause"}</DialogTitle>
            <DialogDescription>
              {selectedCause ? "Update the donation cause details" : "Create a new cause for donors to support"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                placeholder="e.g., Blood Donation Drive"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                placeholder="Describe what this cause supports..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="targetAmount">Target Amount (MWK) - Optional</Label>
              <Input
                id="targetAmount"
                type="number"
                value={formValues.targetAmount}
                onChange={(e) => setFormValues({ ...formValues, targetAmount: e.target.value })}
                placeholder="e.g., 500000"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Show this cause to donors</p>
              </div>
              <Switch
                checked={formValues.isActive}
                onCheckedChange={(checked) => setFormValues({ ...formValues, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-leo-primary hover:bg-leo-primary-dark"
              disabled={createCause.isPending || updateCause.isPending}
            >
              {selectedCause ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Donation Cause</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCause?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCause.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
