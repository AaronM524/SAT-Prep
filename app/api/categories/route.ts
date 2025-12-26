import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: categories, error: catError } = await supabase.from("categories").select("*").order("name")

  if (catError) {
    return NextResponse.json({ error: catError.message }, { status: 500 })
  }

  const { data: topics, error: topicError } = await supabase.from("topics").select("*").order("name")

  if (topicError) {
    return NextResponse.json({ error: topicError.message }, { status: 500 })
  }

  return NextResponse.json({ categories, topics })
}
