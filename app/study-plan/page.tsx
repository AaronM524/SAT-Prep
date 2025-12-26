import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudyPlanContent } from "@/components/study-plan-content"

export default async function StudyPlanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch study plans with topic and category info
  const { data: plans } = await supabase
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

  // Fetch user progress
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

  // Fetch categories for overview
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Fetch topics
  const { data: topics } = await supabase.from("topics").select("*").order("name")

  return (
    <StudyPlanContent
      user={user}
      profile={profile}
      plans={plans || []}
      progress={progress || []}
      categories={categories || []}
      topics={topics || []}
    />
  )
}
