import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { TestContent } from "@/components/test-content"

export default async function TestPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the test
  const { data: test } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single()

  if (!test) {
    notFound()
  }

  // Fetch test questions with full question data
  const { data: testQuestions } = await supabase
    .from("test_questions")
    .select(`
      *,
      question:questions(
        *,
        topic:topics(*),
        category:categories(*)
      )
    `)
    .eq("test_id", testId)
    .order("order_index")

  return <TestContent user={user} test={test} testQuestions={testQuestions || []} />
}
