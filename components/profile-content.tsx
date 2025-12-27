"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Profile, UserProgress, PracticeTest, StudySession } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  UserIcon,
  Target,
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle2,
  Save,
  Mail,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ProfileContentProps {
  user: User
  profile: Profile | null
  progress: UserProgress[]
  tests: PracticeTest[]
  sessions: StudySession[]
}

export function ProfileContent({ user, profile, progress, tests, sessions }: ProfileContentProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    target_score: profile?.target_score || 1200,
    current_score: profile?.current_score || null,
    test_date: profile?.test_date || "",
    study_minutes_per_day: profile?.study_minutes_per_day || 20,
  })

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate stats
  const totalQuestions = progress.reduce((acc, p) => acc + p.questions_attempted, 0)
  const totalCorrect = progress.reduce((acc, p) => acc + p.questions_correct, 0)
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const totalMinutesStudied = sessions.reduce((acc, s) => acc + s.minutes_studied, 0)
  const topicsStudied = progress.length
  const testsCompleted = tests.length
  const avgTestScore =
    tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + (t.score || 0), 0) / tests.length) : 0

  // Get initials for avatar
  const initials =
    formData.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    "U"

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
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and study goals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{formData.display_name || "Set your name"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Goals Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Study Goals
                </CardTitle>
                <CardDescription>Set your SAT targets and study preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Target Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Target SAT Score</Label>
                    <span className="text-3xl font-bold text-primary">{formData.target_score}</span>
                  </div>
                  <Slider
                    value={[formData.target_score]}
                    onValueChange={([value]) => setFormData((prev) => ({ ...prev, target_score: value }))}
                    min={400}
                    max={1600}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>400</span>
                    <span>1000</span>
                    <span>1600</span>
                  </div>
                </div>

                {/* Current Score */}
                <div className="space-y-2">
                  <Label htmlFor="current_score">Current/Practice Score (optional)</Label>
                  <Input
                    id="current_score"
                    type="number"
                    min={400}
                    max={1600}
                    value={formData.current_score || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        current_score: e.target.value ? Number.parseInt(e.target.value) : null,
                      }))
                    }
                    placeholder="Enter your current score"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your most recent practice test or official SAT score
                  </p>
                </div>

                {/* Test Date */}
                <div className="space-y-2">
                  <Label htmlFor="test_date">SAT Test Date</Label>
                  <Input
                    id="test_date"
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, test_date: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">When are you planning to take the SAT?</p>
                </div>

                {/* Daily Study Goal */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Daily Study Goal</Label>
                    <span className="text-2xl font-bold">{formData.study_minutes_per_day} min</span>
                  </div>
                  <Slider
                    value={[formData.study_minutes_per_day]}
                    onValueChange={([value]) => setFormData((prev) => ({ ...prev, study_minutes_per_day: value }))}
                    min={10}
                    max={120}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>Questions Done</span>
                  </div>
                  <span className="text-2xl font-bold">{totalQuestions}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Overall Accuracy</span>
                  </div>
                  <span className="text-2xl font-bold">{overallAccuracy}%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>Minutes Studied</span>
                  </div>
                  <span className="text-2xl font-bold">{totalMinutesStudied}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <span>Topics Studied</span>
                  </div>
                  <span className="text-2xl font-bold">{topicsStudied}</span>
                </div>
              </CardContent>
            </Card>

            {/* Test Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Test Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-primary mb-1">{testsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Tests Completed</p>
                </div>

                {testsCompleted > 0 && (
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <p className="text-3xl font-bold mb-1">{avgTestScore}%</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                )}

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/practice">Take a Practice Test</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (27 - i))
                    const dateStr = date.toISOString().split("T")[0]
                    const session = sessions.find((s) => s.date === dateStr)
                    const hasActivity = !!session

                    return (
                      <div
                        key={i}
                        className={`w-full aspect-square rounded-sm ${hasActivity ? "bg-primary" : "bg-muted"}`}
                        title={dateStr}
                      />
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">Last 4 weeks of activity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
