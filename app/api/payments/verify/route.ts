import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    // Verify payment with PayChangu API
    const payChanguResponse = await fetch(`https://api.paychangu.com/verify-payment/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
    })

    const data = await payChanguResponse.json()

    return NextResponse.json({
      success: data.status === "success",
      status: data.status,
      amount: data.amount,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
