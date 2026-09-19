"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const FRAME = 280
const OUTPUT = 720

function coverScale(width: number, height: number, frame = FRAME) {
  if (!width || !height) return 1
  return Math.max(frame / width, frame / height)
}

function clampOffset(offset: { x: number; y: number }, width: number, height: number, zoom: number) {
  const displayScale = coverScale(width, height) * zoom
  const displayedW = width * displayScale
  const displayedH = height * displayScale
  const limitX = Math.max(0, (displayedW - FRAME) / 2)
  const limitY = Math.max(0, (displayedH - FRAME) / 2)
  return {
    x: Math.min(limitX, Math.max(-limitX, offset.x)),
    y: Math.min(limitY, Math.max(-limitY, offset.y)),
  }
}

export function ProfilePhotoCropper({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
  isSaving,
}: {
  open: boolean
  imageSrc: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: (file: File) => Promise<void> | void
  isSaving?: boolean
}) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!open) return
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [open, imageSrc])

  const handleConfirm = async () => {
    const image = imageRef.current
    if (!image || !natural.width) return

    const displayScale = coverScale(natural.width, natural.height) * zoom
    const displayedW = natural.width * displayScale
    const displayedH = natural.height * displayScale
    const imageLeft = (FRAME - displayedW) / 2 + offset.x
    const imageTop = (FRAME - displayedH) / 2 + offset.y
    const sx = Math.max(0, -imageLeft / displayScale)
    const sy = Math.max(0, -imageTop / displayScale)
    const sw = Math.min(natural.width - sx, FRAME / displayScale)
    const sh = Math.min(natural.height - sy, FRAME / displayScale)

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const context = canvas.getContext("2d")
    if (!context) return
    context.imageSmoothingQuality = "high"
    context.drawImage(image, sx, sy, sw, sh, 0, 0, OUTPUT, OUTPUT)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92))
    if (!blob) return
    await onConfirm(new File([blob], "profile.jpg", { type: "image/jpeg" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop profile photo</DialogTitle>
          <DialogDescription>Drag to choose the best square. Zoom until the face fills the frame.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="relative mx-auto cursor-move overflow-hidden rounded-md bg-neutral-900 touch-none"
            style={{ width: FRAME, height: FRAME }}
            onPointerDown={(event) => {
              dragging.current = true
              lastPointer.current = { x: event.clientX, y: event.clientY }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!dragging.current) return
              const dx = event.clientX - lastPointer.current.x
              const dy = event.clientY - lastPointer.current.y
              lastPointer.current = { x: event.clientX, y: event.clientY }
              setOffset((current) => clampOffset({ x: current.x + dx, y: current.y + dy }, natural.width, natural.height, zoom))
            }}
            onPointerUp={() => {
              dragging.current = false
            }}
            onPointerCancel={() => {
              dragging.current = false
            }}
          >
            {imageSrc ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                className="absolute max-w-none select-none"
                style={{
                  width: natural.width * coverScale(natural.width, natural.height) * zoom,
                  height: natural.height * coverScale(natural.width, natural.height) * zoom,
                  left: (FRAME - natural.width * coverScale(natural.width, natural.height) * zoom) / 2 + offset.x,
                  top: (FRAME - natural.height * coverScale(natural.width, natural.height) * zoom) / 2 + offset.y,
                }}
                onLoad={(event) => {
                  setNatural({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                  setOffset({ x: 0, y: 0 })
                  setZoom(1)
                }}
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-white/80 ring-inset" />
          </div>

          <div>
            <Label htmlFor="photo-zoom">Zoom</Label>
            <Slider
              id="photo-zoom"
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={(value) => {
                const nextZoom = value[0] ?? 1
                setZoom(nextZoom)
                setOffset((current) => clampOffset(current, natural.width, natural.height, nextZoom))
              }}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-md" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-md bg-[#F59E0B] text-white hover:bg-[#D97706]"
            onClick={() => void handleConfirm()}
            disabled={isSaving || !imageSrc}
          >
            {isSaving ? "Saving..." : "Use photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
