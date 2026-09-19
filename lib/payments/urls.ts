import type { PaymentKind } from "@/lib/payments/types"

export function isLocalHostName(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
}

export function returnPathForKind(kind?: PaymentKind | string | null) {
  switch (kind) {
    case "donation":
      return "/donate/return"
    case "membership":
      return "/portal/membership/return"
    case "joining":
      return "/portal/join-fee/return"
    case "order":
      return "/shop/checkout/return"
    default:
      return "/portal/payments"
  }
}

export function originFromRequest(request: Request) {
  const url = new URL(request.url)
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "http"
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host
  return `${proto}://${host}`
}

function originIfUsable(value?: string | null, allowLocalhost = true) {
  if (!value) return ""
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`)
    if (!allowLocalhost && isLocalHostName(url.hostname)) return ""
    return url.origin
  } catch {
    return ""
  }
}

export function resolvePublicOrigin(request: Request, clientReturnUrl?: string) {
  const allowLocalhost = process.env.NODE_ENV !== "production"
  const fromClient = originIfUsable(clientReturnUrl, true)
  if (fromClient && (allowLocalhost || !isLocalHostName(new URL(fromClient).hostname))) {
    return fromClient
  }

  const fromRequest = originIfUsable(originFromRequest(request), true)
  if (fromRequest && (allowLocalhost || !isLocalHostName(new URL(fromRequest).hostname))) {
    return fromRequest
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  const fromVercel = originIfUsable(vercelHost, false)
  if (fromVercel) return fromVercel

  const fromEnv = originIfUsable(process.env.NEXT_PUBLIC_APP_URL, allowLocalhost)
  if (fromEnv) return fromEnv

  return fromClient || fromRequest || "http://localhost:3000"
}

export function absoluteUrl(pathOrUrl: string, origin: string) {
  try {
    return new URL(pathOrUrl).toString()
  } catch {
    return new URL(pathOrUrl, `${origin.replace(/\/$/, "")}/`).toString()
  }
}

export function withTxRef(base: string, txRef: string) {
  const url = new URL(base)
  if (!url.searchParams.get("txRef") && !url.searchParams.get("tx_ref")) {
    url.searchParams.set("txRef", txRef)
  }
  return url.toString()
}
