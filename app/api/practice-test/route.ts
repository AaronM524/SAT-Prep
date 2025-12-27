import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Create a new practice test
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { category_id, topic_id, num_questions = 10, title } = body

    // Fetch all eligible questions
    let query = supabase.from("questions").select("id")

    if (category_id) query = query.eq("category_id", category_id)
    if (topic_id) query = query.eq("topic_id", topic_id)

    const { data: allQuestions, error: qError } = await query

    if (qError) {
      console.error("Supabase query error:", qError.message)
      return NextResponse.json({ error: qError.message }, { status: 500 })
    }

    if (!allQuestions?.length) {
      return NextResponse.json({ error: "No questions found" }, { status: 400 })
    }

    // ✅ Randomize locally so every session differs
    const shuffled = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, num_questions)

    // Create new test entry
    const { data: test, error: testError } = await supabase
      .from("practice_tests")
      .insert({
        user_id: user.id,
        title: title || "Practice Test",
        total_questions: shuffled.length,
      })
      .select()
      .single()

    if (testError) {
      console.error("Error creating practice test:", testError.message)
      return NextResponse.json({ error: testError.message }, { status: 500 })
    }

    // Add test questions
    const testQuestions = shuffled.map((q, index) => ({
      test_id: test.id,
      question_id: q.id,
      order_index: index + 1,
    }))

    const { error: tqError } = await supabase
      .from("test_questions")
      .insert(testQuestions)

    if (tqError) {
      console.error("Error inserting test questions:", tqError.message)
      return NextResponse.json({ error: tqError.message }, { status: 500 })
    }

    return NextResponse.json({ test })
  } catch (err: any) {
    console.error("Unhandled error in POST /practice-test:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// Get user's practice tests
export async function GET() {
  const supabase = await createClient()

  try {
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
      console.error("Error fetching tests:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tests })
  } catch (err: any) {
    console.error("Unhandled error in GET /practice-test:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
