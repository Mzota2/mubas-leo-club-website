import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"
import { media } from "@/lib/media"

export default function LeadersPage() {
  const leaders = [
    {
      name: "Leo Mzota",
      position: "Membership Chair",
      bio: "Passionate about youth empowerment and community development. Leading membership growth initiatives.",
      image: media.people.male,
      email: "leo.mzota@mubasleoclub.org",
      phone: "+265 981 81 93 89",
    },
    {
      name: "Jane Banda",
      position: "President",
      bio: "Dedicated leader with a vision for expanding our community impact and fostering youth leadership.",
      image: media.people.female,
      email: "jane.banda@mubasleoclub.org",
    },
    {
      name: "John Phiri",
      position: "Vice President",
      bio: "Committed to organizing impactful service projects and building strong community partnerships.",
      image: media.people.male2,
      email: "john.phiri@mubasleoclub.org",
    },
    {
      name: "Grace Chirwa",
      position: "Secretary",
      bio: "Ensuring smooth operations and effective communication within the club and with external stakeholders.",
      image: media.people.female2,
      email: "grace.chirwa@mubasleoclub.org",
    },
  ]

  return (
    <div className="py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Leaders</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the dedicated individuals guiding MUBAS Leo Club towards excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((leader) => (
            <Card key={leader.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-leo-primary to-leo-secondary" />
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                  <p className="text-leo-primary font-medium">{leader.position}</p>
                </div>
                <p className="text-gray-600 text-sm text-center mb-4 leading-relaxed">{leader.bio}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${leader.email}`} className="hover:text-leo-primary transition-colors">
                      {leader.email}
                    </a>
                  </div>
                  {leader.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{leader.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
