import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Users, Award, Heart } from "lucide-react"

export default function MembershipPage() {
  const benefits = [
    "Leadership development opportunities",
    "Networking with like-minded youth",
    "Community service experience",
    "Access to exclusive events and training",
    "Certificate of membership",
    "Opportunity to make a real impact",
  ]

  const requirements = [
    "Be between 18-30 years old",
    "Be a student or alumni of MUBAS",
    "Commitment to community service",
    "Willingness to participate in club activities",
    "Pay annual membership fee",
  ]

  return (
    <div className="py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join MUBAS Leo Club</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Become part of a dynamic community of young leaders committed to making a difference
          </p>
        </div>

        {/* Membership Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-leo-primary mb-2" />
              <CardTitle>Regular Member</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Active participation in all club activities and events</p>
              <p className="text-3xl font-bold text-leo-primary mb-1">MWK 10,000</p>
              <p className="text-sm text-gray-600">per year</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-leo-primary">
            <CardHeader>
              <Award className="h-10 w-10 text-leo-primary mb-2" />
              <CardTitle>Executive Member</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Leadership roles and additional responsibilities</p>
              <p className="text-3xl font-bold text-leo-primary mb-1">MWK 15,000</p>
              <p className="text-sm text-gray-600">per year</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-10 w-10 text-leo-primary mb-2" />
              <CardTitle>Honorary Member</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">For alumni and supporters of the club</p>
              <p className="text-3xl font-bold text-leo-primary mb-1">MWK 20,000</p>
              <p className="text-sm text-gray-600">per year</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits & Requirements */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Membership Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-leo-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How to Join */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">How to Join</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Register",
                description: "Create an account and join as a prospective Leo",
              },
              {
                step: "2",
                title: "Complete training",
                description: "Study each module and pass the quiz with at least 50%",
              },
              {
                step: "3",
                title: "Become a Leo",
                description: "A passing score promotes you to full membership",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-leo-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="bg-leo-primary hover:bg-leo-primary-dark text-white">
            <Link href="/auth/register?redirect=/portal/training">Register and start training</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
