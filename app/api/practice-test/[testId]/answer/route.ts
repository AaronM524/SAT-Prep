import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Submit an answer for a question
export async function POST(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { question_id, answer, time_spent_seconds } = body

  // Verify the test belongs to the user
  const { data: test } = await supabase
    .from("practice_tests")
    .select("id")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single()

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 })
  }

  // Get the correct answer
  const { data: question } = await supabase.from("questions").select("correct_answer").eq("id", question_id).single()

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  const isCorrect = answer === question.correct_answer

  // Update the test question
  const { data: testQuestion, error } = await supabase
    .from("test_questions")
    .update({
      user_answer: answer,
      is_correct: isCorrect,
      time_spent_seconds: time_spent_seconds || 0,
      answered_at: new Date().toISOString(),
    })
    .eq("test_id", testId)
    .eq("question_id", question_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    testQuestion,
    is_correct: isCorrect,
    correct_answer: question.correct_answer,
  })
}
