"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Briefcase, Clock, Target } from "lucide-react"

export interface UserBio {
  firstName: string
  lastName: string
  email: string
  position: string
  experience: string
  motivation: string
}

interface BioPageProps {
  onNext: (bio: UserBio) => void
  userBio: UserBio
}

export default function BioPage({ onNext, userBio }: BioPageProps) {
  const [formData, setFormData] = useState<UserBio>({
    firstName: userBio.firstName || "",
    lastName: userBio.lastName || "",
    email: userBio.email || "",
    position: userBio.position || "",
    experience: userBio.experience || "",
    motivation: userBio.motivation || "",
  })

  const [errors, setErrors] = useState<Partial<UserBio>>({})

  const handleInputChange = (field: keyof UserBio, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<UserBio> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.position.trim()) newErrors.position = "Position is required"
    if (!formData.experience) newErrors.experience = "Experience level is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <User className="w-4 h-4" />
              Personal Information
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Yourself</h1>
            <p className="text-lg text-gray-600">
              Please provide some basic information to personalize your assessment experience.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal & Professional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position Applied For *
                  </Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="e.g., Senior Software Engineer, DevOps Engineer"
                    className={errors.position ? "border-red-500" : ""}
                  />
                  {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Years of Experience *
                  </Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger className={errors.experience ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
                      <SelectItem value="2-3">2-3 years (Junior)</SelectItem>
                      <SelectItem value="4-6">4-6 years (Mid-Level)</SelectItem>
                      <SelectItem value="7-10">7-10 years (Senior)</SelectItem>
                      <SelectItem value="10+">10+ years (Expert/Lead)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
                </div>

                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    What motivates you in this role? (Optional)
                  </Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange("motivation", e.target.value)}
                    placeholder="Tell us what excites you about this opportunity..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">{formData.motivation.length}/500 characters</p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Continue to Assessment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
