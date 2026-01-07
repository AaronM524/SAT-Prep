import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  // Optional: allow ?next=/somewhere
  const next = url.searchParams.get("next") ?? "/dashboard"

  if (!code) {
    // No code = nothing to exchange
    return NextResponse.redirect(new URL(`/auth/login?error=missing_code`, url.origin))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // Failed exchange (expired / invalid link)
    return NextResponse.redirect(new URL(`/auth/login?error=auth_failed`, url.origin))
  }

  // Success: user is now signed in via cookies
  return NextResponse.redirect(new URL(next, url.origin))
}

