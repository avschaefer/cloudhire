import type { ExamData } from "../page"

export interface Question {
  ID: string
  type: "multipleChoice" | "concepts" | "calculations"
  difficulty: string
  question: string
  correctAnswer: string // For MCQs and calculations
  options?: string[] // For multiple choice questions
}

export async function fetchAndParseQuestionsCsv(): Promise<Question[]> {
  try {
    // Use local CSV file from public folder
    const response = await fetch("/Questions.csv")
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }
    const text = await response.text()
    console.log("Raw CSV content:", text.substring(0, 500)) // Debug log
    const questions = parseCsv(text)
    console.log("Parsed questions:", questions) // Debug log
    return questions
  } catch (error) {
    console.error("Error fetching or parsing questions CSV:", error)
    return [] // Return empty array on error
  }
}

function parseCsv(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  if (lines.length === 0) return []

  // Parse headers and clean them
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  console.log("CSV Headers:", headers) // Debug log

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    if (values.length !== headers.length) {
      console.warn(`Skipping malformed CSV line ${i}: expected ${headers.length} columns, got ${values.length}`)
      continue
    }

    const question: Partial<Question> = {}
    const options: string[] = []

    headers.forEach((header, index) => {
      const value = values[index].replace(/"/g, "").trim()

      // Map headers to question properties
      if (header.toLowerCase() === "id") {
        question.ID = value
      } else if (header.toLowerCase() === "type") {
        // Map the type values to our expected types
        if (value.toLowerCase() === "multiple choice" || value.toLowerCase() === "multiplechoice") {
          question.type = "multipleChoice"
        } else if (value.toLowerCase() === "concept" || value.toLowerCase() === "concepts") {
          question.type = "concepts"
        } else if (value.toLowerCase() === "calculation" || value.toLowerCase() === "calculations") {
          question.type = "calculations"
        } else {
          question.type = value as any
        }
      } else if (header.toLowerCase() === "difficulty") {
        question.difficulty = value
      } else if (header.toLowerCase() === "question") {
        question.question = value
      } else if (header.toLowerCase() === "answer") {
        question.correctAnswer = value
      } else if (header.toLowerCase().startsWith("option") && value && value !== "") {
        // Handle option columns (option 1, option 2, etc.)
        options.push(value)
      }
    })

    // Add options for multiple choice questions
    if (question.type === "multipleChoice" && options.length > 0) {
      question.options = options
    }

    // Basic validation for required fields
    if (question.ID && question.type && question.question) {
      questions.push(question as Question)
      console.log(`Added question ${question.ID} of type ${question.type}`) // Debug log
    } else {
      console.warn("Skipping question due to missing required fields:", {
        ID: question.ID,
        type: question.type,
        question: question.question ? "present" : "missing",
      })
    }
  }

  console.log(`Successfully loaded ${questions.length} questions from CSV`)
  console.log(
    "Question types:",
    questions.map((q) => `${q.ID}: ${q.type}`),
  ) // Debug log
  return questions
}

// A simple CSV line parser that handles quoted commas
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let inQuote = false
  let currentField = ""

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuote = !inQuote
    } else if (char === "," && !inQuote) {
      result.push(currentField.trim())
      currentField = ""
    } else {
      currentField += char
    }
  }
  result.push(currentField.trim()) // Add the last field
  return result
}

// Helper to get initial exam data structure from questions
export function getInitialExamData(questions: Question[]): ExamData {
  const initialData: ExamData = {
    multipleChoice: {},
    concepts: {},
    calculations: {},
  }

  questions.forEach((q) => {
    if (q.type === "multipleChoice") {
      initialData.multipleChoice[q.ID] = ""
    } else if (q.type === "concepts") {
      initialData.concepts[q.ID] = ""
    } else if (q.type === "calculations") {
      initialData.calculations[`${q.ID}-answer`] = ""
      initialData.calculations[`${q.ID}-explanation`] = ""
    }
  })

  console.log("Initial exam data structure:", initialData) // Debug log
  return initialData
}
