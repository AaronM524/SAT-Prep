import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PracticeContent } from "@/components/practice-content"

export default async function PracticePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch categories and topics
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const { data: topics } = await supabase
    .from("topics")
    .select(`
      *,
      category:categories(*)
    `)
    .order("name")

  // Fetch user progress for recommendations
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

  return <PracticeContent user={user} categories={categories || []} topics={topics || []} progress={progress || []} />
}
