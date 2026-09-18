"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { portalCanvasMuted, portalCanvasTitle } from "@/components/portal/styles"
import type { PromoSlide } from "@/lib/media"
import { cn } from "@/lib/utils"

export function PromoCarousel({ slides }: { slides: PromoSlide[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [index, setIndex] = useState(0)
  const current = slides[index] ?? slides[0]

  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (!api || slides.length < 2) return
    const timer = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [api, slides.length])

  if (!current) return null

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-medium ${portalCanvasTitle}`}>{current.title}</h2>
        <Link href={current.href} className={`text-sm ${portalCanvasMuted}`}>
          See all
        </Link>
      </div>

      <Carousel opts={{ loop: true, align: "start" }} setApi={setApi} className="w-full">
        <CarouselContent className="-ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <Link href={slide.href} className="block overflow-hidden rounded-md bg-white">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-[26rem] w-full object-cover sm:h-[30rem] lg:h-[36rem]"
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center gap-1.5 pt-1">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.title}`}
            onClick={() => api?.scrollTo(slideIndex)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              slideIndex === index
                ? "w-4 bg-white lg:bg-leo-primary"
                : "w-1.5 bg-white/40 lg:bg-neutral-300",
            )}
          />
        ))}
      </div>
    </section>
  )
}
