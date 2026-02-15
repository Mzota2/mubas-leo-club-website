import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <Logo size="md" showText={true} textClassName="text-white text-lg" />
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Leadership, Experience, Opportunity. Join us in making a difference through community service and youth
              development.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-leo-primary hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-leo-primary hover:text-white transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-leo-primary hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-leo-primary transition-colors inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-leo-primary transition-colors inline-block">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-leo-primary transition-colors inline-block">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-leo-primary transition-colors inline-block">
                  Become a Member
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-leo-primary transition-colors inline-block flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-leo-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">MUBAS Campus, Blantyre, Malawi</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-leo-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:info@mubasleoclub.org"
                  className="hover:text-leo-primary transition-colors text-gray-400"
                >
                  info@mubasleoclub.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-leo-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">+265 999 123 456</span>
              </li>
            </ul>
          </div>

          {/* Newsletter/CTA */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Get Involved</h4>
            <p className="text-sm text-gray-400 mb-4">
              Join our community and be part of the change. Together we can make a difference.
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-4 py-2 bg-leo-primary hover:bg-leo-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
            >
              Join Us
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} MUBAS Leo Club. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-leo-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/about" className="hover:text-leo-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
