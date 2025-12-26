export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Topic {
  id: string
  category_id: string
  name: string
  description: string | null
  created_at: string
}

export interface Question {
  id: string
  category_id: string
  topic_id: string | null
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: "A" | "B" | "C" | "D"
  explanation: string | null
  difficulty: number
  created_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  target_score: number | null
  test_date: string | null
  current_score: number | null
  study_minutes_per_day: number
  created_at: string
  updated_at: string
}

export interface PracticeTest {
  id: string
  user_id: string
  title: string
  total_questions: number
  correct_answers: number
  score: number | null
  time_spent_seconds: number
  completed: boolean
  started_at: string
  completed_at: string | null
}

export interface TestQuestion {
  id: string
  test_id: string
  question_id: string
  user_answer: "A" | "B" | "C" | "D" | null
  is_correct: boolean | null
  time_spent_seconds: number
  order_index: number
  answered_at: string | null
  question?: Question
}

export interface UserProgress {
  id: string
  user_id: string
  topic_id: string
  questions_attempted: number
  questions_correct: number
  accuracy: number
  last_practiced: string
  mastery_level: number
  topic?: Topic
}

export interface StudyPlan {
  id: string
  user_id: string
  topic_id: string
  priority: "low" | "medium" | "high"
  scheduled_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  topic?: Topic
}

export interface StudySession {
  id: string
  user_id: string
  date: string
  minutes_studied: number
  questions_practiced: number
  topics_covered: string[]
  created_at: string
}
