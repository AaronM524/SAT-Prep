import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProgressContent } from "@/components/progress-content"

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch progress with topic and category info
  const { data: progress } = await supabase
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

  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Fetch topics
  const { data: topics } = await supabase.from("topics").select("*").order("name")

  // Fetch recent practice tests
  const { data: recentTests } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(10)

  // Fetch study sessions for chart
  const { data: sessions } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30)

  return (
    <ProgressContent
      user={user}
      profile={profile}
      progress={progress || []}
      categories={categories || []}
      topics={topics || []}
      recentTests={recentTests || []}
      sessions={sessions || []}
    />
  )
}
