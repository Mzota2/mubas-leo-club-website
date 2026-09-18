import { NextResponse } from "next/server"
import { createDonation, createMembershipFee } from "@/lib/firebase/firestore"

function getFiscalYear(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      return NextResponse.json({ success: false, error: "NEXT_PUBLIC_APP_URL is not configured" }, { status: 500 })
    }

    const paychanguKey = process.env.PAYCHANGU_SECRET_KEY
    if (!paychanguKey) {
      return NextResponse.json({ success: false, error: "PAYCHANGU_SECRET_KEY is not configured" }, { status: 500 })
    }

    const txRef = body.txRef || `LEO-${Date.now()}`

    if (body.purpose === "donation") {
      const donorName = `${body.firstName ?? "Donor"}${body.lastName ? ` ${body.lastName}` : ""}`.trim()
      await createDonation({
        userId: body.userId,
        amount: Number(body.amount),
        donorName,
        donorEmail: body.email,
        message: body.message,
        causeId: body.causeId,
        causeTitle: body.causeTitle,
        txRef,
        currency: body.currency || "MWK",
        paymentStatus: "pending",
        fiscalYear: body.fiscalYear || getFiscalYear(),
      })
    }

    if (body.purpose === "membership" || body.purpose === "joining") {
      if (!body.userId) {
        return NextResponse.json({ success: false, error: "A signed-in member is required" }, { status: 400 })
      }
      const now = new Date().toISOString()
      await createMembershipFee({
        userId: body.userId,
        amount: Number(body.amount),
        period: body.purpose === "joining" ? "joining" : body.period || "yearly",
        coverageStart: body.coverageStart || now,
        coverageEnd: body.coverageEnd || now,
        dueDate: body.dueDate || body.coverageEnd || now,
        status: "pending",
        method: "paychangu",
        txRef,
        createdAt: now,
      })
    }

    const returnUrl =
      body.returnUrl ||
      (body.purpose === "donation"
        ? `${appUrl}/donate/return?txRef=${txRef}`
        : body.purpose === "membership"
          ? `${appUrl}/portal/membership/return?txRef=${txRef}`
          : body.purpose === "joining"
            ? `${appUrl}/portal/join-fee/return?txRef=${txRef}`
          : `${appUrl}/portal/shop/orders`)

    const payChanguResponse = await fetch("https://api.paychangu.com/payment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${paychanguKey}`,
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || "MWK",
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        callback_url: body.callbackUrl || `${appUrl}/api/payments/callback`,
        return_url: returnUrl,
        tx_ref: txRef,
        customization: body.customization,
      }),
    })

    const data = await payChanguResponse.json().catch(() => null)
    if (!payChanguResponse.ok) {
      const message =
        (data && (data.message || data.error || data?.data?.message || data?.data?.error)) || "PayChangu request failed"
      return NextResponse.json({ success: false, error: message }, { status: 400 })
    }

    const checkoutUrl = data?.checkoutUrl || data?.data?.checkout_url || data?.data?.link || data?.link || data?.url
    if (!checkoutUrl || typeof checkoutUrl !== "string") {
      return NextResponse.json({ success: false, error: "Missing checkout URL from PayChangu" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
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
