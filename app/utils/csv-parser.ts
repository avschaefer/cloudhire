export interface Question {
  ID: number
  type: string
  category: string
  difficulty: string
  points: number
  question: string
  options?: string
}

export async function fetchAndParseQuestionsCsv(): Promise<Question[]> {
  try {
    console.log("Fetching questions from local CSV file...")
    const response = await fetch("/Questions.csv")

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("CSV file loaded, parsing content...")

    return parseCSV(csvText)
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    throw new Error("Failed to load exam questions")
  }
}

function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])

    if (values.length >= headers.length) {
      const question: Question = {
        ID: Number.parseInt(values[0]) || i,
        question: values[1] || "",
        type: values[2] || "Open Ended",
        category: values[3] || "General",
        difficulty: values[4] || "Medium",
        points: Number.parseInt(values[5]) || 10,
        options: values[6] || undefined,
      }

      questions.push(question)
    }
  }

  return questions
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function getInitialExamData(questions: Question[]) {
  const examData = {
    multipleChoice: {} as { [key: string]: string },
    concepts: {} as { [key: string]: string },
    calculations: {} as { [key: string]: string },
  }

  questions.forEach((question) => {
    if (question.type === "multipleChoice") {
      examData.multipleChoice[question.ID.toString()] = ""
    } else if (question.type === "concepts") {
      examData.concepts[question.ID.toString()] = ""
    } else if (question.type === "calculations") {
      examData.calculations[`${question.ID}-answer`] = ""
      examData.calculations[`${question.ID}-explanation`] = ""
    }
  })

  return examData
}
