export interface UserBio {
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  experience: string
  education: string
}

export interface ExamData {
  multipleChoice: { [key: string]: string }
  concepts: { [key: string]: string }
  calculations: { [key: string]: string }
}
