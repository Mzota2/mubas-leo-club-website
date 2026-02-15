"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, DollarSign, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { initiatePayment } from "@/lib/paychangu/client"
import { useToast } from "@/hooks/use-toast"

export default function DonatePage() {
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const presetAmounts = [5000, 10000, 25000, 50000, 100000]

  const handleDonate = async () => {
    const donationAmount = customAmount || amount
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Amount Required",
        description: "Please select or enter a donation amount",
        variant: "destructive",
      })
      return
    }

    if (!email || !email.includes("@")) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Split name for PayChangu (using email prefix as fallback)
      const nameParts = email.split("@")[0].split(".")
      const firstName = nameParts[0] || "Donor"
      const lastName = nameParts[1] || ""

      const result = await initiatePayment({
        amount: parseFloat(donationAmount),
        email: email,
        firstName: firstName,
        lastName: lastName,
        currency: "MWK",
        purpose: "donation",
        returnUrl: `${window.location.origin}/donate/return`,
        customization: {
          title: "MUBAS Leo Club Donation",
          description: `Donation of MWK ${parseFloat(donationAmount).toLocaleString()}`,
        },
      })

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        toast({
          title: "Payment Error",
          description: result.error || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        })
        setIsProcessing(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-leo-primary mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">Support Our Cause</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Your donation helps us continue making a positive impact in our community. Every contribution makes a
            difference.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Why Donate Card */}
          <Card className="lg:col-span-2 border-0 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Why Donate?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p className="text-lg">Your generous donations enable us to:</p>
              <ul className="space-y-3">
                {[
                  "Organize impactful community service projects",
                  "Provide leadership training for young people",
                  "Support health and environmental initiatives",
                  "Empower communities through education and resources",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-leo-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Impact Stats Card */}
          <Card className="border-0 shadow-lg bg-gradient-leo-primary text-white rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Our Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/90 mb-4">Last year, with donor support:</p>
              <ul className="space-y-3">
                {[
                  "200+ units of blood collected",
                  "1,000+ trees planted",
                  "500+ students supported",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Make a Donation</CardTitle>
              <p className="text-gray-600 mt-2">Select an amount and proceed to secure payment</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">Select Amount (MWK)</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset.toString())
                        setCustomAmount("")
                      }}
                      disabled={isProcessing}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        amount === preset.toString()
                          ? "border-leo-primary bg-leo-primary text-white scale-105 shadow-lg"
                          : "border-gray-200 hover:border-leo-primary hover:shadow-md"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="custom-amount" className="text-sm text-gray-600 mb-2 block">
                    Or enter custom amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setAmount("")
                      }}
                      disabled={isProcessing}
                      className="pl-10 h-12 text-lg"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="donor-email" className="text-base font-semibold mb-2 block">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="donor-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  className="h-12 text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">We'll send you a receipt via email</p>
              </div>

              <Button
                onClick={handleDonate}
                disabled={isProcessing || (!amount && !customAmount) || !email}
                size="lg"
                className="w-full bg-leo-primary hover:bg-leo-primary-dark text-white h-14 text-lg font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-4 border-t">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span>Secure payment processing powered by PayChangu</span>
              </div>
            </CardContent>
          </Card>

          {/* Image/Visual Card */}
          <div className="relative h-full min-h-[500px] rounded-lg overflow-hidden shadow-xl hidden lg:block">
            <Image
              src="/charity-gala.png"
              alt="Community service and impact"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-leo-primary/80 via-leo-primary/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Together We Can</h3>
              <p className="text-white/90">
                Your support helps us create lasting change in communities across Malawi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
