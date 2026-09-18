import { cn } from "@/lib/utils"
import type { ShopProduct } from "@/lib/shop/catalog"

export function ProductArt({
  product,
  className,
  selected = false,
}: {
  product: ShopProduct
  className?: string
  selected?: boolean
}) {
  const src = product.images[0]

  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-white", className)}
      style={src ? undefined : { backgroundColor: product.surface }}
    >
      {src ? (
        <img src={src} alt={product.name} className="h-full w-full object-contain p-1.5" />
      ) : (
        <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
          {product.category === "tshirt" || product.category === "golfshirt" ? (
            <ShirtShape color={product.accent} collared={product.category === "golfshirt"} />
          ) : null}
          {product.category === "cap" ? <CapShape color={product.accent} /> : null}
          {product.category === "mug" ? <MugShape color={product.accent} /> : null}
          {product.category === "calendar" ? <CalendarShape color={product.accent} /> : null}
        </svg>
      )}
      {selected ? (
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          ✓
        </span>
      ) : null}
    </div>
  )
}

function ShirtShape({ color, collared }: { color: string; collared: boolean }) {
  return (
    <>
      <path
        fill={color}
        d="M24 34 L46 22 L52 32 L68 32 L74 22 L96 34 L88 48 L88 102 H32 L32 48 Z"
      />
      {collared ? (
        <path fill="#f59e0b" opacity="0.9" d="M52 32 L60 42 L68 32 Z" />
      ) : (
        <circle cx="60" cy="52" r="7" fill="#f59e0b" opacity="0.85" />
      )}
    </>
  )
}

function CapShape({ color }: { color: string }) {
  return (
    <>
      <path fill={color} d="M28 70 Q60 28 92 70 L92 78 Q60 70 28 78 Z" />
      <path fill={color} d="M22 78 Q60 68 108 82 L100 90 Q60 78 26 86 Z" />
    </>
  )
}

function MugShape({ color }: { color: string }) {
  return (
    <>
      <rect x="34" y="32" width="48" height="58" rx="6" fill={color} />
      <path d="M82 42 H94 A12 12 0 0 1 94 70 H82" fill="none" stroke={color} strokeWidth="8" />
      <rect x="42" y="44" width="22" height="6" rx="2" fill="#f59e0b" />
    </>
  )
}

function CalendarShape({ color }: { color: string }) {
  return (
    <>
      <rect x="28" y="30" width="64" height="64" rx="6" fill="#fff" />
      <rect x="28" y="30" width="64" height="16" fill={color} />
      <rect x="38" y="54" width="12" height="10" rx="1" fill={color} opacity="0.8" />
      <rect x="54" y="54" width="12" height="10" rx="1" fill={color} opacity="0.45" />
      <rect x="70" y="54" width="12" height="10" rx="1" fill={color} opacity="0.8" />
      <rect x="38" y="70" width="12" height="10" rx="1" fill={color} opacity="0.45" />
      <rect x="54" y="70" width="12" height="10" rx="1" fill={color} opacity="0.8" />
    </>
  )
}
