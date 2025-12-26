"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Category, Topic, UserProgress } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star, BookOpen, ArrowLeft, Play, Filter, Zap, Target, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PracticeContentProps {
  user: User
  categories: Category[]
  topics: (Topic & { category: Category })[]
  progress: (UserProgress & { topic: { name: string; category: { name: string } } })[]
}

export function PracticeContent({ user, categories, topics, progress }: PracticeContentProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [questionCount, setQuestionCount] = useState([10])
  const [difficulty, setDifficulty] = useState<string>("all")
  const [isStarting, setIsStarting] = useState(false)

  const filteredTopics = selectedCategory === "all" ? topics : topics.filter((t) => t.category_id === selectedCategory)

  // Get weak topics for recommendations
  const weakTopics = progress
    .filter((p) => p.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  const handleStartPractice = async () => {
    setIsStarting(true)
    try {
      const response = await fetch("/api/practice-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: selectedCategory === "all" ? null : selectedCategory,
          topic_id: selectedTopic === "all" ? null : selectedTopic,
          num_questions: questionCount[0],
          title:
            selectedTopic !== "all"
              ? topics.find((t) => t.id === selectedTopic)?.name
              : selectedCategory !== "all"
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Mixed Practice",
        }),
      })
      const data = await response.json()
      if (data.test) {
        router.push(`/practice/${data.test.id}`)
      }
    } catch (error) {
      console.error("Failed to start practice:", error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleQuickStart = async (topicId: string, topicName: string) => {
    setIsStarting(true)
    try {
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
    } catch (error) {
      console.error("Failed to start practice:", error)
    } finally {
      setIsStarting(false)
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice Questions</h1>
          <p className="text-muted-foreground">Choose your focus area and start practicing to improve your SAT score</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Practice Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Start Cards */}
            {weakTopics.length > 0 && (
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <CardTitle>Recommended Practice</CardTitle>
                  </div>
                  <CardDescription>Focus on these topics to improve your weak areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weakTopics.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleQuickStart(p.topic_id, p.topic?.name || "Practice")}
                        disabled={isStarting}
                        className="p-4 rounded-xl border border-border/50 bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {p.topic?.category?.name}
                          </span>
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                            {Math.round(p.accuracy)}%
                          </Badge>
                        </div>
                        <p className="font-semibold mb-2 group-hover:text-primary transition-colors">{p.topic?.name}</p>
                        <Progress value={p.accuracy} className="h-1.5" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Practice Setup */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <CardTitle>Custom Practice Session</CardTitle>
                </div>
                <CardDescription>Configure your practice session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) => {
                      setSelectedCategory(v)
                      setSelectedTopic("all")
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {filteredTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Number of Questions</label>
                    <span className="text-2xl font-bold text-primary">{questionCount[0]}</span>
                  </div>
                  <Slider
                    value={questionCount}
                    onValueChange={setQuestionCount}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 questions</span>
                    <span>50 questions</span>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "1", label: "Easy" },
                      { value: "3", label: "Medium" },
                      { value: "5", label: "Hard" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                          difficulty === opt.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartPractice}
                  disabled={isStarting}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isStarting ? "Starting..." : "Start Practice Session"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Questions Done</span>
                  </div>
                  <span className="font-bold">{progress.reduce((acc, p) => acc + p.questions_attempted, 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Accuracy</span>
                  </div>
                  <span className="font-bold">
                    {progress.length > 0
                      ? Math.round(progress.reduce((acc, p) => acc + p.accuracy, 0) / progress.length)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Topics Studied</span>
                  </div>
                  <span className="font-bold">{progress.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Topics by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Topics by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => {
                  const categoryTopics = topics.filter((t) => t.category_id === category.id)
                  const categoryProgress = progress.filter((p) => categoryTopics.some((t) => t.id === p.topic_id))
                  const avgAccuracy =
                    categoryProgress.length > 0
                      ? Math.round(categoryProgress.reduce((acc, p) => acc + p.accuracy, 0) / categoryProgress.length)
                      : 0

                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">{avgAccuracy}%</Badge>
                      </div>
                      <Progress value={avgAccuracy} className="h-2" />
                      <p className="text-xs text-muted-foreground">{categoryTopics.length} topics</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>Practice for 20-30 minutes daily for best results</p>
                </div>
                <div className="flex gap-2">
                  <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>Focus on your weakest topics first</p>
                </div>
                <div className="flex gap-2">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p>Review explanations for wrong answers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
