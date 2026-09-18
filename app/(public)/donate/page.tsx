"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, DollarSign, ArrowRight, CheckCircle2, Loader2, Target } from "lucide-react"
import { initiatePayment } from "@/lib/paychangu/client"
import { useToast } from "@/hooks/use-toast"
import { useDonationCauses } from "@/lib/hooks/use-donation-causes"
import { useAuth } from "@/lib/hooks/use-auth"
import { DEFAULT_DONATION_CAUSES } from "@/lib/payments/defaults"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

export default function DonatePage() {
  const [selectedCause, setSelectedCause] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { data: causes, isLoading: causesLoading } = useDonationCauses(true)

  const liveCauses = causes && causes.length > 0 ? causes : DEFAULT_DONATION_CAUSES
  const usingDefaultCauses = !causesLoading && (!causes || causes.length === 0)

  const presetAmounts = [5000, 10000, 25000, 50000, 100000]

  const selectedCauseData = liveCauses.find((c) => c.id === selectedCause)

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email)
  }, [email, user?.email])

  const handleDonate = async () => {
    if (!selectedCause) {
      toast({
        title: "Cause Required",
        description: "Please select a cause to donate to",
        variant: "destructive",
      })
      return
    }

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
        firstName: user?.firstName || firstName,
        lastName: user?.lastName || lastName,
        currency: "MWK",
        purpose: "donation",
        userId: user?.id,
        causeId: selectedCause,
        causeTitle: selectedCauseData?.title,
        returnUrl: `${window.location.origin}/donate/return`,
        customization: {
          title: `MUBAS Leo Club - ${selectedCauseData?.title || "Donation"}`,
          description: `Donation of MWK ${parseFloat(donationAmount).toLocaleString()} for ${selectedCauseData?.title || "our cause"}`,
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
    <div className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-leo-primary mb-6">
            <Heart className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-4 text-gray-900">Support Our Causes</h1>
          <p className="text-base md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Choose a cause that matters to you and make a difference. Every contribution helps us create lasting impact in our community.
          </p>
        </div>

        {/* Cause Selection */}
        <div className="mb-12">
          <Label className="text-lg font-semibold mb-4 block">Select a Cause to Support</Label>
          {usingDefaultCauses ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Showing default causes until the admin publishes live fundraising campaigns.
            </p>
          ) : null}
          {causesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : liveCauses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveCauses.map((cause) => (
                <Card
                  key={cause.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCause === cause.id
                      ? "border-2 border-leo-primary bg-leo-primary/5 shadow-md"
                      : "border hover:border-leo-primary/50"
                  }`}
                  onClick={() => setSelectedCause(cause.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="min-w-0 text-lg">{cause.title}</CardTitle>
                      {selectedCause === cause.id && (
                        <Badge className="bg-leo-primary text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cause.description}</p>
                    {cause.targetAmount && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>
                            {Math.round((cause.currentAmount / cause.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-leo-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min((cause.currentAmount / cause.targetAmount) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>MWK {cause.currentAmount.toLocaleString()}</span>
                          <span>MWK {cause.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active donation causes at the moment.</p>
                <p className="text-sm text-gray-500 mt-2">Check back soon for new causes to support!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Donation Form - Only show if cause is selected */}
        {selectedCause && selectedCauseData && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Donate to {selectedCauseData.title}</CardTitle>
                <p className="text-gray-600 mt-2">Select an amount and proceed to secure payment</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Select Amount (MWK)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(preset.toString())
                          setCustomAmount("")
                        }}
                        disabled={isProcessing}
                        className={`p-3 sm:p-4 rounded-lg border-2 font-semibold transition-all text-sm ${
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
                      Donate Now
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

            {/* Selected Cause Info */}
            <Card className="border-0 shadow-xl rounded-lg bg-gradient-to-br from-leo-primary/10 to-leo-secondary/10">
              <CardHeader>
                <CardTitle className="text-2xl">{selectedCauseData.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{selectedCauseData.description}</p>
                {selectedCauseData.targetAmount && (
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Fundraising Goal</span>
                      <span className="text-sm font-bold text-leo-primary">
                        {Math.round((selectedCauseData.currentAmount / selectedCauseData.targetAmount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-leo-primary h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min((selectedCauseData.currentAmount / selectedCauseData.targetAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Raised: MWK {selectedCauseData.currentAmount.toLocaleString()}</span>
                      <span>Goal: MWK {selectedCauseData.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-gray-900">Why This Matters</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-leo-primary mt-0.5 flex-shrink-0" />
                      <span>Your donation directly supports this specific cause</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-leo-primary mt-0.5 flex-shrink-0" />
                      <span>100% of funds go to the cause (no administrative fees)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-leo-primary mt-0.5 flex-shrink-0" />
                      <span>You'll receive updates on how your donation is being used</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info if no cause selected */}
        {!selectedCause && causes && causes.length > 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Please select a cause above to continue with your donation.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
