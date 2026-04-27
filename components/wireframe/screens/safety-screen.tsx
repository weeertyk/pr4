"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Info, LoaderCircle, Search, Shield } from "lucide-react"
import { BottomNav } from "../bottom-nav"
import { cn } from "@/lib/utils"

interface SafetyScreenProps {
  onTabChange: (tab: "home" | "map" | "safety" | "settings") => void
}

type AreaKey = "center" | "tourist" | "riverside"

type AreaOption = {
  id: AreaKey
  label: string
  lat: number
  lng: number
}

type AreaSafetyData = {
  zone: {
    name: string
    city: string
    risk_level: "SAFE" | "CAUTION" | "AVOID"
    risk_score: number
    reasons: string[]
  } | null
  fallbackTips: string[]
}

const areaOptions: AreaOption[] = [
  { id: "center", label: "Центр", lat: 55.7539, lng: 37.6208 },
  { id: "tourist", label: "Туристический поток", lat: 55.7574, lng: 37.6225 },
  { id: "riverside", label: "Набережная", lat: 55.7449, lng: 37.6052 },
]

function getRiskPresentation(level: "SAFE" | "CAUTION" | "AVOID", score: number) {
  if (level === "SAFE") {
    return {
      label: "Спокойно",
      cardClass: "bg-card text-card-foreground",
      badgeClass: "bg-secondary/55 text-foreground",
      toneClass: "text-emerald-700",
      score,
    }
  }

  if (level === "CAUTION") {
    return {
      label: "Стоит быть внимательнее",
      cardClass: "bg-card text-card-foreground",
      badgeClass: "bg-secondary/55 text-foreground",
      toneClass: "text-emerald-700",
      score,
    }
  }

  return {
    label: "Лучше изменить маршрут",
      cardClass: "bg-card text-card-foreground",
      badgeClass: "bg-secondary/55 text-foreground",
      toneClass: "text-emerald-700",
      score,
  }
}

export function SafetyScreen({ onTabChange }: SafetyScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState<AreaKey>("center")
  const [data, setData] = useState<AreaSafetyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const currentArea = areaOptions.find((area) => area.id === selectedArea) ?? areaOptions[0]

  useEffect(() => {
    let isActive = true

    async function loadAreaSafety() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/safety/area?lat=${currentArea.lat}&lng=${currentArea.lng}`)

        if (!response.ok) {
          throw new Error("Не удалось загрузить данные безопасности района.")
        }

        const json = await response.json()

        if (!isActive) {
          return
        }

        setData({
          zone: json.zone ?? null,
          fallbackTips: json.fallbackTips ?? [],
        })
      } catch (loadError) {
        if (!isActive) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : "Неизвестная ошибка.")
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadAreaSafety()

    return () => {
      isActive = false
    }
  }, [currentArea.lat, currentArea.lng])

  const presentation = getRiskPresentation(data?.zone?.risk_level ?? "SAFE", data?.zone?.risk_score ?? 80)

  const reasons =
    data?.zone?.reasons?.filter((reason) =>
      searchQuery.trim() ? reason.toLowerCase().includes(searchQuery.trim().toLowerCase()) : true,
    ) ?? []

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 pb-3 pt-5">
        <p className="travel-kicker">Сканер безопасности</p>
        <div className="mt-1 flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="travel-title text-3xl font-semibold">Проверка района</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Быстрая сводка по зоне, в которую ты собираешься идти дальше.
        </p>
      </header>

      <section className="px-5 pb-4">
        <div className="travel-panel p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Фильтр по причинам и подсказкам..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-md border border-border bg-background pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section className="px-5 pb-4">
        {isLoading ? (
          <div className="travel-panel flex items-center gap-3 p-5">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <p className="text-sm">Проверяю текущую зону на карте...</p>
          </div>
        ) : error ? (
          <div className="travel-panel p-5">
            <p className="font-semibold">Не удалось получить статус безопасности</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className={cn("travel-panel overflow-hidden", presentation.cardClass)}>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className={cn("rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em]", presentation.badgeClass)}>
                  {currentArea.label}
                </span>
                <span className="text-sm font-medium">{presentation.score}/100</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-current/20 bg-white/8">
                  {data?.zone?.risk_level === "SAFE" ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <AlertTriangle className="h-8 w-8" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="travel-title text-3xl font-semibold">{presentation.label}</h2>
                  <p className="mt-2 text-sm leading-6 opacity-85">
                    {data?.zone?.name ?? `${currentArea.label} без отдельного предупреждения`}
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-current" style={{ width: `${presentation.score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="px-5 pb-4">
        <div className="mb-3">
          <p className="travel-kicker">Районы</p>
          <h3 className="travel-title text-2xl font-semibold">Сценарии по городу</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {areaOptions.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                selectedArea === area.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {area.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pb-4">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="travel-title text-2xl font-semibold">Причины и подсказки</h3>
        </div>
        <div className="space-y-3">
          {reasons.map((reason) => (
            <div key={reason} className="travel-panel p-4 text-sm leading-6">
              {reason}
            </div>
          ))}
          {(data?.fallbackTips ?? []).map((tip) => (
            <div key={tip} className="travel-panel bg-secondary/35 p-4 text-sm leading-6">
              {tip}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-4">
        <button
          onClick={() => setActionMessage("Для MVP экстренная помощь показывает быстрый совет: держитесь освещённых маршрутов и официальных точек транспорта.")}
          className="w-full rounded-md bg-foreground px-4 py-4 text-sm font-semibold text-background transition-opacity hover:opacity-92"
        >
          Экстренная помощь
        </button>
        {actionMessage && <p className="mt-3 text-sm text-muted-foreground">{actionMessage}</p>}
      </section>

      <BottomNav activeTab="safety" onTabChange={onTabChange} />
    </div>
  )
}
