"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useGalleryImages } from "@/lib/hooks/use-gallery"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const { data: images, isLoading } = useGalleryImages()

  return (
    <div className="py-10 md:py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing moments of service, leadership, and community impact
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-[260px] w-full" />
              <Skeleton className="h-[260px] w-full" />
              <Skeleton className="h-[260px] w-full" />
            </>
          ) : (images ?? []).length === 0 ? (
            <p className="text-sm text-gray-600">No gallery images yet.</p>
          ) : (
            (images ?? []).map((image, index) => (
              <Card
                key={image.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(index)}
              >
                <div className="relative aspect-video bg-gray-100">
                  <Image src={image.url} alt={image.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{image.title}</h3>
                  {image.description ? <p className="text-sm text-gray-600">{image.description}</p> : null}
                </div>
              </Card>
            ))
          )}
        </div>

        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-[calc(100%-1.5rem)] p-0 sm:max-w-4xl">
            {selectedImage !== null && (
              <div className="relative">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="relative aspect-video bg-gray-100">
                  <Image src={(images ?? [])[selectedImage]?.url || "/placeholder-logo.png"} alt={(images ?? [])[selectedImage]?.title || "Gallery image"} fill className="object-contain bg-black" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{(images ?? [])[selectedImage]?.title}</h3>
                  {(images ?? [])[selectedImage]?.description ? <p className="text-gray-600">{(images ?? [])[selectedImage]?.description}</p> : null}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
