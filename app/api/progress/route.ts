import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get user progress across all topics
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: progress, error } = await supabase
    .from("user_progress")
    .select(`
      *,
      topic:topics(
        *,
        category:categories(*)
      )
    `)
    .eq("user_id", user.id)
    .order("last_practiced", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ progress })
}

// Update progress for a topic
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { topic_id, questions_attempted, questions_correct } = body

  // Get current progress
  const { data: existing } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("topic_id", topic_id)
    .single()

  const newAttempted = (existing?.questions_attempted || 0) + questions_attempted
  const newCorrect = (existing?.questions_correct || 0) + questions_correct
  const accuracy = newAttempted > 0 ? (newCorrect / newAttempted) * 100 : 0

  // Calculate mastery level based on accuracy and attempts
  let masteryLevel = 1
  if (newAttempted >= 50 && accuracy >= 90) masteryLevel = 5
  else if (newAttempted >= 30 && accuracy >= 80) masteryLevel = 4
  else if (newAttempted >= 20 && accuracy >= 70) masteryLevel = 3
  else if (newAttempted >= 10 && accuracy >= 60) masteryLevel = 2

  const { data: progress, error } = await supabase
    .from("user_progress")
    .upsert({
      user_id: user.id,
      topic_id,
      questions_attempted: newAttempted,
      questions_correct: newCorrect,
      accuracy,
      mastery_level: masteryLevel,
      last_practiced: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ progress })
}
