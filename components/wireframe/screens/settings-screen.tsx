"use client"

import { useState } from "react"
import { Bell, ChevronRight, Globe, HelpCircle, LogOut, Shield, Sparkles, User } from "lucide-react"
import { BottomNav } from "../bottom-nav"

interface SettingsScreenProps {
  profile: {
    email: string
    name: string | null
  } | null
  preferences: {
    budget_level: string
    preference_mode: string
    travel_styles: string[]
    language: string
  } | null
  onTabChange: (tab: "home" | "map" | "safety" | "settings") => void
  onStartOnboarding: () => void
  onSignOut: () => Promise<void> | void
}

function formatMode(value?: string) {
  if (value === "EFFICIENCY") return "Ритм"
  if (value === "EXPLORATION") return "Открытия"
  return "Спокойствие"
}

function formatTravelStyles(values?: string[]) {
  if (!values?.length) {
    return ["Без настроек"]
  }

  return values.map((value) => {
    if (value === "EFFICIENCY") return "Ритм"
    if (value === "EXPLORATION") return "Открытия"
    if (value === "SAFETY") return "Спокойствие"
    return value
  })
}

function formatBudget(value?: string) {
  if (value === "ECONOMY") return "Экономно"
  if (value === "PREMIUM") return "Комфорт"
  return "Сбалансированно"
}

export function SettingsScreen({
  profile,
  preferences,
  onTabChange,
  onStartOnboarding,
  onSignOut,
}: SettingsScreenProps) {
  const [infoMessage, setInfoMessage] = useState("Нажмите на карточку, чтобы открыть связанный раздел или поменять настройки.")
  const settingsGroups = [
    {
      title: "Профиль",
      items: [
        { icon: User, label: "Личные данные", value: profile?.email ?? "email не указан", action: () => setInfoMessage("Профиль синхронизирован с аккаунтом Supabase Auth.") },
        { icon: Globe, label: "Язык и регион", value: `${preferences?.language?.toUpperCase() ?? "RU"} · Европа`, action: onStartOnboarding },
      ],
    },
    {
      title: "Поведение приложения",
      items: [
        { icon: Bell, label: "Уведомления", value: "только важные", action: () => setInfoMessage("Уведомления пока демонстрационные, но кнопка уже связана.") },
        { icon: Shield, label: "Безопасность", value: formatMode(preferences?.preference_mode), action: () => onTabChange("safety") },
      ],
    },
    {
      title: "Поддержка",
      items: [
        { icon: HelpCircle, label: "Помощь и FAQ", value: "основные сценарии", action: () => setInfoMessage("Основные сценарии: карта, безопасность, навигация и восстановление плана.") },
      ],
    },
  ]

  const travelModes = Array.from(
    new Set([
      formatBudget(preferences?.budget_level),
      formatMode(preferences?.preference_mode),
      ...formatTravelStyles(preferences?.travel_styles),
    ]),
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pb-2 pt-5">
        <p className="travel-kicker">Профиль</p>
        <h1 className="travel-title text-3xl font-semibold">Профиль путешествия</h1>
      </header>

      <section className="px-5 py-3">
        <div className="travel-panel overflow-hidden">
          <div
            className="min-h-52 px-5 py-5 text-white"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(19,26,39,0.12), rgba(19,26,39,0.72)), url('/travel-profile.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/35 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/80">
                  Профиль поездки
                </span>
                <button onClick={onStartOnboarding} className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm">
                  Изменить
                </button>
              </div>
              <div>
                <h2 className="travel-title text-3xl font-semibold">{profile?.name ?? "Путешественник"}</h2>
                <p className="mt-2 max-w-56 text-sm leading-6 text-white/80">
                  {profile?.email ?? "Подключите аккаунт, чтобы сохранять маршрут, настройки и состояние поездки."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-2">
        <div className="travel-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="travel-kicker">Предпочтения</p>
              <h3 className="travel-title text-2xl font-semibold">Текущий режим поездки</h3>
            </div>
            <button
              onClick={onStartOnboarding}
              className="rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/55"
            >
              Изменить
            </button>
          </div>
                     <div className="flex flex-wrap gap-2">
             {travelModes.map((mode, index) => (
               <span
                 key={`${mode}-${index}`}
                 className="rounded-full border border-border bg-background px-3 py-2 text-sm"
               >
                 {mode}
               </span>
             ))}
           </div>
          <div className="mt-4 rounded-md bg-secondary/45 px-4 py-3 text-sm text-foreground/85">
            AI-помощник использует эти настройки, чтобы выбирать маршрут, места рядом и тон рекомендаций.
          </div>
          <div className="mt-3 rounded-md border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            {infoMessage}
          </div>
        </div>
      </section>

      <section className="px-5 py-2">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Сводка по настройкам</span>
        </div>
        <div className="space-y-3">
          {settingsGroups.map((group) => (
            <div key={group.title} className="travel-panel overflow-hidden">
              <div className="border-b border-border/70 px-4 py-3">
                <p className="travel-kicker">{group.title}</p>
              </div>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-4">
        <button
          onClick={() => void onSignOut()}
          className="travel-panel flex w-full items-center justify-center gap-2 px-4 py-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="h-5 w-5" />
          Выйти из аккаунта
        </button>
      </section>

      <BottomNav activeTab="settings" onTabChange={onTabChange} />
    </div>
  )
}
