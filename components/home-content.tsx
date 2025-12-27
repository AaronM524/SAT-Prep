"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, ChevronRight, Clock, Brain, BarChart3 } from "lucide-react"
import { DemoModal } from "@/components/demo-modal"

export function HomeContent() {
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a1628]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">PrepAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" asChild>
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 pt-20">
        {/* Background blurs */}
        <div className="absolute w-[450px] h-[450px] bg-blue-500 rounded-full blur-[90px] opacity-25 top-[5%] left-[-8%] animate-pulse" />
        <div className="absolute w-[550px] h-[550px] bg-purple-500 rounded-full blur-[90px] opacity-25 bottom-[-5%] right-[-8%] animate-pulse" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Powered by AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Master the SAT with just{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              20 minutes a day
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Stop wasting hours on practice that doesn&apos;t work. Our AI learns how you learn and creates a
            personalized study plan that actually improves your score.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-lg px-8"
              asChild
            >
              <Link href="/auth/sign-up">
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 bg-transparent"
              onClick={() => setIsDemoOpen(true)}
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "150+", label: "Avg. Score Boost" },
              { value: "10K+", label: "Students" },
              { value: "95%", label: "Success Rate" },
              { value: "24/7", label: "AI Support" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why PrepAI Actually Works</h2>
            <p className="text-xl text-slate-400">Most SAT prep is one-size-fits-all. We&apos;re different.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart AI That Learns You",
                description:
                  "Gets smarter every time you practice. Knows exactly what you struggle with, and gives you more of that.",
              },
              {
                icon: Clock,
                title: "Actually Fits Your Life",
                description:
                  "Just 20 minutes a day. No marathon 4-hour sessions. Study on your commute, lunch break, whenever.",
              },
              {
                icon: BarChart3,
                title: "Real Practice Tests",
                description:
                  "Full-length digital SATs that feel like the real thing. Instant scoring and explanations for every answer.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/15 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-5 blur-3xl" />
            <h2 className="text-4xl font-bold mb-4 relative">Ready to ace the SAT?</h2>
            <p className="text-xl text-slate-400 mb-8 relative">
              Join thousands of students improving their scores right now.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-lg px-8 relative"
              asChild
            >
              <Link href="/auth/sign-up">Start Your Free Trial</Link>
            </Button>
            <p className="text-sm text-slate-500 mt-4 relative">No credit card · Cancel anytime · 7-day free trial</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">PrepAI</span>
          </div>
          <p className="text-sm text-slate-500">© 2025 PrepAI · Made with love for students.</p>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
}
