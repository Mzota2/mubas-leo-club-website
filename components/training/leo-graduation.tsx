"use client"

import { useEffect } from "react"

const BALLOONS = [
  { left: "8%", delay: "0s", duration: "7.5s", color: "#F59E0B" },
  { left: "18%", delay: "0.4s", duration: "8.2s", color: "#DC2626" },
  { left: "28%", delay: "1.1s", duration: "6.8s", color: "#FDE68A" },
  { left: "40%", delay: "0.2s", duration: "7.8s", color: "#FFFFFF" },
  { left: "52%", delay: "0.8s", duration: "8.6s", color: "#F59E0B" },
  { left: "63%", delay: "0.1s", duration: "7.1s", color: "#B91C1C" },
  { left: "74%", delay: "1.4s", duration: "8s", color: "#FDE68A" },
  { left: "86%", delay: "0.6s", duration: "7.4s", color: "#FFFFFF" },
  { left: "12%", delay: "1.8s", duration: "9s", color: "#FBBF24" },
  { left: "47%", delay: "2.1s", duration: "6.6s", color: "#DC2626" },
  { left: "69%", delay: "1.6s", duration: "8.4s", color: "#F59E0B" },
  { left: "91%", delay: "0.9s", duration: "7.9s", color: "#FDE68A" },
]

function LeoIllustration() {
  return (
    <svg viewBox="0 0 200 220" className="h-44 w-44 drop-shadow-xl sm:h-56 sm:w-56" aria-hidden="true">
      <ellipse cx="100" cy="200" rx="52" ry="10" fill="rgba(0,0,0,0.18)" />
      <circle cx="58" cy="88" r="22" fill="#C2410C" />
      <circle cx="142" cy="88" r="22" fill="#C2410C" />
      <circle cx="48" cy="118" r="18" fill="#EA580C" />
      <circle cx="152" cy="118" r="18" fill="#EA580C" />
      <circle cx="72" cy="58" r="18" fill="#EA580C" />
      <circle cx="128" cy="58" r="18" fill="#EA580C" />
      <circle cx="100" cy="48" r="20" fill="#C2410C" />
      <circle cx="100" cy="108" r="52" fill="#F59E0B" />
      <circle cx="82" cy="98" r="7" fill="#1C1917" />
      <circle cx="118" cy="98" r="7" fill="#1C1917" />
      <circle cx="84" cy="96" r="2" fill="#FFF7ED" />
      <circle cx="120" cy="96" r="2" fill="#FFF7ED" />
      <ellipse cx="100" cy="118" rx="10" ry="7" fill="#9A3412" />
      <path d="M90 128c6 8 14 8 20 0" fill="none" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 125v22" stroke="#9A3412" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 168c8 18 36 18 44 0" fill="#FBBF24" />
      <circle cx="70" cy="168" r="10" fill="#F59E0B" />
      <circle cx="130" cy="168" r="10" fill="#F59E0B" />
    </svg>
  )
}

export function LeoGraduation({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onFinished, 7200)
    return () => window.clearTimeout(timer)
  }, [onFinished])

  return (
    <div className="fixed inset-0 z-120 overflow-hidden bg-linear-to-b from-[#F59E0B] via-[#DC2626] to-[#7F1D1D] text-white">
      {BALLOONS.map((balloon, index) => (
        <span
          key={index}
          className="leo-balloon"
          style={{
            left: balloon.left,
            animationDelay: balloon.delay,
            animationDuration: balloon.duration,
            background: balloon.color,
          }}
        />
      ))}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="leo-pop">
          <LeoIllustration />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">New member program</p>
        <h1 className="mt-2 max-w-lg text-3xl font-semibold sm:text-5xl">Congratulations on becoming a Leo</h1>
        <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
          You passed every published module. Welcome to the club — taking you to your portal home.
        </p>
      </div>
    </div>
  )
}
