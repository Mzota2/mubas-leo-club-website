import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/config"
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "Transaction ID is required" }, { status: 400 })
    }

    const payChanguResponse = await fetch(`https://api.paychangu.com/verify-payment/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
      },
    })

    const data = await payChanguResponse.json()
    const success = data.status === "success"

    if (success) {
      const paidAt = new Date().toISOString()
      const feesQuery = query(collection(db, "membershipFees"), where("txRef", "==", transactionId))
      const feesSnapshot = await getDocs(feesQuery)
      await Promise.all(
        feesSnapshot.docs.map(async (feeDoc) => {
          await updateDoc(feeDoc.ref, {
            status: "paid",
            paymentDate: paidAt,
          })
          const fee = feeDoc.data()
          if (fee.period === "joining" && fee.userId) {
            await updateDoc(doc(db, "users", fee.userId), {
              joiningFeePaid: true,
              joiningFeePaidAt: paidAt,
              updatedAt: paidAt,
            })
          }
        }),
      )
    }

    return NextResponse.json({
      success,
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
