import { NextResponse } from "next/server"
import { createDonation } from "@/lib/firebase/firestore"

function getFiscalYear(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  // Fiscal year starts in July (7)
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      return NextResponse.json({ success: false, error: "NEXT_PUBLIC_APP_URL is not configured" }, { status: 500 })
    }

    const txRef = body.txRef || `LEO-${Date.now()}`

    // If this is a donation, create a pending donation record tied to the txRef.
    if (body.purpose === "donation") {
      const donorName = `${body.firstName ?? "Donor"}${body.lastName ? ` ${body.lastName}` : ""}`.trim()
      await createDonation({
        userId: body.userId,
        amount: Number(body.amount),
        donorName,
        donorEmail: body.email,
        message: body.message,
        txRef,
        currency: body.currency || "MWK",
        paymentStatus: "pending",
        fiscalYear: body.fiscalYear || getFiscalYear(),
      })
    }

    // Integrate with PayChangu API
    const payChanguResponse = await fetch("https://api.paychangu.com/payment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || "MWK",
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        callback_url: body.callbackUrl || `${appUrl}/api/payments/callback`,
        return_url:
          body.returnUrl || (body.purpose === "donation" ? `${appUrl}/donate/return?txRef=${txRef}` : `${appUrl}/portal/shop/orders`),
        tx_ref: txRef,
        customization: body.customization,
      }),
    })

    const data = await payChanguResponse.json()

    return NextResponse.json({
      success: true,
      checkoutUrl: data.link,
      transactionId: txRef,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate payment",
      },
      { status: 500 },
    )
  }
}
