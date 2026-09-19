"use client"

import { useMemo, useState, Suspense } from "react"
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
import { doc, getDoc } from "firebase/firestore"
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
import { Eye, EyeOff, GraduationCap, Loader2, Lock, UserRound } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { membershipFromJoinIntent, postAuthPath } from "@/lib/membership/join"
import { getUser } from "@/lib/firebase/firestore"
import { generateLeoId } from "@/lib/utils/leo-id"
import { STUDY_PROGRAMS, STUDY_YEARS } from "@/lib/content/academic"
import type { JoinIntent } from "@/lib/types"

const registerSteps = [
  { id: 1, title: "Personal", caption: "Who you are", icon: UserRound },
  { id: 2, title: "Academic", caption: "Study and graduation", icon: GraduationCap },
  { id: 3, title: "Security", caption: "Create a password", icon: Lock },
] as const

const optionalDate = z.string().optional().or(z.literal(""))

const academicFields = {
  programOfStudy: z.string().min(2, "Program of study is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  expectedGraduationDate: z.string().min(1, "Expected graduation date is required"),
}

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
    dateOfBirth: optionalDate,
    joinIntent: z.enum(["joining", "existing"], { required_error: "Select whether you are joining or already a member" }),
    ...academicFields,
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
  dateOfBirth: optionalDate,
  joinIntent: z.enum(["joining", "existing"], { required_error: "Select whether you are joining or already a member" }),
  ...academicFields,
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>
type ResetFormData = z.infer<typeof resetSchema>
type GoogleCompleteFormData = z.infer<typeof googleCompleteSchema>

interface AuthFormProps {
  mode: "login" | "register" | "reset"
}

export function AuthForm({ mode }: AuthFormProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
        </div>
      }
    >
      <AuthFormInner mode={mode} />
    </Suspense>
  )
}

