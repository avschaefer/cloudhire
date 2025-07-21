"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, GraduationCap, FileText, Upload } from "lucide-react"

export interface UserBio {
  firstName: string
  lastName: string
  email: string
  position: string
  experience: string
  motivation: string
  educationalDegree: string
  resume?: File
  transcript?: File
  projects?: File
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
    educationalDegree: userBio.educationalDegree || "",
    resume: userBio.resume,
    transcript: userBio.transcript,
    projects: userBio.projects,
  })

  const [errors, setErrors] = useState<Partial<UserBio>>({})
  const [uploadErrors, setUploadErrors] = useState<{ resume?: string; transcript?: string; projects?: string }>({})

  const resumeInputRef = useRef<HTMLInputElement>(null)
  const transcriptInputRef = useRef<HTMLInputElement>(null)
  const projectsInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof UserBio, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = (field: "resume" | "transcript" | "projects", file: File | null) => {
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
      setFormData((prev) => ({ ...prev, [field]: file }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: undefined }))
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
    if (!formData.educationalDegree.trim()) newErrors.educationalDegree = "Educational degree is required"

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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
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
                    <Label htmlFor="lastName">Last Name</Label>
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
                  <Label htmlFor="email">Email Address</Label>
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

                {/* Educational Degree */}
                <div className="space-y-2">
                  <Label htmlFor="educationalDegree">Educational Degree(s)</Label>
                  <Input
                    id="educationalDegree"
                    type="text"
                    value={formData.educationalDegree}
                    onChange={(e) => handleInputChange("educationalDegree", e.target.value)}
                    placeholder="e.g., B.S Mechanical Engineering"
                    className={errors.educationalDegree ? "border-red-500" : ""}
                  />
                  {errors.educationalDegree && <p className="text-sm text-red-600">{errors.educationalDegree}</p>}
                </div>

                {/* Document Upload Section */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Document Upload (pdfs)
                  </h3>

                  <div className="space-y-6">
                    {/* Resume and Transcript Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Resume Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="resume" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Resume
                        </Label>
                        <div className="space-y-2">
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
                            className="w-full flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {formData.resume ? "Change Resume" : "Upload Resume"}
                          </Button>
                          {formData.resume && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {formData.resume.name}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleFileUpload("resume", null)
                                  if (resumeInputRef.current) resumeInputRef.current.value = ""
                                }}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                          {uploadErrors.resume && <p className="text-sm text-red-600">{uploadErrors.resume}</p>}
                        </div>
                      </div>

                      {/* Transcript Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="transcript" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Transcript
                        </Label>
                        <div className="space-y-2">
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
                            className="w-full flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {formData.transcript ? "Change Transcript" : "Upload Transcript"}
                          </Button>
                          {formData.transcript && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {formData.transcript.name}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleFileUpload("transcript", null)
                                  if (transcriptInputRef.current) transcriptInputRef.current.value = ""
                                }}
                                className="text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                          {uploadErrors.transcript && <p className="text-sm text-red-600">{uploadErrors.transcript}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Projects Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="projects" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Projects
                      </Label>
                      <div className="space-y-2">
                        <Input
                          ref={projectsInputRef}
                          id="projects"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload("projects", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => projectsInputRef.current?.click()}
                          className="w-full flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {formData.projects ? "Change Projects" : "Upload Projects"}
                        </Button>
                        {formData.projects && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {formData.projects.name}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleFileUpload("projects", null)
                                if (projectsInputRef.current) projectsInputRef.current.value = ""
                              }}
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        {uploadErrors.projects && <p className="text-sm text-red-600">{uploadErrors.projects}</p>}
                        <p className="text-xs text-gray-500">PDF format only, max 10MB</p>
                      </div>
                    </div>
                  </div>
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
