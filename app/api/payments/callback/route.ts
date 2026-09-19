import { NextResponse } from "next/server"
import { getReceiptForTxRef, verifyAndSettle } from "@/lib/payments/settle"
import { isLocalHostName, originFromRequest, returnPathForKind, withTxRef } from "@/lib/payments/urls"

function txRefFrom(body: Record<string, unknown>, searchParams?: URLSearchParams) {
  return (
    (typeof body.tx_ref === "string" && body.tx_ref) ||
    (typeof body.txRef === "string" && body.txRef) ||
    (typeof body.transactionId === "string" && body.transactionId) ||
    searchParams?.get("tx_ref") ||
    searchParams?.get("txRef") ||
    searchParams?.get("transactionId")
  )
}

function redirectOrigin(request: Request) {
  const url = new URL(request.url)
  if (isLocalHostName(url.hostname) && !url.port) {
    const env = process.env.NEXT_PUBLIC_APP_URL
    if (env) {
      try {
        return new URL(env).origin
      } catch {
        // keep request origin
      }
    }
    return "http://localhost:3000"
  }
  return originFromRequest(request)
}

async function resultUrl(request: Request, txRef?: string | null, purpose?: string | null) {
  const origin = redirectOrigin(request)
  if (!txRef) return new URL("/", origin)

  let kind = purpose || null
  if (!kind) {
    try {
      const receipt = await getReceiptForTxRef(txRef)
      kind = receipt?.kind || null
    } catch {
      // Still send the customer to a result screen.
    }
  }

  return new URL(withTxRef(`${origin}${returnPathForKind(kind)}`, txRef))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const txRef = txRefFrom(body)
    if (!txRef) return NextResponse.json({ success: false, error: "Missing transaction reference" }, { status: 400 })
    await verifyAndSettle(txRef)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txRef = txRefFrom({}, searchParams)
  const purpose = searchParams.get("purpose")
  return NextResponse.redirect(await resultUrl(request, txRef, purpose), 303)
}
