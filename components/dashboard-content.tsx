"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile, PracticeTest, UserProgress, StudySession } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, BookOpen, Target, TrendingUp, Play, LogOut } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardContentProps {
  user: User
  profile: Profile | null
  recentTests: PracticeTest[]
  progress: (UserProgress & { topic: { name: string; category: { name: string } } })[]
  todaySession: StudySession | null
}

export function DashboardContent({ user, profile, recentTests, progress, todaySession }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const totalQuestionsAttempted = progress.reduce((acc, p) => acc + p.questions_attempted, 0)
  const totalCorrect = progress.reduce((acc, p) => acc + p.questions_correct, 0)
  const overallAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) : 0

  const studyGoal = profile?.study_minutes_per_day || 20
  const minutesStudied = todaySession?.minutes_studied || 0
  const studyProgress = Math.min((minutesStudied / studyGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">PrepAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.target_score
              ? `You're working toward a ${profile.target_score} SAT score.`
              : "Set your target score to get a personalized study plan."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Score</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.current_score || "---"}</div>
              <p className="text-xs text-muted-foreground">Target: {profile?.target_score || "Not set"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Questions Done</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestionsAttempted}</div>
              <p className="text-xs text-muted-foreground">{totalCorrect} correct answers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAccuracy}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tests Taken</CardTitle>
              <CardDescription>Practice tests completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentTests.length}</div>
              <p className="text-xs text-muted-foreground">Practice tests completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Goal */}
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s Study Goal</CardTitle>
                <CardDescription>
                  {minutesStudied} / {studyGoal} minutes studied today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={studyProgress} className="h-3 mb-4" />
                <Button asChild className="w-full">
                  <Link href="/practice">
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice Session
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Practice Tests</CardTitle>
                <CardDescription>Your latest test attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tests taken yet. Start your first practice test!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentTests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{test.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(test.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {test.completed ? (
                            <>
                              <p className="font-bold text-lg">{test.score}%</p>
                              <p className="text-sm text-muted-foreground">
                                {test.correct_answers}/{test.total_questions} correct
                              </p>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/practice/${test.id}`}>Continue</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Topic Progress</CardTitle>
                <CardDescription>Your mastery by topic</CardDescription>
              </CardHeader>
              <CardContent>
                {progress.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Practice questions to see your progress</p>
                ) : (
                  <div className="space-y-4">
                    {progress.slice(0, 5).map((p) => (
                      <div key={p.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{p.topic?.name}</span>
                          <span className="text-sm text-muted-foreground">{Math.round(p.accuracy)}%</span>
                        </div>
                        <Progress value={p.accuracy} className="h-2" />
                      </div>
                    ))}
                    <Button variant="link" className="w-full p-0 h-auto" asChild>
                      <Link href="/progress">View all progress →</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/practice">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Practice Questions
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/study-plan">
                    <Target className="w-4 h-4 mr-2" />
                    View Study Plan
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/profile">
                    <Star className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
