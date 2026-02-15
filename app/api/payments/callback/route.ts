import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Update donation payment status in Firestore
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
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
