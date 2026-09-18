"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { createUser } from "@/lib/firebase/firestore"
import type { User } from "@/lib/types"

export async function registerWithEmail(
  email: string,
  password: string,
  userData: Omit<User, "id" | "email" | "createdAt" | "updatedAt">,
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    })

    await createUser(firebaseUser.uid, {
      ...userData,
      email,
      role: "member",
      membershipType: userData.membershipType || "prospective-leo",
      membershipStatus: userData.membershipStatus || "pending",
    })

    return { success: true, user: firebaseUser }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
