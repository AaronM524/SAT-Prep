import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get user's study plan
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: plans, error } = await supabase
    .from("study_plans")
    .select(`
      *,
      topic:topics(
        *,
        category:categories(*)
      )
    `)
    .eq("user_id", user.id)
    .order("priority", { ascending: false })
    .order("scheduled_date")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plans })
}

// Generate a study plan based on progress
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get all topics
  const { data: topics } = await supabase.from("topics").select("*")

  // Get user progress
  const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user.id)

  if (!topics) {
    return NextResponse.json({ error: "No topics found" }, { status: 400 })
  }

  // Clear existing incomplete plans
  await supabase.from("study_plans").delete().eq("user_id", user.id).eq("completed", false)

  // Create new study plans prioritizing weak areas
  const progressMap = new Map(progress?.map((p) => [p.topic_id, p]) || [])

  const plans = topics.map((topic) => {
    const topicProgress = progressMap.get(topic.id)
    let priority: "low" | "medium" | "high" = "medium"

    if (!topicProgress || topicProgress.questions_attempted < 5) {
      priority = "high" // New topic, high priority
    } else if (topicProgress.accuracy < 60) {
      priority = "high" // Struggling, high priority
    } else if (topicProgress.accuracy < 80) {
      priority = "medium"
    } else {
      priority = "low" // Doing well
    }

    return {
      user_id: user.id,
      topic_id: topic.id,
      priority,
      scheduled_date: new Date().toISOString().split("T")[0],
    }
  })

  const { data: newPlans, error } = await supabase
    .from("study_plans")
    .insert(plans)
    .select(`
      *,
      topic:topics(
        *,
        category:categories(*)
      )
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plans: newPlans })
}

// Mark a plan as complete
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { plan_id, completed } = body

  const { data: plan, error } = await supabase
    .from("study_plans")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", plan_id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plan })
}
