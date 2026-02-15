import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Leaf, GraduationCap, Users, DollarSign, Smile } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      title: "Health Causes",
      icon: Heart,
      description:
        "We organize blood donation drives, health awareness campaigns, and medical outreach programs to improve community health and wellbeing.",
      initiatives: [
        "Annual Blood Donation Drive",
        "HIV/AIDS Awareness Campaigns",
        "First Aid Training Programs",
        "Health Screening Events",
      ],
      color: "text-red-500",
    },
    {
      title: "Environment Causes",
      icon: Leaf,
      description:
        "Environmental conservation is at the heart of our mission. We lead initiatives to protect and preserve our natural resources.",
      initiatives: [
        "Tree Planting Campaigns",
        "Community Clean-up Drives",
        "Environmental Education",
        "Waste Management Programs",
      ],
      color: "text-green-500",
    },
    {
      title: "General Community Service",
      icon: Users,
      description:
        "We engage in various community development projects that address local needs and create positive social impact.",
      initiatives: [
        "Educational Support Programs",
        "Youth Mentorship",
        "Community Development Projects",
        "Skills Training Workshops",
      ],
      color: "text-purple-500",
    },
    {
      title: "Fundraising",
      icon: DollarSign,
      description: "We organize fundraising events to support our service projects and help community members in need.",
      initiatives: ["Charity Galas", "Fundraising Campaigns", "Donation Drives", "Corporate Partnerships"],
      color: "text-cyan-500",
    },
    {
      title: "Social Activities",
      icon: Smile,
      description:
        "Building strong bonds among members through social events, networking opportunities, and team-building activities.",
      initiatives: ["Member Socials", "Networking Events", "Team Building Activities", "Annual Club Celebrations"],
      color: "text-amber-500",
    },
    {
      title: "General Meetings",
      icon: GraduationCap,
      description:
        "Regular meetings to plan activities, share updates, and develop member skills through training and workshops.",
      initiatives: [
        "Monthly General Meetings",
        "Leadership Training",
        "Skills Development Workshops",
        "Planning Sessions",
      ],
      color: "text-orange-500",
    },
  ]

  return (
    <div className="py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the various ways we serve our community and develop future leaders
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <service.icon className={`h-10 w-10 ${service.color}`} />
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <div>
                  <h4 className="font-semibold mb-2">Key Initiatives:</h4>
                  <ul className="space-y-1">
                    {service.initiatives.map((initiative, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-leo-primary mt-1">•</span>
                        <span>{initiative}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
