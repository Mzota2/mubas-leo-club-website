import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

/**
 * Generates a unique LEO ID in the format: LEO-YYYY-XXXXXX
 * Where YYYY is the current year and XXXXXX is a 6-digit random number
 */
export async function generateLeoId(): Promise<string> {
  const year = new Date().getFullYear()
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Generate 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    const leoId = `LEO-${year}-${randomNum}`

    // Check if this ID already exists
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("leoId", "==", leoId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return leoId
    }

    attempts++
  }

  // Fallback: use timestamp if all attempts fail (very unlikely)
  const timestamp = Date.now().toString().slice(-6)
  return `LEO-${year}-${timestamp}`
}
