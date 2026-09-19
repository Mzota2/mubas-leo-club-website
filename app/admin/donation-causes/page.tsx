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
import { Plus, Edit, Trash2, Target, TrendingUp, CheckCircle2, Upload } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminStatCard } from "@/components/admin/stat-card"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { formatMoney } from "@/lib/utils/format"
import { causeImage, hasEventPoster } from "@/lib/content/defaults"
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    image: "",
    targetAmount: "",
    isActive: true,
  })

  const isBusy = createCause.isPending || updateCause.isPending || uploading

  const handleOpenForm = (cause?: DonationCause) => {
    setUploadError("")
    if (cause) {
      setSelectedCause(cause)
      setFormValues({
        title: cause.title,
        description: cause.description,
        image: cause.image || "",
        targetAmount: cause.targetAmount?.toString() || "",
        isActive: cause.isActive,
      })
    } else {
      setSelectedCause(null)
      setFormValues({
        title: "",
        description: "",
        image: "",
        targetAmount: "",
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const handleUploadPoster = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("folder", "leo-club/causes")
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const json = await res.json().catch(() => null)
      const url = json?.data?.secure_url || json?.data?.url
      if (!res.ok || !url) {
        setUploadError(json?.error || "Poster upload failed. Try again or paste an image URL.")
        return
      }
      setFormValues((values) => ({ ...values, image: url }))
    } catch {
      setUploadError("Poster upload failed. Try again or paste an image URL.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formValues.title.trim() || !formValues.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    if (!hasEventPoster(formValues.image)) {
      setUploadError("Please upload a poster for this cause.")
      toast({
        title: "Poster required",
        description: "Each donation cause needs a poster.",
        variant: "destructive",
      })
      return
    }

    try {
      const causeData = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        image: formValues.image.trim(),
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
        await createCause.mutateAsync({
          ...causeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
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
                {activeCauses.map((cause) => {
                  const poster = causeImage(cause)
                  return (
                    <Card key={cause.id} className="overflow-hidden rounded-md hover:shadow-lg transition-shadow">
                      {poster ? <img src={poster} alt="" className="h-40 w-full object-cover" /> : null}
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
                          <Button variant="outline" size="sm" onClick={() => handleOpenForm(cause)}>
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
                  )
                })}
              </div>
            </div>
          )}

          {inactiveCauses.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Inactive Causes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {inactiveCauses.map((cause) => {
                  const poster = causeImage(cause)
                  return (
                    <Card key={cause.id} className="overflow-hidden rounded-md opacity-75">
                      {poster ? <img src={poster} alt="" className="h-40 w-full object-cover" /> : null}
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{cause.title}</CardTitle>
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{cause.description}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenForm(cause)}>
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
                  )
                })}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="poster">Cause poster *</Label>
              <label
                htmlFor="poster"
                className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-dashed border-border bg-neutral-50 transition hover:border-leo-primary/50"
              >
                {hasEventPoster(formValues.image) ? (
                  <img src={formValues.image} alt="Cause poster preview" className="max-h-56 w-full bg-neutral-100 object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    {uploading ? "Uploading poster..." : "Click to upload the cause poster"}
                  </span>
                )}
              </label>
              <Input
                id="poster"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleUploadPoster(file)
                }}
              />
              {uploadError ? <p className="text-xs text-rose-600">{uploadError}</p> : null}
              <Input
                id="image"
                placeholder="Or paste a poster image URL"
                value={formValues.image}
                onChange={(e) => {
                  setUploadError("")
                  setFormValues({ ...formValues, image: e.target.value })
                }}
                disabled={isBusy}
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
                disabled={isBusy}
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
                disabled={isBusy}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-leo-primary hover:bg-leo-primary-dark"
              disabled={isBusy || !hasEventPoster(formValues.image)}
            >
              {uploading ? "Uploading..." : selectedCause ? "Update" : "Create"}
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
