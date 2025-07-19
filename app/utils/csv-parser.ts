import type { Question } from "../page"

export function parseCSV(csvText: string): Question[] {
  const lines = csvText.trim().split("\n")
  const questions: Question[] = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    try {
      // Parse CSV line (handle quoted fields)
      const fields = parseCSVLine(line)

      if (fields.length >= 6) {
        const question: Question = {
          id: Number.parseInt(fields[0]) || i,
          question: fields[1] || `Question ${i}`,
          type: (fields[2] as Question["type"]) || "essay",
          points: Number.parseInt(fields[3]) || 10,
          category: fields[4] || "General",
          options: fields[5] ? fields[5].split("|").filter((opt) => opt.trim()) : undefined,
          correctAnswer: fields[6] || undefined,
        }

        questions.push(question)
      }
    } catch (error) {
      console.warn(`Error parsing CSV line ${i}:`, error)
    }
  }

  return questions.length > 0 ? questions : getFallbackQuestions()
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  fields.push(current.trim())
  return fields
}

function getFallbackQuestions(): Question[] {
  return [
    {
      id: 1,
      question: "What is your experience with cloud technologies and platforms?",
      type: "essay",
      points: 15,
      category: "Technical",
    },
    {
      id: 2,
      question: "Which programming language do you prefer for backend development?",
      type: "multiple-choice",
      options: ["JavaScript/Node.js", "Python", "Java", "Go", "C#", "Other"],
      points: 5,
      category: "Technical",
    },
    {
      id: 3,
      question:
        "Describe a challenging technical project you've worked on recently. What was your role and how did you overcome the challenges?",
      type: "essay",
      points: 20,
      category: "Experience",
    },
    {
      id: 4,
      question: "How do you approach debugging a complex issue in production?",
      type: "essay",
      points: 15,
      category: "Problem Solving",
    },
    {
      id: 5,
      question: "What is your preferred approach to version control?",
      type: "multiple-choice",
      options: ["Git with feature branches", "Git with trunk-based development", "Centralized VCS", "Other"],
      points: 5,
      category: "Development Practices",
    },
  ]
}
