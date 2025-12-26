import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent tests
  const { data: recentTests } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(5)

  // Fetch progress
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

  // Fetch today's study session
  const today = new Date().toISOString().split("T")[0]
  const { data: todaySession } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  return (
    <DashboardContent
      user={user}
      profile={profile}
      recentTests={recentTests || []}
      progress={progress || []}
      todaySession={todaySession}
    />
  )
}
