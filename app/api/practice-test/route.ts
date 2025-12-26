import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Create a new practice test
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { category_id, topic_id, num_questions = 10, title } = body

  // Get random questions based on filters
  let query = supabase.from("questions").select("id")

  if (category_id) {
    query = query.eq("category_id", category_id)
  }
  if (topic_id) {
    query = query.eq("topic_id", topic_id)
  }

  const { data: questions, error: qError } = await query.limit(num_questions)

  if (qError || !questions?.length) {
    return NextResponse.json({ error: "No questions found" }, { status: 400 })
  }

  // Create the practice test
  const { data: test, error: testError } = await supabase
    .from("practice_tests")
    .insert({
      user_id: user.id,
      title: title || "Practice Test",
      total_questions: questions.length,
    })
    .select()
    .single()

  if (testError) {
    return NextResponse.json({ error: testError.message }, { status: 500 })
  }

  // Add questions to the test
  const testQuestions = questions.map((q, index) => ({
    test_id: test.id,
    question_id: q.id,
    order_index: index + 1,
  }))

  const { error: tqError } = await supabase.from("test_questions").insert(testQuestions)

  if (tqError) {
    return NextResponse.json({ error: tqError.message }, { status: 500 })
  }

  return NextResponse.json({ test })
}

// Get user's practice tests
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: tests, error } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tests })
}
