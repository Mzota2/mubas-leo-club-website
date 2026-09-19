"use client"

import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { causeImage } from "@/lib/content/defaults"
import { formatMoney } from "@/lib/utils/format"
import type { DonationCause } from "@/lib/types"

function progressPercent(cause: DonationCause) {
  if (!cause.targetAmount) return null
  return Math.min(Math.round((cause.currentAmount / cause.targetAmount) * 100), 100)
}

export function HeroCauseAds({ causes }: { causes: DonationCause[] }) {
  if (causes.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full z-30 -translate-y-1/2">
      <div className="pointer-events-auto mx-auto w-full max-w-5xl">
        <div className="mb-2 flex items-center justify-center gap-2 px-4">
          <span className="h-px w-8 bg-white/80" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            Support a cause
          </p>
          <span className="h-px w-8 bg-white/80" />
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1.5 scrollbar-none sm:justify-center sm:snap-none">
          {causes.map((cause) => {
            const percent = progressPercent(cause)
            const poster = causeImage(cause)
            return (
              <Link
                key={cause.id}
                href={`/donate?cause=${cause.id}`}
                className="group flex w-[min(100%,19rem)] max-w-full shrink-0 snap-center overflow-hidden rounded-md bg-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] ring-2 ring-[#F59E0B] transition hover:-translate-y-0.5 sm:max-w-md sm:flex-1 sm:snap-align-none"
              >
                {poster ? (
                  <img src={poster} alt="" className="h-16 w-16 shrink-0 object-cover sm:h-20 sm:w-20 md:h-24 md:w-24" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#F59E0B] text-white sm:h-20 sm:w-20 md:h-24 md:w-24">
                    <Heart className="h-6 w-6 fill-current" />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-2.5 py-2 sm:gap-1.5 sm:px-3 sm:py-2.5">
                  <span className="truncate text-sm font-bold leading-tight text-neutral-900 sm:text-base">{cause.title}</span>
                  {percent === null ? (
                    <span className="truncate text-[11px] text-neutral-600 sm:text-xs">Donate to this campaign</span>
                  ) : (
                    <span className="block">
                      <span className="mb-1 flex items-center justify-between text-[10px] font-medium text-neutral-600 sm:text-[11px]">
                        <span>{percent}% raised</span>
                        <span>{formatMoney(cause.currentAmount)}</span>
                      </span>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-neutral-200">
                        <span className="block h-full rounded-full bg-[#F59E0B]" style={{ width: `${percent}%` }} />
                      </span>
                    </span>
                  )}
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-md bg-leo-primary px-2 py-1 text-[11px] font-semibold text-white transition group-hover:bg-[#B45309] sm:px-2.5 sm:text-xs">
                    Donate now
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
