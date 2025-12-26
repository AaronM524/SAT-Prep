"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Profile, StudyPlan, UserProgress, Category, Topic } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  ArrowLeft,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface StudyPlanWithTopic extends StudyPlan {
  topic: Topic & { category: Category }
}

interface ProgressWithTopic extends UserProgress {
  topic: Topic & { category: Category }
}

interface StudyPlanContentProps {
  user: User
  profile: Profile | null
  plans: StudyPlanWithTopic[]
  progress: ProgressWithTopic[]
  categories: Category[]
  topics: Topic[]
}

export function StudyPlanContent({ user, profile, plans, progress, categories, topics }: StudyPlanContentProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPlans, setCurrentPlans] = useState(plans)

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      if (data.plans) {
        setCurrentPlans(data.plans)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to generate plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleComplete = async (planId: string, completed: boolean) => {
    await fetch("/api/study-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId, completed }),
    })

    setCurrentPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, completed, completed_at: completed ? new Date().toISOString() : null } : p,
      ),
    )
  }

  const highPriorityPlans = currentPlans.filter((p) => p.priority === "high" && !p.completed)
  const mediumPriorityPlans = currentPlans.filter((p) => p.priority === "medium" && !p.completed)
  const lowPriorityPlans = currentPlans.filter((p) => p.priority === "low" && !p.completed)
  const completedPlans = currentPlans.filter((p) => p.completed)

  // Calculate days until test
  const daysUntilTest = profile?.test_date
    ? Math.ceil((new Date(profile.test_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Get progress by category
  const categoryProgress = categories.map((category) => {
    const categoryTopics = topics.filter((t) => t.category_id === category.id)
    const categoryProgressData = progress.filter((p) => categoryTopics.some((t) => t.id === p.topic_id))
    const avgAccuracy =
      categoryProgressData.length > 0
        ? Math.round(categoryProgressData.reduce((acc, p) => acc + p.accuracy, 0) / categoryProgressData.length)
        : 0
    const totalAttempted = categoryProgressData.reduce((acc, p) => acc + p.questions_attempted, 0)

    return {
      ...category,
      accuracy: avgAccuracy,
      questionsAttempted: totalAttempted,
      topicsStudied: categoryProgressData.length,
      totalTopics: categoryTopics.length,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">PrepAI</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Study Plan</h1>
            <p className="text-muted-foreground">Personalized learning path based on your strengths and weaknesses</p>
          </div>
          <Button onClick={handleGeneratePlan} disabled={isGenerating} className="shrink-0">
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate New Plan"}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.target_score || "---"}</p>
                  <p className="text-sm text-muted-foreground">Target Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{daysUntilTest !== null ? `${daysUntilTest} days` : "---"}</p>
                  <p className="text-sm text-muted-foreground">Until Test Day</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedPlans.length}</p>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highPriorityPlans.length}</p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="priority" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="priority">By Priority</TabsTrigger>
                <TabsTrigger value="category">By Category</TabsTrigger>
              </TabsList>

              <TabsContent value="priority" className="space-y-6">
                {/* High Priority */}
                {highPriorityPlans.length > 0 && (
                  <Card className="border-red-500/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <CardTitle>High Priority</CardTitle>
                        <Badge variant="destructive" className="ml-auto">
                          {highPriorityPlans.length} topics
                        </Badge>
                      </div>
                      <CardDescription>Focus on these topics first - they need the most work</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {highPriorityPlans.map((plan) => (
                        <StudyPlanItem
                          key={plan.id}
                          plan={plan}
                          progress={progress.find((p) => p.topic_id === plan.topic_id)}
                          onToggleComplete={handleToggleComplete}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Medium Priority */}
                {mediumPriorityPlans.length > 0 && (
                  <Card className="border-amber-500/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <CardTitle>Medium Priority</CardTitle>
                        <Badge className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/30">
                          {mediumPriorityPlans.length} topics
                        </Badge>
                      </div>
                      <CardDescription>Maintain and improve these areas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mediumPriorityPlans.map((plan) => (
                        <StudyPlanItem
                          key={plan.id}
                          plan={plan}
                          progress={progress.find((p) => p.topic_id === plan.topic_id)}
                          onToggleComplete={handleToggleComplete}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Low Priority */}
                {lowPriorityPlans.length > 0 && (
                  <Card className="border-green-500/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <CardTitle>Low Priority</CardTitle>
                        <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-500/30">
                          {lowPriorityPlans.length} topics
                        </Badge>
                      </div>
                      <CardDescription>You are doing well in these areas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lowPriorityPlans.map((plan) => (
                        <StudyPlanItem
                          key={plan.id}
                          plan={plan}
                          progress={progress.find((p) => p.topic_id === plan.topic_id)}
                          onToggleComplete={handleToggleComplete}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {currentPlans.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Study Plan Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate a personalized study plan based on your progress
                      </p>
                      <Button onClick={handleGeneratePlan} disabled={isGenerating}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Plan
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="category" className="space-y-6">
                {categoryProgress.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{category.name}</CardTitle>
                        <Badge variant="outline">{category.accuracy}% accuracy</Badge>
                      </div>
                      <CardDescription>
                        {category.topicsStudied} of {category.totalTopics} topics studied
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Progress value={(category.topicsStudied / category.totalTopics) * 100} className="h-2 mb-4" />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span>{category.questionsAttempted} questions done</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>{category.accuracy}% accuracy</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/practice">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Practice Session
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/progress">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress Details
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/profile">
                    <Target className="w-4 h-4 mr-2" />
                    Update Goals
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Study Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-500">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Focus on High Priority</p>
                    <p className="text-muted-foreground">Spend most time on weak areas</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-500">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Maintain Medium Topics</p>
                    <p className="text-muted-foreground">Regular review prevents forgetting</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-green-500">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Review Strengths Weekly</p>
                    <p className="text-muted-foreground">Keep skills sharp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Topics */}
            {completedPlans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {completedPlans.slice(0, 5).map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between py-2">
                      <span className="text-sm line-through text-muted-foreground">{plan.topic?.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(plan.id, false)}
                        className="h-7 text-xs"
                      >
                        Undo
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

interface StudyPlanItemProps {
  plan: StudyPlanWithTopic
  progress?: ProgressWithTopic
  onToggleComplete: (planId: string, completed: boolean) => void
}

function StudyPlanItem({ plan, progress, onToggleComplete }: StudyPlanItemProps) {
  const router = useRouter()

  const handlePractice = async () => {
    const response = await fetch("/api/practice-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_id: plan.topic_id,
        num_questions: 10,
        title: plan.topic?.name,
      }),
    })
    const data = await response.json()
    if (data.test) {
      router.push(`/practice/${data.test.id}`)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
      <button
        onClick={() => onToggleComplete(plan.id, !plan.completed)}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {plan.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{plan.topic?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{plan.topic?.category?.name}</span>
          {progress && (
            <>
              <span>•</span>
              <span>{Math.round(progress.accuracy)}% accuracy</span>
              <span>•</span>
              <span>{progress.questions_attempted} done</span>
            </>
          )}
          {!progress && <span>Not started</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {progress && (
          <div className="w-16">
            <Progress value={progress.accuracy} className="h-2" />
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handlePractice}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Practice
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
