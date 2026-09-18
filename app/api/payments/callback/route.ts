import { NextResponse } from "next/server"
import { verifyAndSettle } from "@/lib/payments/settle"

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
  try {
    const { searchParams } = new URL(request.url)
    const txRef = txRefFrom({}, searchParams)
    if (txRef) await verifyAndSettle(txRef)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
