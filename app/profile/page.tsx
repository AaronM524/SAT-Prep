import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileContent } from "@/components/profile-content"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user stats
  const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user.id)

  const { data: tests } = await supabase.from("practice_tests").select("*").eq("user_id", user.id).eq("completed", true)

  const { data: sessions } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30)

  return (
    <ProfileContent
      user={user}
      profile={profile}
      progress={progress || []}
      tests={tests || []}
      sessions={sessions || []}
    />
  )
}
