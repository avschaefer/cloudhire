export interface Question {
  ID: string
  type: "multipleChoice" | "concepts" | "calculations"
  difficulty: string
  question: string
  options?: string[]
  answer?: string
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

    return parseQuestionsFromCsv(csvText)
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error)
    throw new Error("Failed to load exam questions")
  }
}

function parseQuestionsFromCsv(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV file appears to be empty or invalid")
  }

  // Parse headers and normalize them
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
  console.log("CSV Headers found:", headers)

  // Create header mapping for case-insensitive lookup
  const headerMap: { [key: string]: number } = {}
  headers.forEach((header, index) => {
    headerMap[header.toLowerCase()] = index
  })

  const questions: Question[] = []

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCsvLine(lines[i])

      if (values.length < headers.length) {
        console.warn(`Row ${i + 1} has fewer values than headers, skipping`)
        continue
      }

      // Extract basic question data
      const id = getValue(values, headerMap, "id")
      const type = getValue(values, headerMap, "type")
      const difficulty = getValue(values, headerMap, "difficulty")
      const question = getValue(values, headerMap, "question")
      const answer = getValue(values, headerMap, "answer")

      if (!id || !type || !question) {
        console.warn(`Row ${i + 1} missing required fields, skipping`)
        continue
      }

      // Normalize question type
      let normalizedType: "multipleChoice" | "concepts" | "calculations"
      const typeStr = type.toLowerCase().trim()

      if (typeStr.includes("multiple") || typeStr.includes("choice")) {
        normalizedType = "multipleChoice"
      } else if (typeStr.includes("concept")) {
        normalizedType = "concepts"
      } else if (typeStr.includes("calculation") || typeStr.includes("calc")) {
        normalizedType = "calculations"
      } else {
        console.warn(`Unknown question type "${type}" in row ${i + 1}, defaulting to concepts`)
        normalizedType = "concepts"
      }

      // Extract options for multiple choice questions
      let options: string[] | undefined
      if (normalizedType === "multipleChoice") {
        options = []
        for (let j = 1; j <= 4; j++) {
          const option = getValue(values, headerMap, `option ${j}`) || getValue(values, headerMap, `option${j}`)
          if (option && option.trim()) {
            options.push(option.trim())
          }
        }
        if (options.length === 0) {
          options = undefined
        }
      }

      const parsedQuestion: Question = {
        ID: id.trim(),
        type: normalizedType,
        difficulty: difficulty?.trim() || "Medium",
        question: question.trim(),
        options,
        answer: answer?.trim(),
      }

      questions.push(parsedQuestion)
      console.log(`Parsed question ${id}: ${normalizedType}`)
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error)
      continue
    }
  }

  console.log(`Successfully parsed ${questions.length} questions`)

  // Log summary by type
  const summary = questions.reduce(
    (acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  console.log("Question summary by type:", summary)

  if (questions.length === 0) {
    throw new Error("No valid questions found in CSV file")
  }

  return questions
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Add the last field
  values.push(current.trim())

  return values
}

function getValue(values: string[], headerMap: { [key: string]: number }, key: string): string | undefined {
  const index = headerMap[key.toLowerCase()]
  if (index !== undefined && index < values.length) {
    return values[index]?.replace(/"/g, "").trim() || undefined
  }
  return undefined
}

export function getInitialExamData(questions: Question[]) {
  const examData = {
    multipleChoice: {} as { [key: string]: string },
    concepts: {} as { [key: string]: string },
    calculations: {} as { [key: string]: string },
  }

  questions.forEach((question) => {
    if (question.type === "multipleChoice") {
      examData.multipleChoice[question.ID] = ""
    } else if (question.type === "concepts") {
      examData.concepts[question.ID] = ""
    } else if (question.type === "calculations") {
      examData.calculations[`${question.ID}-answer`] = ""
      examData.calculations[`${question.ID}-explanation`] = ""
    }
  })

  return examData
}
