import { NextResponse } from "next/server"
import { createDonation, createMembershipFee, createOrder } from "@/lib/firebase/firestore"
import { PAYCHANGU_CONFIG } from "@/lib/paychangu/config"
import { absoluteUrl, resolvePublicOrigin, returnPathForKind, withTxRef } from "@/lib/payments/urls"

function getFiscalYear(date = new Date()) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const paychanguKey = process.env.PAYCHANGU_SECRET_KEY || PAYCHANGU_CONFIG.secretKey
    if (!paychanguKey) {
      return NextResponse.json({ success: false, error: "PAYCHANGU_SECRET_KEY is not configured" }, { status: 500 })
    }

    const txRef = body.txRef || `LEO-${Date.now()}`

    if (body.purpose === "donation") {
      const donorName = `${body.firstName ?? "Donor"}${body.lastName ? ` ${body.lastName}` : ""}`.trim()
      await createDonation({
        ...(body.userId ? { userId: body.userId } : {}),
        amount: Number(body.amount),
        donorName,
        donorEmail: body.email,
        ...(body.message ? { message: body.message } : {}),
        ...(body.causeId ? { causeId: body.causeId } : {}),
        ...(body.causeTitle ? { causeTitle: body.causeTitle } : {}),
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

    if (body.purpose === "order") {
      const email = String(body.email || "").trim()
      const shippingAddress = String(body.shippingAddress || "").trim()
      const customerName = String(body.customerName || `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim())
      const phone = String(body.phone || "").trim()
      if (!email || !shippingAddress || !customerName || !phone) {
        return NextResponse.json(
          { success: false, error: "Name, email, phone, and delivery address are required" },
          { status: 400 },
        )
      }
      const now = new Date().toISOString()
      await createOrder({
        userId: body.userId || "guest",
        items: Array.isArray(body.items) ? body.items : [],
        subtotal: Number(body.subtotal) || Number(body.amount),
        deliveryFee: Number(body.deliveryFee) || 0,
        total: Number(body.amount),
        currency: body.currency || "MWK",
        status: "pending",
        paymentMethod: "paychangu",
        paymentStatus: "pending",
        txRef,
        customerName,
        customerEmail: email,
        phone,
        shippingAddress,
        createdAt: now,
        updatedAt: now,
      })
    }

    const origin = resolvePublicOrigin(request, body.returnUrl)
    const returnUrlBase = body.returnUrl || `${origin}${returnPathForKind(body.purpose)}`
    const returnUrl = withTxRef(absoluteUrl(returnUrlBase, origin), txRef)

    const payChanguResponse = await fetch(PAYCHANGU_CONFIG.paymentUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${paychanguKey}`,
      },
      body: JSON.stringify({
        amount: Number(body.amount),
        currency: body.currency || PAYCHANGU_CONFIG.currency,
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        // PayChangu sends the customer to callback_url after payment.
        callback_url: returnUrl,
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
    const message = error instanceof Error ? error.message : "Failed to initiate payment"
    console.error("PayChangu initiate failed", error)
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    )
  }
}
