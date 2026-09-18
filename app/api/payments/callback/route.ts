import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/config"
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"

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

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
