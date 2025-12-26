import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get("category_id")
  const topicId = searchParams.get("topic_id")
  const difficulty = searchParams.get("difficulty")
  const limit = searchParams.get("limit") || "10"

  let query = supabase.from("questions").select("*")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }
  if (topicId) {
    query = query.eq("topic_id", topicId)
  }
  if (difficulty) {
    query = query.eq("difficulty", Number.parseInt(difficulty))
  }

  const { data, error } = await query.limit(Number.parseInt(limit))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ questions: data })
}
