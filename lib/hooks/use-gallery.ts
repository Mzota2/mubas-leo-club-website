"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } from "@/lib/firebase/firestore"
import type { GalleryImage } from "@/lib/types"

export function useGalleryImages(eventId?: string) {
  return useQuery({
    queryKey: ["gallery", eventId],
    queryFn: () => getGalleryImages(eventId),
  })
}

export function useCreateGalleryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] })
    },
  })
}

export function useUpdateGalleryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId, data }: { imageId: string; data: Partial<GalleryImage> }) =>
      updateGalleryImage(imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] })
    },
  })
}

export function useDeleteGalleryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] })
    },
  })
}
