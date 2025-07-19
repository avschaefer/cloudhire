export interface Question {
  ID: number
  question: string
  type: string
  category: string
  difficulty: string
  points: number
  options?: string
  answer?: string
}

export function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())

    if (values.length >= headers.length) {
      const question: Question = {
        ID: Number.parseInt(values[0]) || i,
        question: values[1] || "",
        type: values[2] || "Open Ended",
        category: values[3] || "General",
        difficulty: values[4] || "Medium",
        points: Number.parseInt(values[5]) || 10,
        options: values[6] || undefined,
        answer: values[7] || undefined,
      }

      questions.push(question)
    }
  }

  return questions
}

export async function fetchAndParseQuestionsCsv(): Promise<Question[]> {
  try {
    const response = await fetch("/Questions.csv")
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error("Error loading questions:", error)

    // Fallback questions if CSV fails to load
    return [
      {
        ID: 1,
        question: "What is the difference between let, const, and var in JavaScript?",
        type: "Open Ended",
        category: "JavaScript",
        difficulty: "Medium",
        points: 15,
      },
      {
        ID: 2,
        question: "Which of the following is NOT a valid HTTP method?",
        type: "Multiple Choice",
        category: "Web Development",
        difficulty: "Easy",
        points: 10,
        options: "GET, POST, DELETE, SEND",
        answer: "SEND",
      },
      {
        ID: 3,
        question: "Calculate the time complexity of a binary search algorithm and explain your reasoning.",
        type: "Calculation",
        category: "Algorithms",
        difficulty: "Hard",
        points: 20,
      },
    ]
  }
}

export function getInitialExamData(questions: Question[]) {
  return {
    multipleChoice: {},
    concepts: {},
    calculations: {},
  }
}
