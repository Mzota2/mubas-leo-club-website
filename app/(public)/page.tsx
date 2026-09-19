"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart, Users, Target, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { media } from "@/lib/media"

export default function HomePage() {

  return (
    <div className="flex flex-col">
      {/* Hero Section with Video/Image Background */}
      <section className="relative flex  max-h-[900px] items-center justify-center overflow-hidden py-24">
        {/* Background Image/Video */}
        <div className="absolute inset-0 z-0">
          <Image
            src={media.photos.homeHero}
            alt="Leo Club members serving the community"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
          <div className="absolute inset-0 bg-gradient-leo-primary opacity-70 z-10" />
          {/* Optional: Uncomment to use video instead of image */}
          {/* <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video> */}
         
        </div>

        {/* Hero Content */}
        <div className="container relative z-20 px-4 text-center text-white max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 text-balance leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              We are serving a world in need.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 max-w-3xl mx-auto text-pretty font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              One act of kindness at a time.
            </p>
            <p className="text-sm sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto text-white/90 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              Join MUBAS Leo Club in making a difference through community service and youth development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
              <Button asChild size="lg" className="w-full text-base px-8 py-6 bg-white text-leo-primary hover:bg-gray-100 font-semibold sm:w-auto">
                <Link href="/membership">
                  Join Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full text-base px-8 py-6 bg-white/10 text-white border-2 border-white hover:bg-white hover:text-leo-primary font-semibold backdrop-blur-sm sm:w-auto"
              >
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden animate-bounce sm:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Making a Global Impact</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
              Together, we're creating positive change in our communities
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {[
              { number: "100+", label: "Active Members", icon: Users },
              { number: "20+", label: "Service Projects", icon: Heart },
              { number: "10+", label: "Events Annually", icon: Calendar },
              { number: "10K+", label: "Lives Impacted", icon: TrendingUp },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-leo-primary mb-4">
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-leo-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uniting for Good Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Uniting for Good</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Lions and Leos make a difference every day, everywhere we serve. With the support of our international
                association and our global foundation, we are changing lives, communities and the world we share.
              </p>
              <Button asChild size="lg" className="bg-leo-primary hover:bg-leo-primary-dark text-white">
                <Link href="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative h-56 md:h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src={media.photos.impact}
                alt="Leo Club members serving the community"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Serving with Purpose Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Serving with Purpose</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Lions serve their local communities in so many ways, and we're uniting to serve key global causes and
              special initiatives to address some of the greatest challenges facing our world today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Health Causes",
                description: "Blood donation drives, health awareness campaigns, and medical outreach programs that save lives and improve community health.",
                icon: Heart,
                color: "bg-red-500",
                image: media.photos.bloodDonation,
              },
              {
                title: "Environment",
                description: "Tree planting, clean-up campaigns, and environmental education initiatives that protect our planet for future generations.",
                icon: Target,
                color: "bg-green-500",
                image: media.photos.environment,
              },
              {
                title: "Community Service",
                description: "Educational support, youth empowerment, and community development projects that transform lives and build stronger communities.",
                icon: Users,
                color: "bg-purple-500",
                image: media.photos.communityService,
              },
            ].map((service) => (
              <Card key={service.title} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group rounded-lg">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 ${service.color} opacity-20`} />
                  <div className={`absolute top-4 right-4 ${service.color} w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Section - Prominently Featured */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Shop & Support</h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Shop our exclusive Leo Club merchandise and support our fundraising efforts. All proceeds go directly to community service projects.
              </p>
            </div>
            <Button asChild size="lg" className="mt-4 md:mt-0 bg-leo-primary hover:bg-leo-primary-dark text-white">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Leo Club T-Shirts",
                description: "Show your pride with our official Leo Club t-shirts. Available in multiple colors and sizes.",
                image: media.merch.tshirtGreen,
                price: "From MWK 15,000",
              },
              {
                title: "Golf Shirts",
                description: "Professional golf shirts perfect for meetings and formal events. Premium quality materials.",
                image: media.merch.golfBlack,
                price: "From MWK 25,000",
              },
              {
                title: "Accessories & More",
                description: "Caps, mugs, calendars, and more. Complete your Leo Club collection today.",
                image: media.merch.capRed,
                price: "Various prices",
              },
            ].map((item) => (
              <Card key={item.title} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group rounded-md">
                <div className="relative h-56 overflow-hidden bg-white">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-3">{item.description}</p>
                  <p className="text-leo-primary font-medium">{item.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Upcoming Events</h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                Join us in our various community service activities and make a lasting impact
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="mt-4 md:mt-0 border-leo-primary text-leo-primary hover:bg-leo-primary hover:text-white">
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Blood Donation Drive",
                description: "Join us for our annual blood donation campaign at Community Hospital",
                date: "July 15, 2025",
                image: media.posters.bloodDrive,
              },
              {
                title: "Environmental Clean-up",
                description: "Community clean-up and tree planting initiative at Michiru Mountain",
                date: "July 22, 2025",
                image: media.activities.planting[1],
              },
              {
                title: "Youth Empowerment Workshop",
                description: "Leadership and skills development workshop for young people",
                date: "August 5, 2025",
                image: media.photos.youthLeadership,
              },
            ].map((event) => (
              <Card key={event.title} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group rounded-lg">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Our Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how we're making a difference in communities across Malawi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative h-56 overflow-hidden rounded-md shadow-xl md:h-[400px]">
              <video
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                controls={false}
                aria-label="Leo Club community impact"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={media.videos.impactVideo} type="video/mp4" />
              </video>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Transforming Communities</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Through our dedicated members and volunteers, we've organized hundreds of service projects that have
                directly impacted thousands of lives. From health initiatives to environmental conservation, we're
                building a better future together.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-leo-primary mt-2 flex-shrink-0" />
                  <span>200+ units of blood collected for local hospitals</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-leo-primary mt-2 flex-shrink-0" />
                  <span>1,000+ trees planted in our community</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-leo-primary mt-2 flex-shrink-0" />
                  <span>500+ students supported with educational materials</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-leo-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container px-4 text-center relative z-10 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-base md:text-2xl mb-10 max-w-3xl mx-auto text-white/90">
            Join our community of young leaders dedicated to serving and transforming lives. Together, we can create a
            better world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full text-base px-8 py-6 bg-white text-leo-primary hover:bg-gray-100 font-semibold sm:w-auto">
              <Link href="/membership">
                Join Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full text-base px-8 py-6 bg-white/10 text-white border-2 border-white hover:bg-white hover:text-leo-primary font-semibold backdrop-blur-sm sm:w-auto"
            >
              <Link href="/donate">Support Our Cause</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
