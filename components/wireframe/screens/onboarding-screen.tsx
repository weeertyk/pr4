"use client"

import { useState } from "react"
import { ArrowRight, Compass, LoaderCircle, Shield, Sparkles, Wallet, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingScreenProps {
  userId: string
  initialBudget?: string | null
  initialStyles?: string[]
  onComplete: (preferences: {
    budgetLevel: string
    preferenceMode: string
    travelStyles: string[]
  }) => Promise<void> | void
  onClose: () => void
}

const budgetOptions = [
  { id: "economy", label: "Экономно", note: "больше города, меньше чека", icon: Wallet },
  { id: "balanced", label: "Сбалансированно", note: "комфорт без перегруза", icon: Compass },
  { id: "premium", label: "С акцентом на комфорт", note: "лучшие места и короткие решения", icon: Sparkles },
]

const styleOptions = [
  { id: "efficiency", label: "Ритм", desc: "маршрут без лишних крюков", icon: ArrowRight },
  { id: "safety", label: "Спокойствие", desc: "проверенные места и безопасные зоны", icon: Shield },
  { id: "exploration", label: "Открытия", desc: "неочевидные места и маленькие находки", icon: Sparkles },
]

function toBudgetLevel(value: string) {
  if (value === "economy") return "ECONOMY"
  if (value === "premium") return "PREMIUM"
  return "BALANCED"
}

function toPreferenceMode(value: string) {
  if (value === "efficiency") return "EFFICIENCY"
  if (value === "exploration") return "EXPLORATION"
  return "SAFETY"
}

function toTravelStyles(values: string[]) {
  return values.map((value) => value.toUpperCase())
}

function fromBudgetLevel(value?: string | null) {
  if (value === "ECONOMY") return "economy"
  if (value === "PREMIUM") return "premium"
  return "balanced"
}

function fromTravelStyles(values?: string[]) {
  if (!values?.length) {
    return ["safety", "exploration"]
  }

  return values
    .map((value) => value.toLowerCase())
    .filter((value) => ["efficiency", "safety", "exploration"].includes(value))
}

export function OnboardingScreen({
  userId,
  initialBudget,
  initialStyles,
  onComplete,
  onClose,
}: OnboardingScreenProps) {
  const [budget, setBudget] = useState(fromBudgetLevel(initialBudget))
  const [styles, setStyles] = useState<string[]>(fromTravelStyles(initialStyles))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStyle = (style: string) => {
    setError(null)
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((value) => value !== style) : [...prev, style],
    )
  }

  async function handleComplete() {
    try {
      setIsSaving(true)
      setError(null)

      const preferenceMode = toPreferenceMode(styles[0] ?? "safety")
      await onComplete({
        budgetLevel: toBudgetLevel(budget),
        preferenceMode,
        travelStyles: toTravelStyles(styles),
      })
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : "Не удалось сохранить настройки.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="travel-kicker">AI Travel Companion</p>
          <h1 className="travel-title mt-1 text-2xl font-semibold">Настроим твой стиль поездки</h1>
        </div>
        <button
          onClick={onClose}
          disabled={isSaving}
          className="rounded-md border border-border bg-card/80 p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <section className="px-5">
        <div
          className="travel-panel overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(22,30,46,0.1), rgba(22,30,46,0.72)), url('/travel-hero.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="min-h-64 px-5 py-5 text-white">
            <div className="mb-16 flex items-center justify-between">
              <span className="rounded-full border border-white/35 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                Шаг 1 из 3
              </span>
              <div className="flex gap-2">
                <span className="h-2.5 w-10 rounded-full bg-white" />
                <span className="h-2.5 w-10 rounded-full bg-white/25" />
                <span className="h-2.5 w-10 rounded-full bg-white/25" />
              </div>
            </div>
            <p className="max-w-56 text-sm leading-6 text-white/80">
              Я подстрою рекомендации под твой темп, бюджет и то, как ты любишь чувствовать город.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="travel-kicker">Бюджет</p>
            <h2 className="travel-title text-2xl font-semibold">Каким должен быть день</h2>
          </div>
          <span className="text-sm text-muted-foreground">подстрою приоритеты рекомендаций</span>
        </div>
        <div className="space-y-3">
          {budgetOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setBudget(option.id)}
              className={cn(
                "travel-panel flex w-full items-start gap-4 p-4 text-left transition-all",
                budget === option.id
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_24px_rgba(196,104,73,0.22)]"
                  : "hover:-translate-y-0.5 hover:bg-card",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-md border",
                  budget === option.id ? "border-white/35 bg-white/10" : "border-border bg-muted",
                )}
              >
                <option.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{option.label}</p>
                <p className={cn("mt-1 text-sm", budget === option.id ? "text-white/80" : "text-muted-foreground")}>
                  {option.note}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="mb-3">
          <p className="travel-kicker">Фокус</p>
          <h2 className="travel-title text-2xl font-semibold">Что важнее в этой поездке</h2>
        </div>
        <div className="space-y-3">
          {styleOptions.map((option) => {
            const active = styles.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => toggleStyle(option.id)}
                className={cn(
                  "travel-panel flex w-full items-center justify-between gap-4 p-4 text-left transition-all",
                  active ? "border-secondary bg-secondary/55" : "hover:-translate-y-0.5 hover:bg-card",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-md border", active ? "border-foreground/15 bg-white/55" : "border-border bg-muted")}>
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-6 w-11 rounded-full border transition-colors",
                    active ? "border-primary bg-primary" : "border-border bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 h-4 w-4 rounded-full transition-all",
                      active ? "ml-5 bg-white" : "ml-0.5 bg-foreground",
                    )}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md px-5 pb-5">
        <div className="travel-panel flex w-full items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Профиль готов</p>
            <p className="text-xs text-muted-foreground">После этого начну собирать маршрут и рекомендации.</p>
            <p className="mt-1 text-[11px] text-muted-foreground">ID пользователя: {userId.slice(0, 8)}</p>
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
          <button
            onClick={handleComplete}
            disabled={isSaving || styles.length === 0}
            className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_18px_rgba(196,104,73,0.26)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Продолжить"}
          </button>
        </div>
      </div>
    </div>
  )
}
