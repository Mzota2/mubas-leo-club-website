import { NextResponse } from "next/server"
import { verifyAndSettle } from "@/lib/payments/settle"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId") || searchParams.get("tx_ref") || searchParams.get("txRef")

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const result = await verifyAndSettle(transactionId)

    return NextResponse.json({
      success: result.success,
      status: result.success ? "success" : result.data?.status || "failed",
      amount: result.data?.data?.amount ?? result.data?.amount ?? result.receipt?.amount,
      receipt: result.receipt,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
