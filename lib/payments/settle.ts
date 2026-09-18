import { collection, doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { getDonationByTxRef, getMembershipFeeByTxRef, getOrderByTxRef } from "@/lib/firebase/firestore"
import { PAYCHANGU_CONFIG } from "@/lib/paychangu/config"
import { donationToRecord, feeToRecord, orderToRecord, recordToReceipt } from "@/lib/payments/receipt"
import type { PaymentReceipt } from "@/lib/payments/types"

export async function settlePayChanguPayment(txRef: string): Promise<PaymentReceipt | null> {
  const paidAt = new Date().toISOString()

  const donationsQuery = query(collection(db, "donations"), where("txRef", "==", txRef))
  const donationsSnapshot = await getDocs(donationsQuery)
  await Promise.all(
    donationsSnapshot.docs.map(async (donationDoc) => {
      const data = donationDoc.data()
      if (data.paymentStatus !== "completed") {
        await updateDoc(donationDoc.ref, { paymentStatus: "completed" })
        if (data.causeId) {
          try {
            await updateDoc(doc(db, "donationCauses", data.causeId), {
              currentAmount: increment(Number(data.amount) || 0),
              updatedAt: paidAt,
            })
          } catch {
            // Cause docs from default/sample IDs may not exist yet.
          }
        }
      }
    }),
  )

  const feesQuery = query(collection(db, "membershipFees"), where("txRef", "==", txRef))
  const feesSnapshot = await getDocs(feesQuery)
  await Promise.all(
    feesSnapshot.docs.map(async (feeDoc) => {
      const fee = feeDoc.data()
      if (fee.status !== "paid") {
        await updateDoc(feeDoc.ref, {
          status: "paid",
          paymentDate: paidAt,
        })
      }
      if (fee.period === "joining" && fee.userId) {
        await updateDoc(doc(db, "users", fee.userId), {
          joiningFeePaid: true,
          joiningFeePaidAt: paidAt,
          updatedAt: paidAt,
        })
      }
    }),
  )

  const ordersQuery = query(collection(db, "orders"), where("txRef", "==", txRef))
  const ordersSnapshot = await getDocs(ordersQuery)
  await Promise.all(
    ordersSnapshot.docs.map(async (orderDoc) => {
      const order = orderDoc.data()
      if (order.paymentStatus !== "paid") {
        await updateDoc(orderDoc.ref, {
          paymentStatus: "paid",
          status: "processing",
          updatedAt: paidAt,
        })
      }
    }),
  )

  return getReceiptForTxRef(txRef)
}

export async function getReceiptForTxRef(txRef: string): Promise<PaymentReceipt | null> {
  const donation = await getDonationByTxRef(txRef)
  if (donation) return recordToReceipt(donationToRecord(donation))

  const fee = await getMembershipFeeByTxRef(txRef)
  if (fee) return recordToReceipt(feeToRecord(fee))

  const order = await getOrderByTxRef(txRef)
  if (order) return recordToReceipt(orderToRecord(order))

  return null
}

export async function markPayChanguFailure(txRef: string) {
  const failedAt = new Date().toISOString()

  const donationsQuery = query(collection(db, "donations"), where("txRef", "==", txRef))
  const donationsSnapshot = await getDocs(donationsQuery)
  await Promise.all(
    donationsSnapshot.docs.map(async (donationDoc) => {
      if (donationDoc.data().paymentStatus === "pending") {
        await updateDoc(donationDoc.ref, { paymentStatus: "failed" })
      }
    }),
  )

  const ordersQuery = query(collection(db, "orders"), where("txRef", "==", txRef))
  const ordersSnapshot = await getDocs(ordersQuery)
  await Promise.all(
    ordersSnapshot.docs.map(async (orderDoc) => {
      if (orderDoc.data().paymentStatus === "pending") {
        await updateDoc(orderDoc.ref, {
          paymentStatus: "failed",
          status: "cancelled",
          updatedAt: failedAt,
        })
      }
    }),
  )
}

type PayChanguPayload = {
  status?: string
  amount?: number
  data?: { status?: string; amount?: number }
}

export function isPayChanguSuccess(payload: PayChanguPayload | null) {
  if (!payload) return false
  const ok = new Set(["success", "successful", "paid", "completed"])
  const nested = payload.data?.status?.toLowerCase()
  const top = payload.status?.toLowerCase()
  return Boolean(top && ok.has(top) && (!nested || ok.has(nested)))
}

export function isPayChanguFailure(payload: PayChanguPayload | null) {
  if (!payload) return false
  const fail = new Set(["failed", "fail", "cancelled", "canceled", "expired"])
  const nested = payload.data?.status?.toLowerCase()
  const top = payload.status?.toLowerCase()
  return Boolean((nested && fail.has(nested)) || (top && fail.has(top) && !isPayChanguSuccess(payload)))
}

export async function verifyAndSettle(txRef: string) {
  let data: PayChanguPayload | null = null
  try {
    const payChanguResponse = await fetch(`${PAYCHANGU_CONFIG.verifyUrl}/${encodeURIComponent(txRef)}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY || PAYCHANGU_CONFIG.secretKey}`,
      },
    })
    data = (await payChanguResponse.json().catch(() => null)) as PayChanguPayload | null
  } catch (error) {
    console.error("PayChangu verify failed", error)
  }

  const success = isPayChanguSuccess(data)

  if (success) {
    try {
      await settlePayChanguPayment(txRef)
    } catch (error) {
      console.error("PayChangu settle failed", error)
    }
  } else if (isPayChanguFailure(data)) {
    try {
      await markPayChanguFailure(txRef)
    } catch (error) {
      console.error("PayChangu failure mark failed", error)
    }
  }

  let receipt: PaymentReceipt | null = null
  try {
    receipt = await getReceiptForTxRef(txRef)
  } catch (error) {
    console.error("Receipt lookup failed", error)
  }

  return {
    success: success || receipt?.status === "paid",
    data,
    receipt,
  }
}
