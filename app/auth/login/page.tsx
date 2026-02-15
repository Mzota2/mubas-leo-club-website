import { AuthForm } from "@/components/auth/auth-form"
import { Logo } from "@/components/ui/logo"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="xl" showText={false} />
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
