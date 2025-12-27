"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Profile, UserProgress, Category, Topic, PracticeTest, StudySession } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProgressWithTopic extends UserProgress {
  topic: Topic & { category: Category }
}

interface ProgressContentProps {
  user: User
  profile: Profile | null
  progress: ProgressWithTopic[]
  categories: Category[]
  topics: Topic[]
  recentTests: PracticeTest[]
  sessions: StudySession[]
}

export function ProgressContent({
  user,
  profile,
  progress,
  categories,
  topics,
  recentTests,
  sessions,
}: ProgressContentProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Calculate overall stats
  const totalQuestions = progress.reduce((acc, p) => acc + p.questions_attempted, 0)
  const totalCorrect = progress.reduce((acc, p) => acc + p.questions_correct, 0)
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.minutes_studied, 0)

  // Filter progress by category
  const filteredProgress =
    selectedCategory === "all" ? progress : progress.filter((p) => p.topic?.category?.id === selectedCategory)

  // Sort progress by different criteria
  const strongTopics = [...filteredProgress].filter((p) => p.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy)
  const weakTopics = [...filteredProgress].filter((p) => p.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy)
  const recentTopics = [...filteredProgress].slice(0, 5)

  // Calculate category stats
  const categoryStats = categories.map((category) => {
    const categoryTopics = topics.filter((t) => t.category_id === category.id)
    const categoryProgress = progress.filter((p) => categoryTopics.some((t) => t.id === p.topic_id))
    const totalAttempted = categoryProgress.reduce((acc, p) => acc + p.questions_attempted, 0)
    const totalCorrect2 = categoryProgress.reduce((acc, p) => acc + p.questions_correct, 0)
    const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect2 / totalAttempted) * 100) : 0

    return {
      ...category,
      accuracy: avgAccuracy,
      questionsAttempted: totalAttempted,
      topicsStudied: categoryProgress.length,
      totalTopics: categoryTopics.length,
    }
  })

  // Get mastery distribution
  const masteryDistribution = {
    mastered: progress.filter((p) => p.mastery_level === 5).length,
    proficient: progress.filter((p) => p.mastery_level === 4).length,
    developing: progress.filter((p) => p.mastery_level === 3).length,
    learning: progress.filter((p) => p.mastery_level === 2).length,
    beginner: progress.filter((p) => p.mastery_level === 1).length,
  }

  const handlePractice = async (topicId: string, topicName: string) => {
    const response = await fetch("/api/practice-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_id: topicId,
        num_questions: 10,
        title: topicName,
      }),
    })
    const data = await response.json()
    if (data.test) {
      router.push(`/practice/${data.test.id}`)
    }
  }

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

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/prepai-mark-1024.png"
                  alt="PrepAI"
                  width={26}
                  height={26}
                  priority
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold">PrepAI</span>
            </Link>
          </div>

          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your improvement across all SAT topics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questions Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overallAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progress.length}</p>
                  <p className="text-sm text-muted-foreground">Topics Studied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totalMinutesStudied / 60)}h</p>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="shrink-0"
              >
                All Topics
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="shrink-0"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="weak">Needs Work</TabsTrigger>
                <TabsTrigger value="strong">Strengths</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredProgress.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Progress Yet</h3>
                      <p className="text-muted-foreground mb-4">Start practicing to see your progress here</p>
                      <Button asChild>
                        <Link href="/practice">Start Practicing</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProgress.map((p) => <TopicProgressCard key={p.id} progress={p} onPractice={handlePractice} />)
                )}
              </TabsContent>

              <TabsContent value="weak" className="space-y-4">
                {weakTopics.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-muted-foreground">Great job! No weak areas found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  weakTopics.map((p) => <TopicProgressCard key={p.id} progress={p} onPractice={handlePractice} />)
                )}
              </TabsContent>

              <TabsContent value="strong" className="space-y-4">
                {strongTopics.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Keep practicing to build your strengths!</p>
                    </CardContent>
                  </Card>
                ) : (
                  strongTopics.map((p) => <TopicProgressCard key={p.id} progress={p} onPractice={handlePractice} />)
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {recentTopics.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent activity. Start practicing!</p>
                    </CardContent>
                  </Card>
                ) : (
                  recentTopics.map((p) => <TopicProgressCard key={p.id} progress={p} onPractice={handlePractice} />)
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mastery Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Mastery Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MasteryBar
                  label="Mastered"
                  count={masteryDistribution.mastered}
                  total={progress.length}
                  color="bg-green-500"
                />
                <MasteryBar
                  label="Proficient"
                  count={masteryDistribution.proficient}
                  total={progress.length}
                  color="bg-blue-500"
                />
                <MasteryBar
                  label="Developing"
                  count={masteryDistribution.developing}
                  total={progress.length}
                  color="bg-amber-500"
                />
                <MasteryBar
                  label="Learning"
                  count={masteryDistribution.learning}
                  total={progress.length}
                  color="bg-orange-500"
                />
                <MasteryBar
                  label="Beginner"
                  count={masteryDistribution.beginner}
                  total={progress.length}
                  color="bg-red-500"
                />
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          cat.accuracy >= 80
                            ? "border-green-500/30 text-green-600"
                            : cat.accuracy >= 60
                              ? "border-amber-500/30 text-amber-600"
                              : "border-red-500/30 text-red-600"
                        }
                      >
                        {cat.accuracy}%
                      </Badge>
                    </div>
                    <Progress value={cat.accuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {cat.topicsStudied}/{cat.totalTopics} topics • {cat.questionsAttempted} questions
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tests completed yet</p>
                ) : (
                  recentTests.slice(0, 5).map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{test.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.completed_at && new Date(test.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            (test.score || 0) >= 80
                              ? "text-green-500"
                              : (test.score || 0) >= 60
                                ? "text-amber-500"
                                : "text-red-500"
                          }`}
                        >
                          {test.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {test.correct_answers}/{test.total_questions}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface TopicProgressCardProps {
  progress: ProgressWithTopic
  onPractice: (topicId: string, topicName: string) => void
}

function TopicProgressCard({ progress, onPractice }: TopicProgressCardProps) {
  const accuracyColor =
    progress.accuracy >= 80 ? "text-green-500" : progress.accuracy >= 60 ? "text-amber-500" : "text-red-500"

  const TrendIcon = progress.accuracy >= 80 ? ArrowUpRight : progress.accuracy >= 60 ? Minus : ArrowDownRight

  const masteryLabels = ["Beginner", "Learning", "Developing", "Proficient", "Mastered"]

  return (
    <Card className="hover:border-primary/30 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {progress.topic?.category?.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {masteryLabels[progress.mastery_level - 1]}
              </Badge>
            </div>
            <h3 className="font-semibold mb-2">{progress.topic?.name}</h3>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {progress.questions_attempted} done
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {progress.questions_correct} correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                {progress.questions_attempted - progress.questions_correct} wrong
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-4 h-4 ${accuracyColor}`} />
              <span className={`text-2xl font-bold ${accuracyColor}`}>{Math.round(progress.accuracy)}%</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onPractice(progress.topic_id, progress.topic?.name || "Practice")}
            >
              Practice
            </Button>
          </div>
        </div>

        <Progress value={progress.accuracy} className="h-2 mt-4" />
      </CardContent>
    </Card>
  )
}

interface MasteryBarProps {
  label: string
  count: number
  total: number
  color: string
}

function MasteryBar({ label, count, total, color }: MasteryBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
