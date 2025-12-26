import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Get user's study sessions
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const days = Number.parseInt(searchParams.get("days") || "7")

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate.toISOString().split("T")[0])
    .order("date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}

// Log a study session
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { minutes_studied, questions_practiced, topics_covered } = body
  const today = new Date().toISOString().split("T")[0]

  // Get existing session for today
  const { data: existing } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  const { data: session, error } = await supabase
    .from("study_sessions")
    .upsert({
      user_id: user.id,
      date: today,
      minutes_studied: (existing?.minutes_studied || 0) + (minutes_studied || 0),
      questions_practiced: (existing?.questions_practiced || 0) + (questions_practiced || 0),
      topics_covered: [...new Set([...(existing?.topics_covered || []), ...(topics_covered || [])])],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ session })
}
