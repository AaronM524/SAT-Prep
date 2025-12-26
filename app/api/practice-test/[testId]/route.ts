import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get a specific practice test with its questions
export async function GET(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the test
  const { data: test, error: testError } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single()

  if (testError) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 })
  }

  // Get test questions with question details
  const { data: testQuestions, error: tqError } = await supabase
    .from("test_questions")
    .select(`
      *,
      question:questions(*)
    `)
    .eq("test_id", testId)
    .order("order_index")

  if (tqError) {
    return NextResponse.json({ error: tqError.message }, { status: 500 })
  }

  return NextResponse.json({ test, questions: testQuestions })
}

// Update test (submit answers, complete test)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { completed, time_spent_seconds } = body

  const updates: Record<string, unknown> = {}

  if (completed !== undefined) {
    updates.completed = completed
    if (completed) {
      updates.completed_at = new Date().toISOString()

      // Calculate score
      const { data: testQuestions } = await supabase.from("test_questions").select("is_correct").eq("test_id", testId)

      if (testQuestions) {
        const correct = testQuestions.filter((q) => q.is_correct).length
        const total = testQuestions.length
        updates.correct_answers = correct
        updates.score = Math.round((correct / total) * 100)
      }
    }
  }

  if (time_spent_seconds !== undefined) {
    updates.time_spent_seconds = time_spent_seconds
  }

  const { data: test, error } = await supabase
    .from("practice_tests")
    .update(updates)
    .eq("id", testId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ test })
}
