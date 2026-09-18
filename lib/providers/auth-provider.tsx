"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let profileUnsub: (() => void) | null = null

    const unsubscribe = onAuthStateChanged(auth, (nextFirebaseUser) => {
      setFirebaseUser(nextFirebaseUser)

      if (profileUnsub) {
        profileUnsub()
        profileUnsub = null
      }

      if (!nextFirebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const ref = doc(db, "users", nextFirebaseUser.uid)
      profileUnsub = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setUser({ id: snap.id, ...snap.data() } as User)
          } else {
            setUser(null)
          }
          setLoading(false)
        },
        () => {
          setUser(null)
          setLoading(false)
        },
      )
    })

    return () => {
      if (profileUnsub) profileUnsub()
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, firebaseUser, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
