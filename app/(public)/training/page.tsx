"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, FileText, Play, Download, Clock } from "lucide-react"
import { useTrainings } from "@/lib/hooks/use-trainings"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function TrainingPage() {
  const { data: trainings, isLoading } = useTrainings()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "All" },
    { id: "leadership", label: "Leadership" },
    { id: "community-service", label: "Community Service" },
    { id: "leo-club-basics", label: "Leo Club Basics" },
    { id: "project-management", label: "Project Management" },
  ]

  const filteredTrainings =
    selectedCategory === "all"
      ? trainings
      : trainings?.filter((t) => t.category.toLowerCase() === selectedCategory)

  return (
    <div className="py-16">
      <div className="container px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Training & Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            There is one new member program: register as joining, then complete modules and quizzes in the member portal.
          </p>
        </div>

        <Card className="mb-12 border-leo-primary/20 bg-gradient-to-br from-leo-primary/10 to-leo-secondary/10">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-2">New Member Training Program</h2>
            <p className="text-gray-700 mb-4 max-w-3xl">
              Prospective members pay a once-off joining fee, then complete this program — YouTube lessons, videos, and in-app articles, with a quiz after each module. Score 50% or higher to become a full Leo. Already a member? Choose that at registration.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-leo-primary text-white hover:bg-leo-primary-dark">
                <Link href="/auth/register?redirect=/portal/training">Register and start training</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/portal/training">Continue in the portal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={
                selectedCategory === cat.id
                  ? "bg-leo-primary hover:bg-leo-primary-dark text-white"
                  : ""
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Training Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTrainings && filteredTrainings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    {training.videoUrl && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {training.documentUrl && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <FileText className="h-3 w-3 mr-1" />
                        Document
                      </Badge>
                    )}
                  </div>
                  {training.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{training.duration}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{training.description}</p>
                  <div className="flex gap-2">
                    {training.videoUrl && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-leo-primary hover:bg-leo-primary-dark text-white"
                      >
                        <a href={training.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </a>
                      </Button>
                    )}
                    {training.documentUrl && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <a href={training.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No training materials available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-12 bg-gradient-to-br from-leo-primary/10 to-leo-secondary/10 border-leo-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Want to Become a Member?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              These training materials are available to everyone, but as a member you'll get access to 
              exclusive content, quizzes, and personalized learning paths.
            </p>
            <Button asChild size="lg" className="bg-leo-primary hover:bg-leo-primary-dark text-white">
              <Link href="/portal/training">Open training program</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
