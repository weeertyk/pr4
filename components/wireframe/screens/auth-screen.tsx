"use client"

import { useState } from "react"
import { LoaderCircle, LogIn, UserPlus } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"

interface AuthScreenProps {
  onReady: () => void
}

async function syncProfile(input: { id: string; email: string; name?: string | null }) {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const json = await response.json().catch(() => null)
    throw new Error(json?.error ?? "Не удалось сохранить профиль пользователя.")
  }
}

async function registerAccount(input: { name: string; email: string; password: string }) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const json = await response.json().catch(() => null)
    throw new Error(json?.error ?? "Не удалось зарегистрировать пользователя.")
  }
}

export function AuthScreen({ onReady }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit() {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = getSupabaseBrowserClient()

      if (mode === "register") {
        await registerAccount({
          name: name.trim(),
          email,
          password,
        })

      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (!data.user) {
        throw new Error("Не удалось выполнить вход.")
      }

      await syncProfile({
        id: data.user.id,
        email: data.user.email ?? email,
        name: ((data.user.user_metadata?.name as string | undefined) ?? name.trim()) || null,
      })

      onReady()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Неизвестная ошибка.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="travel-panel overflow-hidden">
        <div
          className="min-h-56 px-5 py-6 text-white"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(18,27,41,0.18), rgba(18,27,41,0.82)), url('/travel-hero.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="travel-kicker text-white/70">Доступ</p>
          <h1 className="travel-title mt-2 text-3xl font-semibold">
            {mode === "login" ? "Войти в AI Travel Companion" : "Создать аккаунт путешественника"}
          </h1>
          <p className="mt-3 max-w-72 text-sm leading-6 text-white/80">
            Сохраняй предпочтения, маршрут дня и состояние поездки в базе данных.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md px-4 py-3 text-sm font-semibold transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground"}`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-md px-4 py-3 text-sm font-semibold transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground"}`}
            >
              Регистрация
            </button>
          </div>

          {mode === "register" && (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Имя</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например, Анна"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="travel@example.com"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </label>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !email.trim() || password.length < 6 || (mode === "register" && !name.trim())}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_18px_rgba(196,104,73,0.26)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>{mode === "login" ? "Войти" : "Создать аккаунт"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
