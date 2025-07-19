export interface Question {
  ID: number
  question: string
  type: "multipleChoice" | "concepts" | "calculations"
  category: string
  difficulty: string
  points: number
  options?: string[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const char of line) {
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

export function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  const questions: Question[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length >= 6) {
      const question: Question = {
        ID: Number.parseInt(values[0], 10),
        question: values[1],
        type: values[2] as Question["type"],
        category: values[3],
        difficulty: values[4],
        points: Number.parseInt(values[5], 10),
        options: values[6] ? values[6].split("|") : undefined,
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
      throw new Error(`Failed to fetch CSV: ${response.statusText}`)
    }
    const csvText = await response.text()
    return parseCSV(csvText)
  } catch (error) {
    console.error("Could not load questions from CSV, using fallback.", error)
    return [
      { ID: 1, question: "What is React?", type: "concepts", category: "Web", difficulty: "Easy", points: 5 },
      {
        ID: 2,
        question: "Select the primitive types in JS.",
        type: "multipleChoice",
        category: "JS",
        difficulty: "Medium",
        points: 10,
        options: ["string", "object", "number"],
      },
    ]
  }
}
