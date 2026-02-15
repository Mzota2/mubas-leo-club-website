"use server"

import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/config"

export async function logout() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to logout" }
  }
}
