"use client"

import { useState, useEffect } from "react"
import WelcomePage from "./components/welcome-page"
import BioPage from "./components/bio-page"
import BehavioralPage from "./components/behavioral-page"
import ExamPage from "./components/exam-page"
import SubmissionPage from "./components/submission-page"
import type { BehavioralAnswers } from "./components/behavioral-page"
import { submitUserBio } from "@/lib/supabaseSubmissions"
import { uploadFile } from "@/lib/supabaseStorage"
import { fetchMultipleChoiceQuestions, fetchResponseQuestions, fetchCalculationQuestions } from "@/lib/supabaseQueries"
import { submitMultipleChoiceResponse, submitGeneralResponse, submitCalculationResponse } from "@/lib/supabaseSubmissions"

export interface Question {
  ID: string
  question: string
  type: "multipleChoice" | "concepts" | "calculations"
  options?: string[]
  difficulty?: string
}

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
  id?: number
  phone?: string
  education?: string
  linkedIn?: string
}

export interface ExamData {
  multipleChoice: Record<string, string>
  concepts: Record<string, string>
  calculations: Record<string, string>
}

export interface ExamResult {
  userBio: UserBio
  behavioralAnswers: BehavioralAnswers
  answers: any[]
  totalScore: number
  maxScore: number
  completedAt: string
  timeSpent: number
}

type Step = "welcome" | "bio" | "behavioral" | "exam" | "submission"

const initialBio: UserBio = {
  firstName: "",
  lastName: "",
  email: "",
  position: "",
  experience: "",
  motivation: "",
  educationalDegree: "",
}

export default function ExamApp() {
  const [step, setStep] = useState<Step>("welcome")
  const [userBio, setUserBio] = useState<UserBio | null>(null)
  const [behavioralAnswers, setBehavioralAnswers] = useState<BehavioralAnswers>({})
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadQuestions() {
      const mc = await fetchMultipleChoiceQuestions();
      const concepts = await fetchResponseQuestions();
      const calc = await fetchCalculationQuestions();

      const all: Question[] = [
        ...mc.map(q => ({ ID: q.id.toString(), question: q.question, type: "multipleChoice" as const, options: [q.option_a, q.option_b, q.option_c, q.option_d] })),
        ...concepts.map(q => ({ ID: q.id.toString(), question: q.question, type: "concepts" as const })),
        ...calc.map(q => ({ ID: q.id.toString(), question: q.question, type: "calculations" as const })),
      ];
      setQuestions(all);
    }
    loadQuestions();
  }, []);

  const handleBioNext = async (bio: UserBio) => {
    const userId = await submitUserBio({
      firstName: bio.firstName,
      lastName: bio.lastName,
      email: bio.email,
      position: bio.position,
      motivation: bio.motivation,
      educationalDegree: bio.educationalDegree,
      experience: bio.experience
    });

    if (bio.resume) await uploadFile({ file: bio.resume, userId, fileType: 'resume' });
    if (bio.transcript) await uploadFile({ file: bio.transcript, userId, fileType: 'transcript' });
    if (bio.projects) await uploadFile({ file: bio.projects, userId, fileType: 'project' });

    setUserBio({ ...bio, id: userId });
    setStep("behavioral");
  };

  const handleBehavioralNext = (answers: BehavioralAnswers) => {
    setBehavioralAnswers(answers)
    setStep("exam")
  }

  const handleExamComplete = async (_exam: ExamData, timeSpent: number) => {
    if (!userBio || !userBio.id) return;
    const userId = userBio.id;

    setLoading(true);
    try {
      // Submit multiple choice
      for (const [idStr, response] of Object.entries(_exam.multipleChoice)) {
        await submitMultipleChoiceResponse({ questionId: Number(idStr), userResponse: response, aiResponse: '', userId });
      }
      // Submit concepts (general response)
      for (const [idStr, response] of Object.entries(_exam.concepts)) {
        await submitGeneralResponse({ questionId: Number(idStr), userResponse: response, aiResponse: '', userId });
      }
      // Submit calculations (assuming single field, adjust if numerical and text separate)
      for (const [idStr, response] of Object.entries(_exam.calculations)) {
        await submitCalculationResponse({ questionId: Number(idStr), userResponseNumerical: parseFloat(response), userResponseText: '', aiResponse: '', userId });
      }

      const result: ExamResult = {
        userBio,
        behavioralAnswers,
        answers: [],
        totalScore: 0,
        maxScore: 0,
        completedAt: new Date().toISOString(),
        timeSpent,
      };
      setExamResult(result);
      setStep("submission");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-lg">Processing results…</p>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomePage onNext={() => setStep("bio")} />
      case "bio":
        return <BioPage onNext={handleBioNext} userBio={userBio ?? initialBio} />
      case "behavioral":
        return <BehavioralPage onNext={handleBehavioralNext} userId={userBio?.id ?? 0} />;
      case "exam":
        if (userBio) {
          return (
            <ExamPage
              initialExamData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
              userBio={userBio}
              questions={questions}
              onComplete={handleExamComplete}
              userId={userBio.id ?? 0}
            />
          )
        }
        return null
      case "submission":
        if (examResult) {
          return (
            <SubmissionPage
              userBio={examResult.userBio}
              examData={{ multipleChoice: {}, concepts: {}, calculations: {} }}
              totalTimeSpent={examResult.timeSpent}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  return <div className="min-h-screen bg-gray-50">{renderStep()}</div>
}
