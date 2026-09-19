"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreateSpecialOffer,
  useDeleteSpecialOffer,
  useSpecialOffers,
  useUpdateSpecialOffer,
} from "@/lib/hooks/use-special-offers"
import type { SpecialOffer } from "@/lib/types"
import { Gift, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/empty-state"
import { formatMoney } from "@/lib/utils/format"

const emptyForm = {
  title: "",
  tagline: "",
  description: "",
  image: "",
  price: "",
  isActive: true,
}

export default function AdminSpecialOffersPage() {
  const { data: offers, isLoading } = useSpecialOffers(false)
  const createOffer = useCreateSpecialOffer()
  const updateOffer = useUpdateSpecialOffer()
  const deleteOffer = useDeleteSpecialOffer()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formValues, setFormValues] = useState(emptyForm)

  const openCreate = () => {
    setSelectedOffer(null)
    setFormValues(emptyForm)
    setIsFormOpen(true)
  }

  const openEdit = (offer: SpecialOffer) => {
    setSelectedOffer(offer)
    setFormValues({
      title: offer.title,
      tagline: offer.tagline ?? "",
      description: offer.description,
      image: offer.image,
      price: String(offer.price),
      isActive: offer.isActive,
    })
    setIsFormOpen(true)
  }

  const openDelete = (offer: SpecialOffer) => {
    setSelectedOffer(offer)
    setIsDeleteOpen(true)
  }

  const isBusy = createOffer.isPending || updateOffer.isPending || deleteOffer.isPending || uploading
  const priceValue = Number(formValues.price)
  const canSubmit = useMemo(() => {
    return formValues.title.trim() && formValues.description.trim() && formValues.image.trim() && priceValue > 0
  }, [formValues.description, formValues.image, formValues.title, priceValue])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("folder", "leo-club/offers")
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const json = await res.json()
      const url = json?.data?.secure_url || json?.data?.url
      if (url) setFormValues((values) => ({ ...values, image: url }))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    const payload = {
      title: formValues.title.trim(),
      tagline: formValues.tagline.trim() || undefined,
      description: formValues.description.trim(),
      image: formValues.image.trim(),
      price: Math.round(priceValue),
      isActive: formValues.isActive,
      createdAt: selectedOffer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (selectedOffer) {
      await updateOffer.mutateAsync({ offerId: selectedOffer.id, data: payload })
    } else {
      await createOffer.mutateAsync(payload)
    }

    setIsFormOpen(false)
    setSelectedOffer(null)
  }

  const handleDelete = async () => {
    if (!selectedOffer) return
    await deleteOffer.mutateAsync(selectedOffer.id)
    setIsDeleteOpen(false)
    setSelectedOffer(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Special offers"
        description="Create buyable campaigns for the shop carousel, such as Valentine gifts. Guests can purchase them without an account."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add offer
          </Button>
        }
      />

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Shop carousel</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-[260px] w-full" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ) : (offers ?? []).length === 0 ? (
            <AdminEmptyState
              icon={Gift}
              title="No special offers yet"
              description="Add a campaign with a photo, price, and short tagline. Active offers appear in the shop carousel."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(offers ?? []).map((offer) => (
                <Card key={offer.id} className="overflow-hidden rounded-md">
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {offer.image ? (
                      <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {offer.tagline ? <p className="text-xs font-medium text-leo-primary">{offer.tagline}</p> : null}
                        <p className="truncate font-semibold">{offer.title}</p>
                        <p className="text-sm text-gray-600">{formatMoney(offer.price)}</p>
                      </div>
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-600">{offer.description}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(offer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDelete(offer)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{selectedOffer ? "Edit special offer" : "Add special offer"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isBusy}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleUpload(file)
                  }}
                />
                <Button type="button" variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Cloudinary
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formValues.image}
                onChange={(event) => setFormValues((values) => ({ ...values, image: event.target.value }))}
                disabled={isBusy}
              />
            </div>

            {formValues.image ? (
              <div className="relative aspect-video overflow-hidden rounded-md bg-gray-100">
                <Image src={formValues.image} alt="Preview" fill className="object-cover" />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="Valentine's gifts"
                value={formValues.tagline}
                onChange={(event) => setFormValues((values) => ({ ...values, tagline: event.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Rose mug & card set"
                value={formValues.title}
                onChange={(event) => setFormValues((values) => ({ ...values, title: event.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(event) => setFormValues((values) => ({ ...values, description: event.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (MWK)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formValues.price}
                onChange={(event) => setFormValues((values) => ({ ...values, price: event.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="isActive">Show in shop carousel</Label>
              <Switch
                id="isActive"
                checked={formValues.isActive}
                onCheckedChange={(checked) => setFormValues((values) => ({ ...values, isActive: checked }))}
                disabled={isBusy}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-leo-primary text-white hover:bg-leo-primary-dark"
              onClick={handleSubmit}
              disabled={isBusy || !canSubmit}
            >
              {selectedOffer ? "Save changes" : "Publish offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete special offer</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the offer from the shop carousel. Existing carts that already added it can still check out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
