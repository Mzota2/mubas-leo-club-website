"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { membershipFromJoinIntent, postAuthPath } from "@/lib/membership/join"
import { getUser } from "@/lib/firebase/firestore"
import type { JoinIntent } from "@/lib/types"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.655 29.273 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.88 19.51C14.66 15.108 18.97 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.252 0-9.62-3.318-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.08 12.08 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  )
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    joinIntent: z.enum(["joining", "existing"], { required_error: "Select whether you are joining or already a member" }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
})

const googleCompleteSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  joinIntent: z.enum(["joining", "existing"], { required_error: "Select whether you are joining or already a member" }),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>
type ResetFormData = z.infer<typeof resetSchema>
type GoogleCompleteFormData = z.infer<typeof googleCompleteSchema>

interface AuthFormProps {
  mode: "login" | "register" | "reset"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)
  const [googleUid, setGoogleUid] = useState<string | null>(null)
  const [googleProfileImage, setGoogleProfileImage] = useState<string>("")
  const [googleEmail, setGoogleEmail] = useState<string>("")

  const form = useForm<any>({
    resolver: zodResolver(mode === "login" ? loginSchema : mode === "register" ? registerSchema : resetSchema),
    defaultValues: mode === "register" ? { joinIntent: "joining" } : undefined,
  })

  const googleCompleteForm = useForm<GoogleCompleteFormData>({
    resolver: zodResolver(googleCompleteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      phone: "",
      dateOfBirth: "",
      joinIntent: "joining",
    },
  })

  const googleValues = googleCompleteForm.watch()

  const { register, handleSubmit } = form
  const errors: any = form.formState.errors

  const getRedirectPath = (membershipType?: string) => {
    const raw = searchParams?.get("redirect") || ""
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo" })
    }
    if (!raw) return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo" })
    const normalized = raw.startsWith("/") ? raw : `/${raw}`
    if (normalized === "/portal") return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo" })
    return normalized
  }

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)

      if (!userCredential.user.emailVerified) {
        toast({
          title: "Verify your email",
          description: "Please verify your email to continue.",
        })
        router.push(`/auth/verify-sent?email=${encodeURIComponent(data.email)}`)
        return
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      const profile = await getUser(userCredential.user.uid)
      router.push(getRedirectPath(profile?.membershipType))
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setIsLoading(false)
    }
  }

  const getOrCreateUserDoc = async (uid: string, _partial: Record<string, any>) => {
    const userDocRef = doc(db, "users", uid)
    const existing = await getDoc(userDocRef)
    if (existing.exists()) return existing.data()
    return null
  }

  const isProfileComplete = (data: any) => {
    const required = ["firstName", "lastName", "username", "email", "phone", "dateOfBirth"]
    return required.every((k) => typeof data?.[k] === "string" && data[k].trim().length > 0)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const display = user.displayName || ""
      const [firstName, ...rest] = display.split(" ").filter(Boolean)
      const lastName = rest.join(" ") || ""

      const email = user.email || ""
      const usernameGuess = email ? email.split("@")[0] : user.uid
      const profileImage = user.photoURL || ""

      const docData = await getOrCreateUserDoc(user.uid, {
        firstName: firstName || "",
        lastName: lastName || "",
        username: usernameGuess,
        email,
        phone: "",
        dateOfBirth: "",
        profileImage,
      })

      const safeDoc = (docData ?? {}) as Record<string, unknown>

      const merged: GoogleCompleteFormData = {
        firstName: String((safeDoc.firstName as string | undefined) ?? firstName ?? ""),
        lastName: String((safeDoc.lastName as string | undefined) ?? lastName ?? ""),
        username: String((safeDoc.username as string | undefined) ?? usernameGuess ?? ""),
        phone: String((safeDoc.phone as string | undefined) ?? ""),
        dateOfBirth: String((safeDoc.dateOfBirth as string | undefined) ?? ""),
        joinIntent: ((safeDoc.joinIntent as JoinIntent | undefined) ?? "joining") as JoinIntent,
      }

      setGoogleUid(user.uid)
      setGoogleEmail(email)
      setGoogleProfileImage(profileImage)
      googleCompleteForm.reset(merged)

      if (!isProfileComplete({ ...safeDoc, email })) {
        setGoogleDialogOpen(true)
        return
      }

      toast({
        title: "Success",
        description: "Signed in with Google",
      })
      router.push(getRedirectPath(String(safeDoc.membershipType || "")))
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const missingLabels = useMemo(() => {
    const v = googleValues
    const missing: string[] = []
    if (!v.firstName) missing.push("first name")
    if (!v.lastName) missing.push("last name")
    if (!v.username) missing.push("username")
    if (!v.phone) missing.push("phone")
    if (!v.dateOfBirth) missing.push("date of birth")
    return missing
  }, [googleDialogOpen, googleValues])

  const onGoogleCompleteSubmit = async (data: GoogleCompleteFormData) => {
    if (!googleUid) return

    setIsLoading(true)
    setError("")

    try {
      const existing = await getDoc(doc(db, "users", googleUid))
      if (existing.exists()) {
        await setDoc(
          doc(db, "users", googleUid),
          {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            email: googleEmail,
            profileImage: googleProfileImage,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
      } else {
        const { createUser } = await import("@/lib/firebase/firestore")
        await createUser(googleUid, {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: googleEmail,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          role: "member",
          profileImage: googleProfileImage,
          ...membershipFromJoinIntent(data.joinIntent),
        })
      }

      setGoogleDialogOpen(false)

      toast({
        title: "Profile saved",
        description: data.joinIntent === "joining" ? "Continue with new member training." : "Your account is ready.",
      })
      router.push(getRedirectPath(data.joinIntent === "joining" ? "prospective-leo" : "leo"))
    } catch (err: any) {
      setError(err.message || "Failed to save your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      })

      // Create user document in Firestore using createUser which auto-generates LEO ID
      const { createUser } = await import("@/lib/firebase/firestore")
      await createUser(user.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        role: "member",
        ...membershipFromJoinIntent(data.joinIntent),
        ...(data.middleName ? { middleName: data.middleName } : {}),
      })

      const continueUrl = `${window.location.origin}/auth/verify`
      await sendEmailVerification(user, { url: continueUrl, handleCodeInApp: true })

      toast({
        title: "Verification required",
        description: "We sent you a verification link. Please verify your email to continue.",
      })

      router.push(`/auth/verify-sent?email=${encodeURIComponent(data.email)}`)
      return
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const continueUrl = `${window.location.origin}/auth/reset/confirm`
      await sendPasswordResetEmail(auth, data.email, { url: continueUrl, handleCodeInApp: true })
      toast({
        title: "Success",
        description: "Password reset email sent. Check your inbox.",
      })
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete your profile</DialogTitle>
            <DialogDescription>
              {missingLabels.length > 0
                ? `Please provide: ${missingLabels.join(", ")}.`
                : "Please confirm your details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={googleCompleteForm.handleSubmit(onGoogleCompleteSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="g_firstName">First Name</Label>
                <Input id="g_firstName" {...googleCompleteForm.register("firstName")} disabled={isLoading} />
                {googleCompleteForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {googleCompleteForm.formState.errors.firstName.message as string}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="g_lastName">Last Name</Label>
                <Input id="g_lastName" {...googleCompleteForm.register("lastName")} disabled={isLoading} />
                {googleCompleteForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">
                    {googleCompleteForm.formState.errors.lastName.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="g_username">Username</Label>
              <Input id="g_username" {...googleCompleteForm.register("username")} disabled={isLoading} />
              {googleCompleteForm.formState.errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {googleCompleteForm.formState.errors.username.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="g_phone">Phone</Label>
              <Input id="g_phone" type="tel" placeholder="+265 999 123 456" {...googleCompleteForm.register("phone")} disabled={isLoading} />
              {googleCompleteForm.formState.errors.phone && (
                <p className="text-sm text-red-500 mt-1">{googleCompleteForm.formState.errors.phone.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="g_dob">Date of Birth</Label>
              <Input id="g_dob" type="date" {...googleCompleteForm.register("dateOfBirth")} disabled={isLoading} />
              {googleCompleteForm.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1">
                  {googleCompleteForm.formState.errors.dateOfBirth.message as string}
                </p>
              )}
            </div>

            <div>
              <Label>Are you already a Leo member?</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => googleCompleteForm.setValue("joinIntent", "joining", { shouldValidate: true })}
                  className={`rounded-md border p-3 text-left text-sm ${
                    googleCompleteForm.watch("joinIntent") === "joining"
                      ? "border-leo-primary bg-orange-50"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="font-semibold">I am joining</span>
                  <p className="mt-1 text-xs text-muted-foreground">Prospective member. Complete training after signup.</p>
                </button>
                <button
                  type="button"
                  onClick={() => googleCompleteForm.setValue("joinIntent", "existing", { shouldValidate: true })}
                  className={`rounded-md border p-3 text-left text-sm ${
                    googleCompleteForm.watch("joinIntent") === "existing"
                      ? "border-leo-primary bg-orange-50"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="font-semibold">Already a member</span>
                  <p className="mt-1 text-xs text-muted-foreground">Existing Leo. Training is not required.</p>
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Enter your credentials to access your account"
              : mode === "register"
                ? "Fill in your details to join MUBAS Leo Club"
                : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        {mode === "login" && (
          <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
            

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled={isLoading} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showLoginPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/reset" className="text-leo-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-leo-primary hover:underline font-medium">
                Register
              </Link>
            </p>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <Label>Are you already a Leo member?</Label>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => form.setValue("joinIntent", "joining", { shouldValidate: true })}
                  className={`rounded-md border p-3 text-left text-sm ${
                    form.watch("joinIntent") === "joining"
                      ? "border-leo-primary bg-orange-50 text-neutral-900"
                      : "border-border bg-white text-neutral-700"
                  }`}
                >
                  <span className="font-semibold">I am joining</span>
                  <p className="mt-1 text-xs text-muted-foreground">Prospective member. You will complete training, then an admin approves you.</p>
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("joinIntent", "existing", { shouldValidate: true })}
                  className={`rounded-md border p-3 text-left text-sm ${
                    form.watch("joinIntent") === "existing"
                      ? "border-leo-primary bg-orange-50 text-neutral-900"
                      : "border-border bg-white text-neutral-700"
                  }`}
                >
                  <span className="font-semibold">I am already a member</span>
                  <p className="mt-1 text-xs text-muted-foreground">Existing Leo. You skip the new member training program.</p>
                </button>
              </div>
              {errors.joinIntent && <p className="text-sm text-red-500 mt-1">{errors.joinIntent.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} disabled={isLoading} />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message as string}</p>}
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name <span className="text-[10]">(Optional)</span></Label>
                <Input id="middleName" {...register("middleName")} disabled={isLoading} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} disabled={isLoading} />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message as string}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} disabled={isLoading} />
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled={isLoading} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+265 999 123 456" {...register("phone")} disabled={isLoading} />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} disabled={isLoading} />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showRegisterPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowRegisterPassword((s) => !s)}
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowRegisterConfirmPassword((s) => !s)}
                  aria-label={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message as string}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
             <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-leo-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleSubmit(onResetSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} disabled={isLoading} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-leo-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </form>
        )}
        </CardContent>
      </Card>
    </>
  )
}
