import { Card, CardContent } from "@/components/ui/card"
import { Users, Award, Target, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="py-10 md:py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About MUBAS Leo Club</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering young leaders to serve their communities and develop skills for life
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-leo-primary/30">
            <CardContent className="p-5 md:p-8">
              <Target className="h-12 w-12 text-leo-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To empower young people to become leaders and serve their communities through volunteerism and
                humanitarian service. We believe in creating opportunities for youth to develop essential life skills
                while making a positive impact on society.
              </p>
            </CardContent>
          </Card>

          <Card className="border-leo-secondary/30">
            <CardContent className="p-5 md:p-8">
              <Heart className="h-12 w-12 text-leo-secondary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To be the leading youth service organization in Malawi, recognized for developing compassionate leaders
                who transform communities through innovative service projects, sustainable development initiatives, and
                unwavering commitment to positive change.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Leadership",
                description: "Developing skills to guide and inspire others",
                icon: Users,
              },
              {
                title: "Excellence",
                description: "Striving for quality in all our endeavors",
                icon: Award,
              },
              {
                title: "Service",
                description: "Commitment to community and humanitarian causes",
                icon: Heart,
              },
              {
                title: "Integrity",
                description: "Acting with honesty and strong moral principles",
                icon: Target,
              },
            ].map((value) => (
              <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <value.icon className="h-10 w-10 mx-auto mb-4 text-leo-primary" />
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-50 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Our History</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              MUBAS Leo Club was established as part of the global Leo Club network, which has been empowering youth
              since 1957. Our club brings together students from the Malawi University of Business and Applied Sciences
              who share a passion for community service and leadership development.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Over the years, we have grown from a small group of dedicated individuals to a thriving organization that
              has impacted thousands of lives through various service projects. Our members have organized blood
              donation drives, environmental conservation initiatives, educational programs, and numerous community
              development projects.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, MUBAS Leo Club stands as a beacon of youth leadership in Malawi, continuing to inspire and mobilize
              young people to make a difference in their communities while developing the skills and character needed to
              become tomorrow's leaders.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
