"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Heart, User, LogOut, Settings, ShoppingBag, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOut } from "@/lib/auth/firebase-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, firebaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/leaders", label: "Leaders" },
    { href: "/services", label: "Services" },
    { href: "/events", label: "Events" },
    { href: "/training", label: "Training" },
    { href: "/gallery", label: "Gallery" },
    { href: "/membership", label: "Membership" },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/98 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/">
          <Logo size="lg" className="group" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-leo-primary hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {!loading && user && firebaseUser ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-leo-primary focus:ring-offset-2">
                    <Avatar className="h-9 w-9 border-2 border-leo-primary/20">
                      <AvatarImage src={user.profileImage} alt={user.firstName} />
                      <AvatarFallback className="bg-leo-primary text-white text-sm font-medium">
                        {user.firstName?.[0]?.toUpperCase() || "U"}
                        {user.lastName?.[0]?.toUpperCase() || ""}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {user.leoId && (
                        <p className="text-xs leading-none text-leo-primary mt-1">ID: {user.leoId}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portal" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/shop" className="cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Shop
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portal/events" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Events
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "leader") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={async () => {
                      await signOut()
                      router.push("/")
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex text-gray-700 hover:text-leo-primary"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </>
          )}
          <Button
            asChild
            className="bg-leo-primary hover:bg-leo-primary-dark text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link href="/donate" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Donate</span>
            </Link>
          </Button>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/98 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <nav className="container flex flex-col gap-1 py-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-base font-medium text-gray-700 hover:text-leo-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t">
              {!loading && user && firebaseUser ? (
                <>
                  <Link
                    href="/portal"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-leo-primary hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/portal/profile"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-leo-primary hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user.role === "admin" || user.role === "leader") && (
                    <Link
                      href="/admin"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-leo-primary hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await signOut()
                      setMobileMenuOpen(false)
                      router.push("/")
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block px-4 py-3 text-base font-medium text-leo-primary hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
