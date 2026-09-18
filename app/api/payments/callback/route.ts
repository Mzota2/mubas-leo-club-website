import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.status === "success" && body.tx_ref) {
      const donationsQuery = query(collection(db, "donations"), where("txRef", "==", body.tx_ref))
      const donationsSnapshot = await getDocs(donationsQuery)
      await Promise.all(
        donationsSnapshot.docs.map((donationDoc) =>
          updateDoc(donationDoc.ref, {
            paymentStatus: "completed",
          }),
        ),
      )

      const feesQuery = query(collection(db, "membershipFees"), where("txRef", "==", body.tx_ref))
      const feesSnapshot = await getDocs(feesQuery)
      const paidAt = new Date().toISOString()
      await Promise.all(
        feesSnapshot.docs.map((feeDoc) =>
          updateDoc(feeDoc.ref, {
            status: "paid",
            paymentDate: paidAt,
          }),
        ),
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
