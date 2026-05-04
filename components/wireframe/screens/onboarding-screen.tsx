"use client"

import { useState } from "react"
import { ArrowRight, Compass, Landmark, LoaderCircle, Mountain, Shield, Sparkles, User, Users, UtensilsCrossed, Wallet, X, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingScreenProps {
  userId: string
  initialBudget?: string | null
  initialStyles?: string[]
  onComplete: (preferences: {
    budgetLevel: string
    preferenceMode: string
    travelStyles: string[]
    language: string
  }) => Promise<void> | void
  onClose: () => void
}

const budgetOptions = [
  { id: "economy", label: "Экономно", note: "больше города, меньше чека", icon: Wallet },
  { id: "balanced", label: "Сбалансированно", note: "комфорт без перегруза", icon: Compass },
  { id: "premium", label: "С акцентом на комфорт", note: "лучшие места и короткие решения", icon: Sparkles },
]

const styleOptions = [
  { id: "solo", label: "В одиночку", desc: "путешествие для одного", icon: User },
  { id: "family", label: "Семья", desc: "комфорт для всей семьи", icon: Users },
  { id: "adventure", label: "Приключения", desc: "активный и яркий отдых", icon: Mountain },
  { id: "culture", label: "Культура", desc: "музеи, история и архитектура", icon: Landmark },
  { id: "gastronomy", label: "Гастро", desc: "лучшая еда и локальные вкусы", icon: UtensilsCrossed },
]

const languageOptions = [
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
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
  return values // Теперь ID совпадают с названиями в CRM
}

function fromBudgetLevel(value?: string | null) {
  if (value === "ECONOMY") return "economy"
  if (value === "PREMIUM") return "premium"
  return "balanced"
}

function fromTravelStyles(values?: string[]) {
  if (!values?.length) {
    return []
  }

  return values
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
  const [language, setLanguage] = useState(initialStyles ? "en" : "ru")
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
        travelStyles: styles.length > 0 ? styles : ["adventure", "culture"], // Дефолты только если ничего не выбрано
        language,
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
                "travel-panel flex w-full items-start gap-4 p-4 text-left transition-all relative overflow-hidden",
                budget === option.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-card/50",
              )}
            >
              {budget === option.id && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-md border",
                  budget === option.id ? "border-white/35 bg-white/10" : "border-border bg-muted",
                )}
              >
                <option.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", budget === option.id ? "text-primary" : "text-foreground")}>
                  {option.label}
                </p>
                <p className={cn("mt-1 text-sm", budget === option.id ? "text-primary/70" : "text-muted-foreground")}>
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
                  active ? "border-foreground bg-foreground/5 shadow-sm" : "hover:bg-card/50",
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

      <section className="px-5 py-5 pb-28">
        <div className="mb-3">
          <p className="travel-kicker">Язык</p>
          <h2 className="travel-title text-2xl font-semibold">Язык интерфейса</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {languageOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setLanguage(option.id)}
              className={cn(
                "travel-panel p-4 text-center transition-all",
                language === option.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary/20 text-primary"
                  : "hover:bg-card/50 text-muted-foreground",
              )}
            >
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="h-32" /> {/* Дополнительный отступ, чтобы контент не скрывался под кнопкой */}

      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md px-5 pb-5">
        <div className="travel-panel flex w-full items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Профиль готов</p>
            <p className="text-xs text-muted-foreground">После этого начну собирать маршрут и рекомендации.</p>
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
