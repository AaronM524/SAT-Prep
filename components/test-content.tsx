"use client"

import { useState, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import type { PracticeTest, TestQuestion, Question, Topic, Category } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle, Lightbulb, Flag, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface TestQuestionWithDetails extends TestQuestion {
  question: Question & {
    topic: Topic
    category: Category
  }
}

interface TestContentProps {
  user: User
  test: PracticeTest
  testQuestions: TestQuestionWithDetails[]
}

export function TestContent({ user, test, testQuestions }: TestContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(test.completed)
  const [timeElapsed, setTimeElapsed] = useState(test.time_spent_seconds)
  const [flagged, setFlagged] = useState<Set<number>>(new Set())

  // Timer
  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isComplete])

  // Load existing answers
  useEffect(() => {
    const existing: Record<string, string> = {}
    testQuestions.forEach((tq) => {
      if (tq.user_answer) {
        existing[tq.id] = tq.user_answer
      }
    })
    setAnswers(existing)
  }, [testQuestions])

  const currentQuestion = testQuestions[currentIndex]
  const progress = (Object.keys(answers).length / testQuestions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = async (answer: string) => {
    if (isComplete) return

    const questionId = currentQuestion.id
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    setShowExplanation(true)

    // Save answer to database
    const isCorrect = answer === currentQuestion.question.correct_answer
    await supabase
      .from("test_questions")
      .update({
        user_answer: answer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })
      .eq("id", questionId)
  }

  const handleNext = () => {
    setShowExplanation(false)
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setShowExplanation(false)
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleToggleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex)
      } else {
        newSet.add(currentIndex)
      }
      return newSet
    })
  }

  const handleFinish = useCallback(async () => {
    setIsSubmitting(true)

    // Calculate results
    let correct = 0
    testQuestions.forEach((tq) => {
      if (answers[tq.id] === tq.question.correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / testQuestions.length) * 100)

    // Update test record
    await supabase
      .from("practice_tests")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        correct_answers: correct,
        score,
        time_spent_seconds: timeElapsed,
      })
      .eq("id", test.id)

    // Update progress for each topic
    const topicResults: Record<string, { attempted: number; correct: number }> = {}
    testQuestions.forEach((tq) => {
      const topicId = tq.question.topic?.id
      if (topicId) {
        if (!topicResults[topicId]) {
          topicResults[topicId] = { attempted: 0, correct: 0 }
        }
        topicResults[topicId].attempted++
        if (answers[tq.id] === tq.question.correct_answer) {
          topicResults[topicId].correct++
        }
      }
    })

    // Update progress API for each topic
    for (const [topicId, result] of Object.entries(topicResults)) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: topicId,
          questions_attempted: result.attempted,
          questions_correct: result.correct,
        }),
      })
    }

    // Log study session
    await fetch("/api/study-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minutes_studied: Math.ceil(timeElapsed / 60),
        questions_practiced: testQuestions.length,
        topics_covered: [...new Set(testQuestions.map((tq) => tq.question.topic?.id).filter(Boolean))],
      }),
    })

    setIsComplete(true)
    setIsSubmitting(false)
  }, [answers, supabase, test.id, testQuestions, timeElapsed])

  if (isComplete) {
    const correct = testQuestions.filter((tq) => answers[tq.id] === tq.question.correct_answer).length
    const score = Math.round((correct / testQuestions.length) * 100)

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">PrepAI</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= 70 ? "bg-green-500/20" : score >= 50 ? "bg-amber-500/20" : "bg-red-500/20"
              }`}
            >
              {score >= 70 ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-amber-500" />
              )}
            </div>

            <h1 className="text-4xl font-bold mb-2">Test Complete!</h1>
            <p className="text-muted-foreground mb-8">{test.title}</p>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{score}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">
                      {correct}/{testQuestions.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold">{formatTime(timeElapsed)}</p>
                    <p className="text-sm text-muted-foreground">Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link href="/practice">Practice More</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Link>
              </Button>
              <div className="hidden sm:block">
                <p className="font-semibold">{test.title}</p>
                <p className="text-xs text-muted-foreground">
                  Question {currentIndex + 1} of {testQuestions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <Button onClick={handleFinish} disabled={isSubmitting} variant="outline">
                {isSubmitting ? "Submitting..." : "Finish Test"}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Question Navigation Pills */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {testQuestions.map((_, idx) => {
              const isAnswered = !!answers[testQuestions[idx].id]
              const isCurrent = idx === currentIndex
              const isFlagged = flagged.has(idx)

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx)
                    setShowExplanation(false)
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium shrink-0 relative transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isAnswered
                        ? "bg-green-500/20 text-green-600 border border-green-500/30"
                        : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && <Flag className="w-3 h-3 absolute -top-1 -right-1 text-amber-500 fill-amber-500" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Topic Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{currentQuestion.question.category?.name}</Badge>
            {currentQuestion.question.topic && <Badge variant="secondary">{currentQuestion.question.topic.name}</Badge>}
            <Badge variant="outline" className="ml-auto">
              Difficulty: {currentQuestion.question.difficulty}/5
            </Badge>
          </div>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{currentQuestion.question.question_text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["A", "B", "C", "D"].map((option) => {
                const optionKey = `option_${option.toLowerCase()}` as keyof Question
                const optionText = currentQuestion.question[optionKey] as string
                const isSelected = answers[currentQuestion.id] === option
                const isCorrect = option === currentQuestion.question.correct_answer
                const hasAnswered = !!answers[currentQuestion.id]

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-start gap-3 ${
                      hasAnswered
                        ? isCorrect
                          ? "bg-green-500/20 border-2 border-green-500"
                          : isSelected
                            ? "bg-red-500/20 border-2 border-red-500"
                            : "bg-muted/50 border border-border/50"
                        : "bg-muted/50 border border-border/50 hover:bg-accent hover:border-primary/50"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold ${
                        hasAnswered
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : isSelected
                              ? "bg-red-500 text-white"
                              : "bg-muted"
                          : "bg-muted"
                      }`}
                    >
                      {option}
                    </span>
                    <span className="pt-1">{optionText}</span>
                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto shrink-0 mt-1" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0 mt-1" />
                    )}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Explanation */}
          {showExplanation && currentQuestion.question.explanation && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{currentQuestion.question.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleToggleFlag}
              className={flagged.has(currentIndex) ? "text-amber-500" : ""}
            >
              <Flag className={`w-4 h-4 mr-2 ${flagged.has(currentIndex) ? "fill-amber-500" : ""}`} />
              {flagged.has(currentIndex) ? "Flagged" : "Flag"}
            </Button>

            <Button onClick={handleNext} disabled={currentIndex === testQuestions.length - 1}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
