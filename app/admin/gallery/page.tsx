"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useAuth } from "@/lib/hooks/use-auth"
import { useCreateGalleryImage, useDeleteGalleryImage, useGalleryImages, useUpdateGalleryImage } from "@/lib/hooks/use-gallery"
import type { GalleryImage } from "@/lib/types"
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/page-header"
import { AdminEmptyState } from "@/components/admin/empty-state"

export default function AdminGalleryPage() {
  const { firebaseUser } = useAuth()
  const { data: images, isLoading } = useGalleryImages()
  const createImage = useCreateGalleryImage()
  const updateImage = useUpdateGalleryImage()
  const deleteImage = useDeleteGalleryImage()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const [formValues, setFormValues] = useState({
    url: "",
    title: "",
    description: "",
    eventId: "",
  })

  const openCreate = () => {
    setSelectedImage(null)
    setFormValues({ url: "", title: "", description: "", eventId: "" })
    setIsFormOpen(true)
  }

  const openEdit = (img: GalleryImage) => {
    setSelectedImage(img)
    setFormValues({
      url: img.url,
      title: img.title,
      description: img.description ?? "",
      eventId: img.eventId ?? "",
    })
    setIsFormOpen(true)
  }

  const openDelete = (img: GalleryImage) => {
    setSelectedImage(img)
    setIsDeleteOpen(true)
  }

  const isBusy = createImage.isPending || updateImage.isPending || deleteImage.isPending

  const canSubmit = useMemo(() => {
    return formValues.url.trim() && formValues.title.trim()
  }, [formValues.url, formValues.title])

  const handleSubmit = async () => {
    if (!canSubmit) return
    const uploadedBy = firebaseUser?.uid || "system"

    if (selectedImage) {
      await updateImage.mutateAsync({
        imageId: selectedImage.id,
        data: {
          url: formValues.url.trim(),
          title: formValues.title.trim(),
          description: formValues.description.trim() || undefined,
          eventId: formValues.eventId.trim() || undefined,
        },
      })
    } else {
      await createImage.mutateAsync({
        url: formValues.url.trim(),
        title: formValues.title.trim(),
        description: formValues.description.trim() || undefined,
        eventId: formValues.eventId.trim() || undefined,
        uploadedBy,
        createdAt: new Date().toISOString(),
      })
    }

    setIsFormOpen(false)
    setSelectedImage(null)
  }

  const handleDelete = async () => {
    if (!selectedImage) return
    await deleteImage.mutateAsync(selectedImage.id)
    setIsDeleteOpen(false)
    setSelectedImage(null)
  }

  const handleUpload = async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    form.append("folder", "leo-club/gallery")

    const res = await fetch("/api/upload", { method: "POST", body: form })
    const json = await res.json()

    const url = json?.data?.secure_url || json?.data?.url
    if (url) {
      setFormValues((v) => ({ ...v, url }))
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gallery"
        description="Upload and manage photos shown on the public gallery."
        actions={
          <Button className="bg-leo-primary text-white hover:bg-leo-primary-dark" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add image
          </Button>
        }
      />

      <Card className="rounded-md border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All images</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[260px] w-full" />
              <Skeleton className="h-[260px] w-full" />
              <Skeleton className="h-[260px] w-full" />
            </div>
          ) : (images ?? []).length === 0 ? (
            <AdminEmptyState icon={ImageIcon} title="No gallery images yet" description="Add photos from club events and community service." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(images ?? []).map((img) => (
                <Card key={img.id} className="overflow-hidden rounded-md">
                  <div className="relative aspect-video bg-gray-100">
                    <Image src={img.url} alt={img.title} fill className="object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{img.title}</p>
                        {img.description ? <p className="text-sm text-gray-600 line-clamp-2">{img.description}</p> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEdit(img)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openDelete(img)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {img.eventId ? <p className="text-xs text-gray-500">Event: {img.eventId}</p> : null}
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
            <DialogTitle>{selectedImage ? "Edit Image" : "Add Image"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Upload</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={isBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleUpload(file)
                  }}
                />
                <Button type="button" variant="outline" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Cloudinary
                </Button>
              </div>
              <p className="text-xs text-gray-500">Or paste a URL below.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                value={formValues.url}
                onChange={(e) => setFormValues((v) => ({ ...v, url: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            {formValues.url ? (
              <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                <Image src={formValues.url} alt="Preview" fill className="object-contain bg-black" />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(e) => setFormValues((v) => ({ ...v, title: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eventId">Event ID (optional)</Label>
              <Input
                id="eventId"
                value={formValues.eventId}
                onChange={(e) => setFormValues((v) => ({ ...v, eventId: e.target.value }))}
                disabled={isBusy}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-leo-primary hover:bg-leo-primary-dark text-white"
              onClick={handleSubmit}
              disabled={isBusy || !canSubmit}
            >
              {selectedImage ? "Save Changes" : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the image.</AlertDialogDescription>
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