function AuthFormInner({ mode }: AuthFormProps) {
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
  const [registerStep, setRegisterStep] = useState(1)

  const form = useForm<any>({
    resolver: zodResolver(mode === "login" ? loginSchema : mode === "register" ? registerSchema : resetSchema),
    defaultValues:
      mode === "register"
        ? {
            joinIntent: "joining",
            firstName: "",
            middleName: "",
            lastName: "",
            username: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            programOfStudy: "",
            yearOfStudy: "",
            expectedGraduationDate: "",
            password: "",
            confirmPassword: "",
          }
        : undefined,
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
      programOfStudy: "",
      yearOfStudy: "",
      expectedGraduationDate: "",
    },
  })

  const googleValues = googleCompleteForm.watch()

  const { register, handleSubmit } = form
  const errors: any = form.formState.errors

  const getRedirectPath = (membershipType?: string, joiningFeePaid?: boolean) => {
    if (membershipType === "prospective-leo" && !joiningFeePaid) return "/portal/join-fee"
    const raw = searchParams?.get("redirect") || ""
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo", joiningFeePaid })
    }
    if (!raw) return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo", joiningFeePaid })
    const normalized = raw.startsWith("/") ? raw : `/${raw}`
    if (normalized === "/portal" || normalized.startsWith("/portal/training")) {
      return postAuthPath({ membershipType: membershipType as "leo" | "prospective-leo", joiningFeePaid })
    }
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
      router.push(getRedirectPath(profile?.membershipType, profile?.joiningFeePaid))
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
    const required = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phone",
      "programOfStudy",
      "yearOfStudy",
      "expectedGraduationDate",
    ]
    return required.every((k) => typeof data?.[k] === "string" && data[k].trim().length > 0)
  }

  const academicPayload = (data: {
    programOfStudy: string
    yearOfStudy: string
    expectedGraduationDate: string
    dateOfBirth?: string
  }) => ({
    programOfStudy: data.programOfStudy,
    yearOfStudy: data.yearOfStudy,
    expectedGraduationDate: data.expectedGraduationDate,
    ...(data.dateOfBirth ? { dateOfBirth: data.dateOfBirth } : {}),
  })

  const goToNextRegisterStep = async () => {
    const fields =
      registerStep === 1
        ? (["joinIntent", "firstName", "lastName", "username", "email", "phone"] as const)
        : (["programOfStudy", "yearOfStudy", "expectedGraduationDate"] as const)
    const valid = await form.trigger(fields as unknown as string[])
    if (valid) setRegisterStep((step) => Math.min(3, step + 1))
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await user.getIdToken()

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
        programOfStudy: String((safeDoc.programOfStudy as string | undefined) ?? ""),
        yearOfStudy: String((safeDoc.yearOfStudy as string | undefined) ?? ""),
        expectedGraduationDate: String((safeDoc.expectedGraduationDate as string | undefined) ?? ""),
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
      router.push(
        getRedirectPath(String(safeDoc.membershipType || ""), Boolean(safeDoc.joiningFeePaid)),
      )
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
    if (!v.programOfStudy) missing.push("program of study")
    if (!v.yearOfStudy) missing.push("year of study")
    if (!v.expectedGraduationDate) missing.push("expected graduation date")
    return missing
  }, [googleDialogOpen, googleValues])

  const onGoogleCompleteSubmit = async (data: GoogleCompleteFormData) => {
    if (!googleUid) return

    setIsLoading(true)
    setError("")

    try {
      await auth.currentUser?.getIdToken()
      const existing = await getDoc(doc(db, "users", googleUid))
      const membership = membershipFromJoinIntent(data.joinIntent)
      if (existing.exists()) {
        const current = existing.data()
        const { updateUser } = await import("@/lib/firebase/firestore")
        await updateUser(googleUid, {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          phone: data.phone,
          email: googleEmail || current.email || "",
          profileImage: googleProfileImage || current.profileImage || "",
          ...academicPayload(data),
          ...(!current.leoId ? { leoId: generateLeoId(googleUid) } : {}),
          ...(!current.membershipStatus || !current.membershipType ? membership : {}),
        })
      } else {
        const { createUser } = await import("@/lib/firebase/firestore")
        await createUser(googleUid, {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: googleEmail,
          phone: data.phone,
          role: "member",
          profileImage: googleProfileImage,
          ...academicPayload(data),
          ...membership,
        })
      }

      setGoogleDialogOpen(false)

      toast({
        title: "Profile saved",
        description:
          data.joinIntent === "joining" ? "Pay the once-off joining fee to unlock training quizzes." : "Your account is ready.",
      })
      router.push(getRedirectPath(data.joinIntent === "joining" ? "prospective-leo" : "leo", data.joinIntent !== "joining"))
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
      await user.getIdToken()

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
        role: "member",
        ...membershipFromJoinIntent(data.joinIntent),
        ...academicPayload(data),
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete your profile</DialogTitle>
            <DialogDescription>
              {missingLabels.length > 0
                ? `Please provide: ${missingLabels.join(", ")}.`
                : "Confirm your personal and academic details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={googleCompleteForm.handleSubmit(onGoogleCompleteSubmit)} className="space-y-6">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Personal information</p>
                <p className="text-xs text-muted-foreground">Birthday is optional and used for club celebrations.</p>
              </div>
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
                <Label htmlFor="g_dob">Birthday <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="g_dob" type="date" {...googleCompleteForm.register("dateOfBirth")} disabled={isLoading} />
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
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Academic information</p>
                <p className="text-xs text-muted-foreground">Membership ends after graduation, so this helps the club plan ahead.</p>
              </div>
              <div>
                <Label htmlFor="g_program">Program of study</Label>
                <Input
                  id="g_program"
                  placeholder="e.g. Civil Engineering"
                  {...googleCompleteForm.register("programOfStudy")}
                  disabled={isLoading}
                />
                {googleCompleteForm.formState.errors.programOfStudy && (
                  <p className="text-sm text-red-500 mt-1">
                    {googleCompleteForm.formState.errors.programOfStudy.message as string}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="g_year">Year of study</Label>
                  <select
                    id="g_year"
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...googleCompleteForm.register("yearOfStudy")}
                    disabled={isLoading}
                  >
                    <option value="">Select year</option>
                    {STUDY_YEARS.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  {googleCompleteForm.formState.errors.yearOfStudy && (
                    <p className="text-sm text-red-500 mt-1">
                      {googleCompleteForm.formState.errors.yearOfStudy.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="g_grad">Expected graduation</Label>
                  <Input
                    id="g_grad"
                    type="date"
                    {...googleCompleteForm.register("expectedGraduationDate")}
                    disabled={isLoading}
                  />
                  {googleCompleteForm.formState.errors.expectedGraduationDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {googleCompleteForm.formState.errors.expectedGraduationDate.message as string}
                    </p>
                  )}
                </div>
              </div>
            </section>

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
                ? "Personal details, academic information, then a password"
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
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-5">
            <ol className="grid grid-cols-3 gap-2">
              {registerSteps.map((step) => {
                const Icon = step.icon
                const active = registerStep === step.id
                const done = registerStep > step.id
                return (
                  <li
                    key={step.id}
                    className={`rounded-md border px-2 py-2 text-center sm:px-3 sm:text-left ${
                      active
                        ? "border-leo-primary bg-orange-50"
                        : done
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-border bg-white"
                    }`}
                  >
                    <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:justify-start">
                      <Icon className="h-3.5 w-3.5" />
                      {step.id}. {step.title}
                    </p>
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{step.caption}</p>
                  </li>
                )
              })}
            </ol>

            {registerStep === 1 && (
              <div className="space-y-4">
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
                    <Label htmlFor="middleName">Middle Name <span className="text-[10px]">(Optional)</span></Label>
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
                    <Label htmlFor="dateOfBirth">
                      Birthday <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} disabled={isLoading} />
                    <p className="mt-1 text-xs text-muted-foreground">Used for birthday celebrations with fellow Leos.</p>
                  </div>
                </div>
              </div>
            )}

            {registerStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Academic details tell the club who is graduating when. Membership ends after graduation.
                </p>
                <div>
                  <Label htmlFor="programOfStudy">Program of study</Label>
                  <Input
                    id="programOfStudy"
                    placeholder="e.g. Civil Engineering"
                    {...register("programOfStudy")}
                    disabled={isLoading}
                  />
                  {errors.programOfStudy && (
                    <p className="text-sm text-red-500 mt-1">{errors.programOfStudy.message as string}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="yearOfStudy">Year of study</Label>
                    <select
                      id="yearOfStudy"
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...register("yearOfStudy")}
                      disabled={isLoading}
                    >
                      <option value="">Select year</option>
                      {STUDY_YEARS.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                    {errors.yearOfStudy && (
                      <p className="text-sm text-red-500 mt-1">{errors.yearOfStudy.message as string}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="expectedGraduationDate">Expected graduation date</Label>
                    <Input
                      id="expectedGraduationDate"
                      type="date"
                      {...register("expectedGraduationDate")}
                      disabled={isLoading}
                    />
                    {errors.expectedGraduationDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.expectedGraduationDate.message as string}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {registerStep === 3 && (
              <div className="space-y-4">
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
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {registerStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setRegisterStep((step) => Math.max(1, step - 1))}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              {registerStep < 3 ? (
                <Button
                  type="button"
                  className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white sm:flex-1"
                  onClick={goToNextRegisterStep}
                  disabled={isLoading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white sm:flex-1"
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
              )}
            </div>
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
