"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  BookOpen,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

const demoSteps = [
  {
    id: 1,
    icon: Target,
    title: "Start with a target",
    description: "Tell PrepAI your goal and test date. We generate a daily plan built around your weakest skills.",
  },
  {
    id: 2,
    icon: Zap,
    title: "Find your weak spots fast",
    description: "A short diagnostic identifies what's holding your score back in Math and Reading/Writing.",
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Practice that adapts to you",
    description: "Questions adjust based on your accuracy and speed. You never waste time on what you already know.",
  },
  {
    id: 4,
    icon: Sparkles,
    title: "Get unstuck instantly",
    description:
      "PrepAI explains answers step-by-step, then gives you a 2-minute lesson and follow-up questions to lock it in.",
  },
  {
    id: 5,
    icon: Calendar,
    title: "A plan you can actually follow",
    description: "Every day you get a 20-minute plan: 2 weak topics, 1 review topic, and 1 timed mini-drill.",
  },
]

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [targetScore, setTargetScore] = useState(1350)
  const [diagnosticProgress, setDiagnosticProgress] = useState(0)
  const [showDiagnosticResults, setShowDiagnosticResults] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [masteryGain, setMasteryGain] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Handle visibility animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(1)
      setDiagnosticProgress(0)
      setShowDiagnosticResults(false)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setMasteryGain(false)
      setCompletedTasks([])
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // Animate diagnostic progress when on step 2
  useEffect(() => {
    if (currentStep === 2 && !showDiagnosticResults) {
      const timer = setInterval(() => {
        setDiagnosticProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer)
            setTimeout(() => setShowDiagnosticResults(true), 300)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [currentStep, showDiagnosticResults])

  // Handle answer selection animation
  useEffect(() => {
    if (selectedAnswer !== null) {
      const timer = setTimeout(() => setShowExplanation(true), 600)
      return () => clearTimeout(timer)
    }
  }, [selectedAnswer])

  // Handle mastery gain animation
  useEffect(() => {
    if (showExplanation && currentStep === 4) {
      const timer = setTimeout(() => setMasteryGain(true), 800)
      return () => clearTimeout(timer)
    }
  }, [showExplanation, currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1)
      setDiagnosticProgress(0)
      setShowDiagnosticResults(false)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setMasteryGain(false)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      setDiagnosticProgress(0)
      setShowDiagnosticResults(false)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setMasteryGain(false)
    }
  }, [currentStep])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handleBack()
    },
    [onClose, handleNext, handleBack],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleKeyDown])

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  if (!isOpen) return null

  const StepIcon = demoSteps[currentStep - 1].icon

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a1628]/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1f3c] to-[#1a0f2e] border border-white/10 shadow-2xl transition-all duration-300 ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-5"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">PrepAI Demo</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-xs text-slate-500">
              <span className="px-2 py-1 rounded bg-white/5">Dashboard</span>
              <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">Practice</span>
              <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">Study Plan</span>
              <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">Progress</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-sm hidden sm:block"
            >
              Skip tour
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              aria-label="Close demo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative px-6 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Step {currentStep} of 5</span>
            <span className="text-xs text-slate-500">{Math.round((currentStep / 5) * 100)}% complete</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <StepIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">Step {currentStep}</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">{demoSteps[currentStep - 1].title}</h2>

              <p className="text-lg text-slate-400 leading-relaxed">{demoSteps[currentStep - 1].description}</p>

              {/* Step indicators */}
              <div className="flex items-center gap-2 pt-4">
                {demoSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step.id === currentStep
                        ? "w-8 bg-gradient-to-r from-blue-500 to-purple-500"
                        : step.id < currentStep
                          ? "w-2 bg-blue-500/50"
                          : "w-2 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right UI panel */}
            <div className="bg-[#0a1628]/80 rounded-2xl border border-white/10 overflow-hidden">
              {/* Step 1: Profile Setup */}
              {currentStep === 1 && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Profile Setup</h3>
                    <span className="text-xs text-slate-500">demo@prepai.com</span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm text-slate-400 block mb-3">Target Score</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="400"
                          max="1600"
                          value={targetScore}
                          onChange={(e) => setTargetScore(Number(e.target.value))}
                          className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500"
                        />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent min-w-[80px] text-right">
                          {targetScore}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Test Date</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-white">March 9, 2025</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Daily Study Goal</label>
                      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-white">20 minutes/day</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                      Save Profile
                    </Button>

                    <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Plan updated successfully!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Diagnostic */}
              {currentStep === 2 && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Quick Diagnostic</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>~5 min</span>
                    </div>
                  </div>

                  {!showDiagnosticResults ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-blue-400">{diagnosticProgress}%</span>
                          </div>
                          <Progress value={diagnosticProgress} className="h-2 bg-white/10" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-xs text-slate-500">Section</span>
                          <p className="text-white font-medium">Reading & Writing</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <span className="text-xs text-slate-500">Questions</span>
                          <p className="text-white font-medium">4 of 10</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {'"'}The author suggests that the phenomenon of urban heat islands...{'"'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="text-center py-2">
                        <span className="text-green-400 text-sm font-medium">Diagnostic Complete!</span>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400 font-medium">Strength</span>
                          </div>
                          <p className="text-white">Data Analysis & Statistics</p>
                        </div>

                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-orange-400 font-medium">Needs Work</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["Linear Equations", "Transitions", "Inference"].map((topic) => (
                              <span key={topic} className="px-2 py-1 bg-white/5 rounded text-sm text-slate-300">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-white/5 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-400">72%</p>
                            <p className="text-xs text-slate-500">Accuracy</p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-xl text-center">
                            <p className="text-2xl font-bold text-purple-400">46s</p>
                            <p className="text-xs text-slate-500">Avg. Time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Practice Question */}
              {currentStep === 3 && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded font-medium">
                        Medium
                      </span>
                      <span className="text-xs text-slate-500">Linear Equations</span>
                    </div>
                    <span className="text-xs text-slate-500">Q3 of 10</span>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-300 leading-relaxed">If 3x + 7 = 22, what is the value of 6x + 14?</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 0, label: "A", value: "30", correct: false },
                      { id: 1, label: "B", value: "44", correct: true },
                      { id: 2, label: "C", value: "15", correct: false },
                      { id: 3, label: "D", value: "22", correct: false },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedAnswer(option.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 ${
                          selectedAnswer === option.id
                            ? option.correct
                              ? "bg-green-500/20 border-green-500/50 text-green-400"
                              : "bg-red-500/20 border-red-500/50 text-red-400"
                            : selectedAnswer !== null && option.correct
                              ? "bg-green-500/20 border-green-500/50 text-green-400"
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            selectedAnswer === option.id
                              ? option.correct
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                              : "bg-white/10"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span>{option.value}</span>
                        {selectedAnswer !== null && option.correct && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>

                  {showExplanation && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">Explanation</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        Notice that 6x + 14 = 2(3x + 7). Since 3x + 7 = 22, we have 6x + 14 = 2(22) = 44.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: AI Explanation */}
              {currentStep === 4 && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-white">AI Breakdown</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">
                          1
                        </span>
                        <span className="text-sm text-slate-400">Recognize the pattern</span>
                      </div>
                      <p className="text-sm text-slate-300 pl-7">6x + 14 is exactly 2 times (3x + 7)</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">
                          2
                        </span>
                        <span className="text-sm text-slate-400">Apply the relationship</span>
                      </div>
                      <p className="text-sm text-slate-300 pl-7">If 3x + 7 = 22, then 2(3x + 7) = 2(22) = 44</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400 font-medium">Rule to Remember</span>
                      </div>
                      <p className="text-sm text-slate-300">
                        When you see expressions that are multiples of each other, multiply the entire equation instead
                        of solving for x first.
                      </p>
                    </div>

                    {masteryGain && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Mastery gained!</span>
                        </div>
                        <span className="text-sm text-green-400 font-bold">+5%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Study Plan */}
              {currentStep === 5 && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Today{"'"}s Plan</h3>
                    <span className="text-xs text-slate-500">20 min total</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 1, topic: "Linear Equations", type: "Weak Area", time: "6 min", color: "orange" },
                      { id: 2, topic: "Transitions", type: "Weak Area", time: "6 min", color: "orange" },
                      { id: 3, topic: "Data Analysis", type: "Review", time: "4 min", color: "green" },
                      { id: 4, topic: "Timed Drill", type: "Speed", time: "4 min", color: "blue" },
                    ].map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 ${
                          completedTasks.includes(task.id)
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {completedTasks.includes(task.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${completedTasks.includes(task.id) ? "text-green-400 line-through" : "text-white"}`}
                          >
                            {task.topic}
                          </p>
                          <p className="text-xs text-slate-500">{task.type}</p>
                        </div>
                        <span className="text-xs text-slate-500">{task.time}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Progress Today</span>
                      <span className="text-sm text-blue-400">{completedTasks.length}/4 tasks</span>
                    </div>
                    <Progress value={(completedTasks.length / 4) * 100} className="h-2 bg-white/10" />
                  </div>

                  <div className="text-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-sm text-slate-400">Projected Score</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      1420
                    </p>
                    <p className="text-xs text-green-400">+70 from current</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between px-6 py-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {currentStep === 5 ? (
              <>
                <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                  Maybe later
                </Button>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" onClick={onClose}>
            <Link href="/auth/sign-up">
                  Get Started Free
                 <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
            </Button>

              </>
            ) : (
              <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
