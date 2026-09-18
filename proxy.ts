import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  // NOTE: Firebase client auth does not provide a reliable server-side cookie by default.
  // We rely on client-side route protection (ProtectedRoute) instead of a cookie gate.
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
