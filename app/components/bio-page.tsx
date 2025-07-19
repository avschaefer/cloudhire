"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, Briefcase, GraduationCap, Clock, FileText } from "lucide-react"
import type { UserBio } from "../utils/types"
import { Badge } from "@/components/ui/badge"

interface BioPageProps {
  userBio: UserBio
  onUpdateBio: (bio: UserBio) => void
}

export default function BioPage({ userBio, onUpdateBio }: BioPageProps) {
  const [bio, setBio] = useState<UserBio>({
    firstName: userBio.firstName || "",
    lastName: userBio.lastName || "",
    email: userBio.email || "",
    phone: userBio.phone || "",
    position: userBio.position || "",
    experience: userBio.experience || "",
    education: userBio.education || "",
    linkedIn: userBio.linkedIn || "",
    resume: userBio.resume || undefined,
    transcript: userBio.transcript || undefined,
  })
  const [errors, setErrors] = useState<Partial<UserBio>>({})
  const [uploadErrors, setUploadErrors] = useState<{ resume?: string; transcript?: string }>({})
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const transcriptInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBio((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    const newErrors: Partial<UserBio> = {}

    if (!bio.firstName.trim()) newErrors.firstName = "First name is required"
    if (!bio.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!bio.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bio.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!bio.phone.trim()) newErrors.phone = "Phone number is required"
    if (!bio.position.trim()) newErrors.position = "Position is required"
    if (!bio.experience.trim()) newErrors.experience = "Experience level is required"
    if (!bio.education.trim()) newErrors.education = "Education is required"

    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      onUpdateBio(bio)
    }
  }

  const handleFileUpload = (field: "resume" | "transcript", file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf") {
        setUploadErrors((prev) => ({ ...prev, [field]: "Please upload a PDF file only" }))
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setUploadErrors((prev) => ({ ...prev, [field]: "File size must be less than 10MB" }))
        return
      }
      setUploadErrors((prev) => ({ ...prev, [field]: "" }))
      setBio((prev) => ({ ...prev, [field]: file }))
    } else {
      setBio((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pt-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Personal Information</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Please provide your information below. This helps us understand your background and tailor the assessment
          experience.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Candidate Information
          </CardTitle>
          <CardDescription>Please fill out your details to proceed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={bio.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={errors.firstName ? "border-red-500" : ""}
                required
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={bio.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={errors.lastName ? "border-red-500" : ""}
                required
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={bio.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                name="phone"
                value={bio.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className={errors.phone ? "border-red-500" : ""}
                required
              />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              Position Applied For *
            </Label>
            <Input
              id="position"
              name="position"
              value={bio.position}
              onChange={handleChange}
              placeholder="e.g., Mechanical Engineer, Design Engineer, etc."
              className={errors.position ? "border-red-500" : ""}
              required
            />
            {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Years of Experience *
            </Label>
            <Select value={bio.experience} onValueChange={(value) => setBio({ ...bio, experience: value })}>
              <SelectTrigger className={errors.experience ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years (Entry Level)</SelectItem>
                <SelectItem value="2-3">2-3 years (Junior)</SelectItem>
                <SelectItem value="4-6">4-6 years (Mid-Level)</SelectItem>
                <SelectItem value="7-10">7-10 years (Senior)</SelectItem>
                <SelectItem value="10+">10+ years (Expert)</SelectItem>
              </SelectContent>
            </Select>
            {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="education" className="text-sm font-medium flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              Highest Education *
            </Label>
            <Textarea
              id="education"
              name="education"
              value={bio.education}
              onChange={handleChange}
              placeholder="Describe your education background"
              className={errors.education ? "border-red-500" : ""}
              required
            />
            {errors.education && <p className="text-sm text-red-600">{errors.education}</p>}
          </div>

          {/* Optional LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedIn" className="text-sm font-medium">
              LinkedIn Profile (Optional)
            </Label>
            <Input
              id="linkedIn"
              name="linkedIn"
              value={bio.linkedIn}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          {/* File Uploads */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Supporting Documents (Optional)</h3>

            {/* Resume Upload */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="resume" className="text-sm font-medium flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Resume (PDF)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  ref={resumeInputRef}
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload("resume", e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resumeInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {bio.resume ? "Change Resume" : "Upload Resume"}
                </Button>
                {bio.resume && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{bio.resume.name}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleFileUpload("resume", null)
                        if (resumeInputRef.current) resumeInputRef.current.value = ""
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              {uploadErrors.resume && <p className="text-sm text-red-600">{uploadErrors.resume}</p>}
              <p className="text-xs text-gray-500">PDF format only, max 10MB</p>
            </div>

            {/* Transcript Upload */}
            <div className="space-y-2">
              <Label htmlFor="transcript" className="text-sm font-medium flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                Academic Transcript (PDF)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  ref={transcriptInputRef}
                  id="transcript"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload("transcript", e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => transcriptInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  {bio.transcript ? "Change Transcript" : "Upload Transcript"}
                </Button>
                {bio.transcript && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{bio.transcript.name}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleFileUpload("transcript", null)
                        if (transcriptInputRef.current) transcriptInputRef.current.value = ""
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              {uploadErrors.transcript && <p className="text-sm text-red-600">{uploadErrors.transcript}</p>}
              <p className="text-xs text-gray-500">PDF format only, max 10MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                All fields marked with * are required. Your information will be kept confidential.
              </p>
              <Button type="submit" onClick={handleSubmit} size="lg" className="bg-blue-600 hover:bg-blue-700 w-full">
                Continue to Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
